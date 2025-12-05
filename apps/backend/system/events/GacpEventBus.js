/**
 * Event Bus System
 *
 * Purpose: จัดการการสื่อสารแบบ asynchronous ระหว่าง modules
 *
 * Event Flow Architecture:
 * 1. Publisher → Event Bus → Subscribers
 * 2. Event Persistence for reliability
 * 3. Event Retry mechanisms
 * 4. Event Monitoring and Analytics
 * 5. Error Handling and Dead Letter Queue
 *
 * Event Types:
 * - Domain Events (Application, User, Document, etc.)
 * - System Events (Health, Performance, Errors)
 * - Integration Events (External system communication)
 * - Notification Events (User communications)
 */

const logger = require('../../shared/logger/logger');
const EventEmitter = require('events');

class GACPEventBus extends EventEmitter {
  constructor({ persistenceService, monitoringService, configService, auditService }) {
    super();

    this.persistenceService = persistenceService;
    this.monitoringService = monitoringService;
    this.configService = configService;
    this.auditService = auditService;

    // Event management
    this.eventRegistry = new Map();
    this.subscribers = new Map();
    this.eventHistory = new Map();
    this.retryQueues = new Map();
    this.deadLetterQueue = [];

    // Performance tracking
    this.metrics = {
      eventsPublished: 0,
      eventsProcessed: 0,
      eventsFailed: 0,
      averageProcessingTime: 0,
    };

    // Configuration
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      deadLetterThreshold: 10,
      enablePersistence: true,
      enableMonitoring: true,
    };

    this._initializeEventBus();
    logger.info('📡 GACP Event Bus initialized');
  }

  /**
   * Publish event to the bus
   * @param {string} eventType - Type of event
   * @param {Object} payload - Event payload
   * @param {Object} options - Publishing options
   */
  async publish(eventType, payload = {}, options = {}) {
    let event; // Declare event outside try block to be accessible in catch
    try {
      const eventId = this._generateEventId();
      const timestamp = new Date();

      event = {
        id: eventId,
        type: eventType,
        payload,
        timestamp,
        source: options.source || 'GACP_SYSTEM',
        version: options.version || '1.0',
        correlationId: options.correlationId || this._generateCorrelationId(),
        metadata: {
          ...options.metadata,
          publishedAt: timestamp,
          retryCount: 0,
        },
      };

      logger.info(`📤 Publishing event: ${eventType} (${eventId});`);

      // Validate event structure
      this._validateEvent(event);

      // Persist event if enabled
      if (this.config.enablePersistence && this.persistenceService) {
        await this.persistenceService.saveEvent(event);
      }

      // Update metrics
      this.metrics.eventsPublished++;

      // Store in history
      this._addToHistory(event);

      // Emit to subscribers
      const processingStart = Date.now();
      await this._processEvent(event);

      const processingTime = Date.now() - processingStart;
      this._updateProcessingMetrics(processingTime);

      // Monitor event
      if (this.config.enableMonitoring && this.monitoringService) {
        await this.monitoringService.trackEvent(event, processingTime);
      }

      logger.info(`✅ Event published successfully: ${eventType} (${eventId});`);
      return eventId;
    } catch (error) {
      logger.error(`❌ Failed to publish event: ${eventType}`, error);
      this.metrics.eventsFailed++;

      // Add to retry queue
      await this._handleEventError(event || { type: eventType, payload }, error);
      throw error;
    }
  }

  /**
   * Subscribe to events
   * @param {string} eventType - Event type to subscribe to
   * @param {Function} handler - Event handler function
   * @param {Object} options - Subscription options
   */
  subscribe(eventType, handler, options = {}) {
    try {
      const subscriptionId = this._generateSubscriptionId();

      const subscription = {
        id: subscriptionId,
        eventType,
        handler,
        options: {
          priority: options.priority || 'NORMAL',
          retryOnError: options.retryOnError !== false,
          timeout: options.timeout || 30000,
          filter: options.filter,
          transform: options.transform,
        },
        subscribedAt: new Date(),
        processedCount: 0,
        errorCount: 0,
      };

      // Register subscription
      if (!this.subscribers.has(eventType)) {
        this.subscribers.set(eventType, []);
      }
      this.subscribers.get(eventType).push(subscription);

      // Sort by priority
      this._sortSubscriptionsByPriority(eventType);

      logger.info(`📥 Subscribed to ${eventType} (${subscriptionId});`);
      return subscriptionId;
    } catch (error) {
      logger.error(`❌ Failed to subscribe to event: ${eventType}`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from events
   * @param {string} subscriptionId - Subscription ID to remove
   */
  unsubscribe(subscriptionId) {
    try {
      for (const [eventType, subscriptions] of this.subscribers) {
        const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
        if (index !== -1) {
          subscriptions.splice(index, 1);
          logger.info(`📤 Unsubscribed: ${subscriptionId} from ${eventType}`);
          return true;
        }
      }

      logger.warn(`⚠️ Subscription not found: ${subscriptionId}`);
      return false;
    } catch (error) {
      logger.error(`❌ Failed to unsubscribe: ${subscriptionId}`, error);
      throw error;
    }
  }

  /**
   * Process event and notify subscribers
   */
  async _processEvent(event) {
    const subscribers = this.subscribers.get(event.type) || [];

    if (subscribers.length === 0) {
      logger.warn(`⚠️ No subscribers for event: ${event.type}`);
      return;
    }

    logger.info(`🔄 Processing event ${event.type} for ${subscribers.length} subscribers`);

    const processingPromises = subscribers.map(subscription =>
      this._processSubscription(event, subscription),
    );

    // Wait for all subscribers to process (with error isolation)
    const results = await Promise.allSettled(processingPromises);

    // Handle any failures
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      console.error(
        `❌ ${failures.length}/${subscribers.length} subscribers failed for event: ${event.type}`,
      );

      failures.forEach((failure, index) => {
        const subscription = subscribers[index];
        logger.error(`❌ Subscriber ${subscription.id} failed:`, failure.reason);
      });
    }

    this.metrics.eventsProcessed++;
  }

  /**
   * Process individual subscription
   */
  async _processSubscription(event, subscription) {
    try {
      const startTime = Date.now();

      // Apply filter if specified
      if (subscription.options.filter && !subscription.options.filter(event)) {
        logger.info(`🔍 Event filtered out for subscription: ${subscription.id}`);
        return;
      }

      // Apply transform if specified
      let processedEvent = event;
      if (subscription.options.transform) {
        processedEvent = subscription.options.transform(event);
      }

      // Execute handler with timeout
      await this._executeWithTimeout(
        subscription.handler,
        [processedEvent],
        subscription.options.timeout,
      );

      subscription.processedCount++;

      const processingTime = Date.now() - startTime;
      logger.info(`✅ Subscription processed: ${subscription.id} (${processingTime}ms);`);
    } catch (error) {
      subscription.errorCount++;
      logger.error(`❌ Subscription error: ${subscription.id}`, error);

      // Retry logic
      if (subscription.options.retryOnError && event.metadata.retryCount < this.config.maxRetries) {
        await this._retrySubscription(event, subscription, error);
      } else {
        await this._handleSubscriptionFailure(event, subscription, error);
      }

      throw error; // Re-throw to be caught by Promise.allSettled
    }
  }

  /**
   * Execute function with timeout
   */
  async _executeWithTimeout(fn, args, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Subscription handler timeout after ${timeout}ms`));
      }, timeout);

      Promise.resolve(fn(...args))
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Retry failed subscription
   */
  async _retrySubscription(event, subscription, error) {
    try {
      console.log(
        `🔄 Retrying subscription: ${subscription.id} (attempt ${event.metadata.retryCount + 1})`,
      );

      // Update retry count
      event.metadata.retryCount++;
      event.metadata.lastError = error.message;
      event.metadata.lastRetryAt = new Date();

      // Add delay before retry
      await this._delay(this.config.retryDelay * event.metadata.retryCount);

      // Retry processing
      await this._processSubscription(event, subscription);
    } catch (retryError) {
      logger.error(`❌ Retry failed for subscription: ${subscription.id}`, retryError);

      if (event.metadata.retryCount >= this.config.maxRetries) {
        await this._handleSubscriptionFailure(event, subscription, retryError);
      }
    }
  }

  /**
   * Handle subscription failure
   */
  async _handleSubscriptionFailure(event, subscription, error) {
    logger.error(`💀 Subscription permanently failed: ${subscription.id}`, error);

    // Add to dead letter queue
    this.deadLetterQueue.push({
      event,
      subscription: subscription.id,
      error: error.message,
      failedAt: new Date(),
    });

    // Audit the failure
    if (this.auditService) {
      await this.auditService.logSystemError({
        event: 'EVENT_SUBSCRIPTION_FAILED',
        eventType: event.type,
        subscriptionId: subscription.id,
        error: error.message,
        severity: 'HIGH',
        timestamp: new Date(),
      });
    }

    // Clean up dead letter queue if too large
    if (this.deadLetterQueue.length > this.config.deadLetterThreshold) {
      await this._processDeadLetterQueue();
    }
  }

  /**
   * Handle event publishing errors
   */
  async _handleEventError(event, error) {
    logger.error(`❌ Event processing error: ${event.type}`, error);

    // Add to retry queue if retries are available
    if (event.metadata && event.metadata.retryCount < this.config.maxRetries) {
      const retryId = this._generateRetryId();

      if (!this.retryQueues.has(event.type)) {
        this.retryQueues.set(event.type, []);
      }

      this.retryQueues.get(event.type).push({
        id: retryId,
        event,
        error: error.message,
        scheduledFor: new Date(Date.now() + this.config.retryDelay),
        attempts: event.metadata.retryCount || 0,
      });

      logger.info(`🔄 Event added to retry queue: ${event.type} (${retryId});`);
    }
  }

  /**
   * Process retry queue
   */
  async processRetryQueue() {
    try {
      logger.info('🔄 Processing retry queues...');

      for (const [eventType, retryItems] of this.retryQueues) {
        const readyItems = retryItems.filter(item => item.scheduledFor <= new Date());

        for (const item of readyItems) {
          try {
            // Update retry count
            item.event.metadata.retryCount = item.attempts + 1;

            // Retry publishing
            await this.publish(item.event.type, item.event.payload, {
              ...item.event.metadata,
              correlationId: item.event.correlationId,
            });

            // Remove from retry queue
            this._removeFromRetryQueue(eventType, item.id);

            logger.info(`✅ Retry successful: ${item.event.type} (${item.id});`);
          } catch (error) {
            logger.error(`❌ Retry failed: ${item.event.type} (${item.id});`, error);

            item.attempts++;
            if (item.attempts >= this.config.maxRetries) {
              // Move to dead letter queue
              this.deadLetterQueue.push({
                event: item.event,
                error: error.message,
                failedAt: new Date(),
                totalAttempts: item.attempts,
              });

              this._removeFromRetryQueue(eventType, item.id);
            } else {
              // Reschedule retry
              item.scheduledFor = new Date(Date.now() + this.config.retryDelay * item.attempts);
            }
          }
        }
      }
    } catch (error) {
      logger.error('❌ Retry queue processing failed:', error);
    }
  }

  /**
   * Get event bus statistics
   */
  getStatistics() {
    return {
      metrics: { ...this.metrics },
      subscriptions: {
        totalSubscribers: Array.from(this.subscribers.values()).reduce(
          (sum, subs) => sum + subs.length,
          0,
        ),
        subscribersByEvent: Object.fromEntries(
          Array.from(this.subscribers.entries()).map(([event, subs]) => [event, subs.length]),
        ),
      },
      queues: {
        retryQueueSize: Array.from(this.retryQueues.values()).reduce(
          (sum, items) => sum + items.length,
          0,
        ),
        deadLetterQueueSize: this.deadLetterQueue.length,
      },
      history: {
        totalEvents: this.eventHistory.size,
        recentEvents: Array.from(this.eventHistory.values()).slice(-10),
      },
    };
  }

  /**
   * Initialize event bus
   */
  _initializeEventBus() {
    // Set max listeners to handle many subscribers
    this.setMaxListeners(1000);

    // Start retry queue processor
    setInterval(() => {
      this.processRetryQueue();
    }, 5000); // Process every 5 seconds

    // Start metrics collection
    setInterval(() => {
      this._collectMetrics();
    }, 60000); // Collect every minute
  }

  /**
   * Validate event structure
   */
  _validateEvent(event) {
    const requiredFields = ['id', 'type', 'payload', 'timestamp'];

    for (const field of requiredFields) {
      if (!event[field]) {
        throw new Error(`Event missing required field: ${field}`);
      }
    }

    if (typeof event.type !== 'string' || event.type.trim() === '') {
      throw new Error('Event type must be a non-empty string');
    }
  }

  /**
   * Helper methods
   */
  _generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _generateCorrelationId() {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _generateRetryId() {
    return `retry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _addToHistory(event) {
    this.eventHistory.set(event.id, {
      id: event.id,
      type: event.type,
      timestamp: event.timestamp,
      source: event.source,
      correlationId: event.correlationId,
    });

    // Keep only last 1000 events
    if (this.eventHistory.size > 1000) {
      const firstKey = this.eventHistory.keys().next().value;
      this.eventHistory.delete(firstKey);
    }
  }

  _sortSubscriptionsByPriority(eventType) {
    const subscriptions = this.subscribers.get(eventType);
    if (!subscriptions) {
      return;
    }

    const priorityOrder = { HIGH: 3, NORMAL: 2, LOW: 1 };

    subscriptions.sort((a, b) => {
      const aPriority = priorityOrder[a.options.priority] || 2;
      const bPriority = priorityOrder[b.options.priority] || 2;
      return bPriority - aPriority;
    });
  }

  _updateProcessingMetrics(processingTime) {
    const currentAvg = this.metrics.averageProcessingTime;
    const processedCount = this.metrics.eventsProcessed;

    this.metrics.averageProcessingTime =
      (currentAvg * (processedCount - 1) + processingTime) / processedCount;
  }

  _removeFromRetryQueue(eventType, retryId) {
    const queue = this.retryQueues.get(eventType);
    if (queue) {
      const index = queue.findIndex(item => item.id === retryId);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    }
  }

  async _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async _collectMetrics() {
    if (this.monitoringService) {
      await this.monitoringService.recordMetrics(this.metrics);
    }
  }

  async _processDeadLetterQueue() {
    // Implementation for processing dead letter queue
    // Could involve manual review, alternative processing, etc.
    logger.info(`🚨 Dead letter queue size: ${this.deadLetterQueue.length}`);
  }
}

module.exports = GACPEventBus;
