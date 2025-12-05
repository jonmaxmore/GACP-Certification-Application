/**
 * EventBusService
 * Event-driven architecture using RabbitMQ/Kafka
 * Handles application lifecycle events
 *
 * Events:
 * - application.submitted
 * - document.reviewed
 * - inspection.completed
 * - certificate.issued
 * - payment.completed
 *
 * @module services/eventbus
 * @version 1.0.0
 */

const EventEmitter = require('events');
const logger = require('../utils/logger');

class EventBusService extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      type: config.type || 'rabbitmq', // 'rabbitmq' or 'kafka'
      host: config.host || 'localhost',
      port: config.port || 5672,
      username: config.username || 'guest',
      password: config.password || 'guest',
      vhost: config.vhost || '/',
      exchange: config.exchange || 'gacp.events',
      ...config,
    };

    // Event types
    this.EVENT_TYPES = {
      APPLICATION_SUBMITTED: 'application.submitted',
      APPLICATION_UPDATED: 'application.updated',
      DOCUMENT_REVIEWED: 'document.reviewed',
      INSPECTION_ASSIGNED: 'inspection.assigned',
      INSPECTION_STARTED: 'inspection.started',
      INSPECTION_COMPLETED: 'inspection.completed',
      CERTIFICATE_ISSUED: 'certificate.issued',
      CERTIFICATE_REVOKED: 'certificate.revoked',
      PAYMENT_REQUIRED: 'payment.required',
      PAYMENT_COMPLETED: 'payment.completed',
      APPLICATION_APPROVED: 'application.approved',
      APPLICATION_REJECTED: 'application.rejected',
      JOB_ASSIGNED: 'job.assigned',
      JOB_COMPLETED: 'job.completed',
      DELAY_DETECTED: 'delay.detected',
      SYSTEM_ALERT: 'system.alert',
    };

    this.connection = null;
    this.channel = null;
    this.isConnected = false;
    this.subscribers = new Map();
  }

  /**
   * Initialize connection to message broker
   */
  async connect() {
    try {
      if (this.isConnected) {
        logger.warn('[EventBusService] Already connected');
        return;
      }

      logger.info(`[EventBusService] Connecting to ${this.config.type}...`);

      if (this.config.type === 'rabbitmq') {
        await this._connectRabbitMQ();
      } else if (this.config.type === 'kafka') {
        await this._connectKafka();
      } else {
        throw new Error(`Unsupported event bus type: ${this.config.type}`);
      }

      this.isConnected = true;
      this.emit('connected');
      logger.info('[EventBusService] Connected successfully');
    } catch (error) {
      logger.error('[EventBusService] Connection error:', error);
      throw error;
    }
  }

  /**
   * Connect to RabbitMQ
   * @private
   */
  async _connectRabbitMQ() {
    try {
      const amqp = require('amqplib');

      const connectionString = `amqp://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}${this.config.vhost}`;

      this.connection = await amqp.connect(connectionString);
      this.channel = await this.connection.createChannel();

      // Declare exchange
      await this.channel.assertExchange(this.config.exchange, 'topic', {
        durable: true,
      });

      // Handle connection errors
      this.connection.on('error', err => {
        logger.error('[EventBusService] RabbitMQ connection error:', err);
        this.isConnected = false;
        this.emit('error', err);
      });

      this.connection.on('close', () => {
        logger.warn('[EventBusService] RabbitMQ connection closed');
        this.isConnected = false;
        this.emit('disconnected');
      });

      logger.info('[EventBusService] RabbitMQ connected');
    } catch (error) {
      logger.error('[EventBusService] RabbitMQ connection error:', error);
      throw error;
    }
  }

  /**
   * Connect to Kafka
   * @private
   */
  async _connectKafka() {
    try {
      const { Kafka } = require('kafkajs');

      const kafka = new Kafka({
        clientId: 'gacp-platform',
        brokers: [`${this.config.host}:${this.config.port}`],
      });

      this.producer = kafka.producer();
      this.consumer = kafka.consumer({ groupId: 'gacp-consumer-group' });

      await this.producer.connect();
      await this.consumer.connect();

      logger.info('[EventBusService] Kafka connected');
    } catch (error) {
      logger.error('[EventBusService] Kafka connection error:', error);
      throw error;
    }
  }

  /**
   * Publish an event
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   * @param {Object} options - Publish options
   */
  async publish(eventType, data, options = {}) {
    try {
      if (!this.isConnected) {
        throw new Error('Event bus not connected');
      }

      // Validate event type
      if (!Object.values(this.EVENT_TYPES).includes(eventType)) {
        logger.warn(`[EventBusService] Unknown event type: ${eventType}`);
      }

      const event = {
        type: eventType,
        data,
        timestamp: new Date().toISOString(),
        eventId: this._generateEventId(),
        ...options,
      };

      logger.info(`[EventBusService] Publishing event: ${eventType}`);

      if (this.config.type === 'rabbitmq') {
        await this._publishRabbitMQ(eventType, event);
      } else if (this.config.type === 'kafka') {
        await this._publishKafka(eventType, event);
      }

      this.emit('event:published', { eventType, event });

      return event;
    } catch (error) {
      logger.error('[EventBusService] Publish error:', error);
      throw error;
    }
  }

  /**
   * Publish event to RabbitMQ
   * @private
   */
  async _publishRabbitMQ(eventType, event) {
    const message = Buffer.from(JSON.stringify(event));

    this.channel.publish(this.config.exchange, eventType, message, {
      persistent: true,
      contentType: 'application/json',
      timestamp: Date.now(),
    });

    logger.debug(`[EventBusService] RabbitMQ message published: ${eventType}`);
  }

  /**
   * Publish event to Kafka
   * @private
   */
  async _publishKafka(eventType, event) {
    await this.producer.send({
      topic: eventType,
      messages: [
        {
          key: event.eventId,
          value: JSON.stringify(event),
        },
      ],
    });

    logger.debug(`[EventBusService] Kafka message published: ${eventType}`);
  }

  /**
   * Subscribe to an event
   * @param {string|Array<string>} eventTypes - Event type(s) to subscribe to
   * @param {Function} handler - Event handler function
   * @param {Object} options - Subscribe options
   */
  async subscribe(eventTypes, handler, options = {}) {
    try {
      if (!this.isConnected) {
        throw new Error('Event bus not connected');
      }

      const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

      logger.info(`[EventBusService] Subscribing to: ${types.join(', ')}`);

      if (this.config.type === 'rabbitmq') {
        await this._subscribeRabbitMQ(types, handler, options);
      } else if (this.config.type === 'kafka') {
        await this._subscribeKafka(types, handler, options);
      }

      // Store subscriber
      const subscriberId = this._generateSubscriberId();
      this.subscribers.set(subscriberId, { eventTypes: types, handler, options });

      return subscriberId;
    } catch (error) {
      logger.error('[EventBusService] Subscribe error:', error);
      throw error;
    }
  }

  /**
   * Subscribe to RabbitMQ events
   * @private
   */
  async _subscribeRabbitMQ(eventTypes, handler, options) {
    // Create queue
    const queueName = options.queueName || `gacp.queue.${this._generateQueueId()}`;
    const { queue } = await this.channel.assertQueue(queueName, {
      durable: true,
      autoDelete: options.autoDelete || false,
    });

    // Bind queue to event types
    for (const eventType of eventTypes) {
      await this.channel.bindQueue(queue, this.config.exchange, eventType);
    }

    // Consume messages
    await this.channel.consume(
      queue,
      async msg => {
        if (!msg) {
          return;
        }

        try {
          const event = JSON.parse(msg.content.toString());
          logger.debug(`[EventBusService] Received event: ${event.type}`);

          // Call handler
          await handler(event);

          // Acknowledge message
          this.channel.ack(msg);
        } catch (error) {
          logger.error('[EventBusService] Handler error:', error);

          // Reject and requeue if error
          this.channel.nack(msg, false, true);
        }
      },
      { noAck: false },
    );

    logger.info(`[EventBusService] RabbitMQ subscribed to queue: ${queue}`);
  }

  /**
   * Subscribe to Kafka events
   * @private
   */
  async _subscribeKafka(eventTypes, handler, _options) {
    // Subscribe to topics
    for (const eventType of eventTypes) {
      await this.consumer.subscribe({ topic: eventType });
    }

    // Run consumer
    await this.consumer.run({
      eachMessage: async ({ _topic, _partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          logger.debug(`[EventBusService] Received event: ${event.type}`);

          // Call handler
          await handler(event);
        } catch (error) {
          logger.error('[EventBusService] Handler error:', error);
        }
      },
    });

    logger.info(`[EventBusService] Kafka subscribed to topics: ${eventTypes.join(', ')}`);
  }

  /**
   * Unsubscribe from events
   * @param {string} subscriberId - Subscriber ID
   */
  async unsubscribe(subscriberId) {
    try {
      if (!this.subscribers.has(subscriberId)) {
        throw new Error(`Subscriber not found: ${subscriberId}`);
      }

      // Remove subscriber
      this.subscribers.delete(subscriberId);

      logger.info(`[EventBusService] Unsubscribed: ${subscriberId}`);
    } catch (error) {
      logger.error('[EventBusService] Unsubscribe error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from message broker
   */
  async disconnect() {
    try {
      logger.info('[EventBusService] Disconnecting...');

      if (this.config.type === 'rabbitmq' && this.connection) {
        await this.channel.close();
        await this.connection.close();
      } else if (this.config.type === 'kafka') {
        await this.producer.disconnect();
        await this.consumer.disconnect();
      }

      this.isConnected = false;
      this.emit('disconnected');
      logger.info('[EventBusService] Disconnected');
    } catch (error) {
      logger.error('[EventBusService] Disconnect error:', error);
      throw error;
    }
  }

  /**
   * Generate unique event ID
   * @private
   */
  _generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique subscriber ID
   * @private
   */
  _generateSubscriberId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique queue ID
   * @private
   */
  _generateQueueId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      type: this.config.type,
      host: this.config.host,
      subscriberCount: this.subscribers.size,
    };
  }

  /**
   * Publish application submitted event
   */
  async publishApplicationSubmitted(data) {
    return await this.publish(this.EVENT_TYPES.APPLICATION_SUBMITTED, data);
  }

  /**
   * Publish document reviewed event
   */
  async publishDocumentReviewed(data) {
    return await this.publish(this.EVENT_TYPES.DOCUMENT_REVIEWED, data);
  }

  /**
   * Publish inspection completed event
   */
  async publishInspectionCompleted(data) {
    return await this.publish(this.EVENT_TYPES.INSPECTION_COMPLETED, data);
  }

  /**
   * Publish certificate issued event
   */
  async publishCertificateIssued(data) {
    return await this.publish(this.EVENT_TYPES.CERTIFICATE_ISSUED, data);
  }

  /**
   * Publish payment completed event
   */
  async publishPaymentCompleted(data) {
    return await this.publish(this.EVENT_TYPES.PAYMENT_COMPLETED, data);
  }
}

module.exports = EventBusService;
