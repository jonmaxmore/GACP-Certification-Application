/**
 * Application Workflow Module Export
 *
 * Main module export file that provides a complete application workflow system.
 * Implements dependency injection pattern for clean architecture.
 *
 * Module Structure:
 * - Domain Layer: State Machine, Workflow Engine
 * - Application Layer: Use Cases, Services
 * - Infrastructure Layer: Repository, Models
 * - Presentation Layer: Controllers, Routes
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

// Domain Layer
const ApplicationStateMachine = require('./domain/StateMachine');
const ApplicationWorkflowEngine = require('./domain/WorkflowEngine');

// Infrastructure Layer
const ApplicationRepository = require('./infrastructure/repositories/ApplicationRepository');
const Application = require('./infrastructure/models/Application');

// Presentation Layer
const ApplicationController = require('./presentation/controllers/ApplicationController');
const {
  createApplicationRoutes,
  routeDocumentation,
} = require('./presentation/routes/pplication-routes.routes');

/**
 * Application Workflow Module Factory
 * Creates and configures the complete application workflow system
 *
 * @param {Object} dependencies - External dependencies
 * @returns {Object} - Configured module components
 */
function createApplicationWorkflowModule(dependencies = {}) {
  // Initialize repository
  const applicationRepository = new ApplicationRepository();

  // Initialize workflow engine with dependencies
  const workflowEngine = new ApplicationWorkflowEngine({
    applicationRepository,
    userRepository: dependencies.userRepository,
    documentRepository: dependencies.documentRepository,
    notificationService: dependencies.notificationService,
    paymentService: dependencies.paymentService,
    auditService: dependencies.auditService,
    jobTicketService: dependencies.jobTicketService,
    certificateService: dependencies.certificateService,
  });

  // Initialize controller
  const applicationController = new ApplicationController({
    workflowEngine,
    applicationRepository,
  });

  // Create routes
  const applicationRoutes = createApplicationRoutes({
    workflowEngine,
    applicationRepository,
    applicationController,
  });

  return {
    // Core Components
    stateMachine: new ApplicationStateMachine(),
    workflowEngine,
    repository: applicationRepository,
    model: Application,
    controller: applicationController,
    routes: applicationRoutes,

    // Services
    services: {
      createApplication: (applicationData, farmerId) =>
        workflowEngine.createApplication(applicationData, farmerId),

      submitApplication: (applicationId, userId) =>
        workflowEngine.submitApplication(applicationId, userId),

      approveForPayment: (applicationId, reviewerId, reviewData) =>
        workflowEngine.approveForPayment(applicationId, reviewerId, reviewData),

      requestRevision: (applicationId, reviewerId, revisionData) =>
        workflowEngine.requestRevision(applicationId, reviewerId, revisionData),

      scheduleInspection: (applicationId, inspectorId, scheduleData) =>
        workflowEngine.scheduleInspection(applicationId, inspectorId, scheduleData),

      completeInspection: (applicationId, inspectorId, inspectionReport) =>
        workflowEngine.completeInspection(applicationId, inspectorId, inspectionReport),

      finalApproval: (applicationId, adminId, approvalData) =>
        workflowEngine.finalApproval(applicationId, adminId, approvalData),

      rejectApplication: (applicationId, userId, rejectionData) =>
        workflowEngine.rejectApplication(applicationId, userId, rejectionData),

      getWorkflowStatus: applicationId => workflowEngine.getWorkflowStatus(applicationId),

      confirmPayment: (applicationId, paymentData) =>
        workflowEngine.confirmPayment(applicationId, paymentData),
    },

    // Queries
    queries: {
      findById: (id, options) => applicationRepository.findById(id, options),
      findByFarmerId: (farmerId, options) =>
        applicationRepository.findByFarmerId(farmerId, options),
      findByStatus: (status, options) => applicationRepository.findByStatus(status, options),
      findRequiringAction: (role, options) =>
        applicationRepository.findRequiringAction(role, options),
      findExpired: options => applicationRepository.findExpired(options),
      getDashboardStats: filters => applicationRepository.getDashboardStats(filters),
      search: (filters, options) => applicationRepository.findWithPagination(filters, options),
    },

    // Utilities
    utils: {
      validateTransition: (application, toState, userRole, context) =>
        new ApplicationStateMachine().validateTransition(application, toState, userRole, context),

      getStateMetadata: state => new ApplicationStateMachine().getStateMetadata(state),

      isPaymentState: state => new ApplicationStateMachine().isPaymentState(state),

      isTerminalState: state => new ApplicationStateMachine().isTerminalState(state),

      calculateProgress: status => {
        const stateOrder = [
          'draft',
          'submitted',
          'under_review',
          'payment_pending',
          'payment_verified',
          'inspection_scheduled',
          'inspection_completed',
          'phase2_payment_pending',
          'phase2_payment_verified',
          'approved',
          'certificate_issued',
        ];
        const currentIndex = stateOrder.indexOf(status);
        return currentIndex >= 0 ? Math.round(((currentIndex + 1) / stateOrder.length) * 100) : 0;
      },
    },

    // Configuration
    config: {
      states: new ApplicationStateMachine().getAllStates(),
      transitions: new ApplicationStateMachine().TRANSITIONS,
      rolePermissions: new ApplicationStateMachine().ROLE_PERMISSIONS,
      documentation: routeDocumentation,
    },
  };
}

/**
 * Default module instance (for convenience)
 */
const defaultModule = createApplicationWorkflowModule();

/**
 * Legacy support - keeping the old function name for backward compatibility
 * @deprecated Use createApplicationWorkflowModule instead
 */
function initializeApplicationWorkflow(dependencies = {}) {
  return createApplicationWorkflowModule(dependencies);
}

// Export module
module.exports = {
  // Factory function
  createApplicationWorkflowModule,

  // Legacy function
  initializeApplicationWorkflow,

  // Default instance
  ...defaultModule,

  // Direct access to core components
  ApplicationStateMachine,
  ApplicationWorkflowEngine,
  ApplicationRepository,
  Application,
  ApplicationController,
  createApplicationRoutes,

  // Module metadata
  moduleInfo: {
    name: 'ApplicationWorkflowModule',
    version: '1.0.0',
    description: 'GACP certification application workflow management',
    author: 'GACP Platform Team',
    dependencies: [
      'UserModule',
      'DocumentModule',
      'NotificationModule',
      'PaymentModule',
      'CertificateModule',
    ],
    apiEndpoints: Object.keys(routeDocumentation || {}),
  },
};
