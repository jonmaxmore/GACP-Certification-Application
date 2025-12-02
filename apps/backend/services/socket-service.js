/**
 * Socket.IO Service
 *
 * Manages real-time communication with standardized channels,
 * authentication, and horizontal scaling via Redis.
 */
const socketIo = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const jwt = require('jsonwebtoken');
const logger = require('../shared/logger');
const metrics = require('../shared/metrics');
const configManager = require('../config/config-manager');
const socketLogger = logger.createLogger('socket');

let io;

/**
 * Initialize Socket.IO server
 *
 * @param {Object} server - HTTP server instance
 * @param {Object} redisManager - Redis connection manager
 * @returns {Object} Socket.IO instance
 */
function initialize(server, redisManager) {
  const config = configManager.getConfig();

  // Create Socket.IO instance
  io = socketIo(server, {
    cors: {
      origin: config.server.cors?.allowedOrigins ||
        process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
      methods: config.server.cors?.allowedMethods || ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Setup Redis adapter for horizontal scaling if Redis is enabled
  if (config.redis && config.redis.enabled) {
    try {
      const redisClient = redisManager.getClient();
      const pubClient = redisClient;
      const subClient = redisClient.duplicate();
      io.adapter(createAdapter(pubClient, subClient));
      socketLogger.info('Socket.IO configured with Redis adapter for horizontal scaling');
    } catch (err) {
      socketLogger.error('Failed to setup Redis adapter:', err);
    }
  }

  // Middleware for authentication and tracking
  io.use(authenticate);

  // Handle connections
  io.on('connection', handleConnection);

  return io;
}

/**
 * Authentication middleware
 */
async function authenticate(socket, next) {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      // Allow unauthenticated connections with limited access
      socket.auth = { authenticated: false };
      return next();
    }

    const config = configManager.getConfig();
    const decoded = jwt.verify(token, config.auth.jwtSecret);

    // Attach user data to socket for later use
    socket.auth = {
      authenticated: true,
      user: decoded,
    };

    socketLogger.debug(`Socket authenticated for user ${decoded.id}`);
    next();
  } catch (err) {
    socketLogger.warn('Socket authentication failed:', err);
    socket.auth = { authenticated: false };
    next();
  }
}

/**
 * Handle new socket connection
 */
function handleConnection(socket) {
  const userId = socket.auth.authenticated ? socket.auth.user.id : 'guest';
  socketLogger.info(`Client connected: ${socket.id} (User: ${userId})`);

  // Track metrics
  metrics.recordSocketEvent('connection');

  // Setup user-specific channel if authenticated
  if (socket.auth.authenticated) {
    const user = socket.auth.user;
    socket.join(`user:${user.id}`);

    // Join role-based channels
    if (user.roles && Array.isArray(user.roles)) {
      user.roles.forEach(role => {
        socket.join(`role:${role}`);
      });
    }
  }

  // Handle channel subscription
  socket.on('subscribe', (channel, callback) => {
    handleSubscription(socket, channel, callback);
  });

  // Handle inspector channel subscription
  socket.on('join-inspector-channel', inspectorId => {
    if (
      socket.auth.authenticated &&
      (socket.auth.user.id === inspectorId || socket.auth.user.roles.includes('admin'))
    ) {
      socket.join(`inspector:${inspectorId}`);
      socketLogger.info(`Inspector ${inspectorId} joined their notification channel`);
    } else {
      socketLogger.warn(`Unauthorized attempt to join inspector channel: ${inspectorId}`);
    }
  });

  // Handle farm channel subscription
  socket.on('join-farm-channel', farmId => {
    // In a real implementation, we'd verify that the user has access to this farm
    socket.join(`farm:${farmId}`);
    socketLogger.info(`Client ${socket.id} joined farm channel: ${farmId}`);
  });

  // Handle admin channel
  socket.on('join-admin-channel', () => {
    if (socket.auth.authenticated && socket.auth.user.roles.includes('admin')) {
      socket.join('admin-channel');
      socketLogger.info(`Admin ${socket.auth.user.id} joined admin channel`);
    } else {
      socketLogger.warn(`Unauthorized attempt to join admin channel: ${socket.id}`);
    }
  });

  // Handle client events
  socket.on('client-event', data => {
    socketLogger.debug(`Received client event from ${socket.id}`, data);
    metrics.recordSocketEvent('message_received');
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    socketLogger.info(`Client disconnected: ${socket.id}`);
    metrics.recordSocketEvent('disconnect');
  });
}

/**
 * Handle channel subscription
 */
function handleSubscription(socket, channel, callback) {
  // Validate channel name
  if (!channel || typeof channel !== 'string') {
    if (typeof callback === 'function') {
      callback({ success: false, error: 'Invalid channel name' });
    }
    return;
  }

  // Restrict access to secured channels
  if (channel.startsWith('secure:') && !socket.auth.authenticated) {
    socketLogger.warn(`Unauthorized attempt to subscribe to ${channel} by ${socket.id}`);
    if (typeof callback === 'function') {
      callback({ success: false, error: 'Authentication required' });
    }
    return;
  }

  // Join the channel
  socket.join(channel);
  socketLogger.debug(`Client ${socket.id} subscribed to channel: ${channel}`);

  if (typeof callback === 'function') {
    callback({ success: true });
  }
}

/**
 * Emit event to specific users
 *
 * @param {string|array} userIds - User ID or array of user IDs
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
function emitToUsers(userIds, event, data) {
  const ids = Array.isArray(userIds) ? userIds : [userIds];

  ids.forEach(userId => {
    io.to(`user:${userId}`).emit(event, data);
  });

  metrics.recordSocketEvent('message_sent');
  socketLogger.debug(`Emitted ${event} to users: ${ids.join(', ')}`);
}

/**
 * Emit event to users with specific role
 *
 * @param {string} role - Role name
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
function emitToRole(role, event, data) {
  io.to(`role:${role}`).emit(event, data);
  metrics.recordSocketEvent('message_sent');
  socketLogger.debug(`Emitted ${event} to role: ${role}`);
}

/**
 * Emit event to all connected clients
 *
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
function emitToAll(event, data) {
  io.emit(event, data);
  metrics.recordSocketEvent('message_sent');
  socketLogger.debug(`Emitted ${event} to all clients`);
}

/**
 * Emit event to specific farm channel
 *
 * @param {string} farmId - Farm ID
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
function emitToFarm(farmId, event, data) {
  io.to(`farm:${farmId}`).emit(event, data);
  metrics.recordSocketEvent('message_sent');
  socketLogger.debug(`Emitted ${event} to farm: ${farmId}`);
}

module.exports = {
  initialize,
  emitToUsers,
  emitToRole,
  emitToAll,
  emitToFarm,
  getIo: () => io,
};
