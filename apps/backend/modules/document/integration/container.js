/**
 * Document Module Container
 *
 * Dependency Injection configuration for Document Module.
 * Wires all dependencies and exports module interface.
 * Part of Clean Architecture - Integration Layer
 */

// Domain
const Document = require('../domain/entities/Document');

// Infrastructure
const MongoDBDocumentRepository = require('../infrastructure/database/document-model');
const LocalFileStorageService = require('../infrastructure/storage/storage');
const mongoose = require('mongoose');

// Application Use Cases
const UploadDocumentUseCase = require('../application/use-cases/upload-document-usecase');
const GetDocumentUseCase = require('../application/use-cases/get-document-usecase');
const DownloadDocumentUseCase = require('../application/use-cases/download-document-usecase');
const ListDocumentsUseCase = require('../application/use-cases/list-documents-usecase');
const ApproveDocumentUseCase = require('../application/use-cases/approve-document-usecase');
const RejectDocumentUseCase = require('../application/use-cases/reject-document-usecase');
const DeleteDocumentUseCase = require('../application/use-cases/delete-document-usecase');
const UpdateDocumentMetadataUseCase = require('../application/use-cases/update-document-metadata-usecase');
const GetDocumentsByRelatedEntityUseCase = require('../application/use-cases/get-documents-by-entity-usecase');
const GetPendingDocumentsUseCase = require('../application/use-cases/get-pending-documents-usecase');
const GetDocumentStatisticsUseCase = require('../application/use-cases/get-document-stats-usecase');

// Presentation
const DocumentController = require('../presentation/controllers/document-controller');
const farmerRoutes = require('../presentation/routes/document.farmer.routes');
const dtamRoutes = require('../presentation/routes/document.dtam.routes');

class DocumentModuleContainer {
  constructor(database = null) {
    this.database = database || mongoose;
    this._setupDependencies();
  }

  _setupDependencies() {
    // Infrastructure Layer
    this.documentRepository = new MongoDBDocumentRepository(this.database);
    this.fileStorageService = new LocalFileStorageService();

    // Application Layer - Use Cases
    this.uploadDocumentUseCase = new UploadDocumentUseCase(
      this.documentRepository,
      this.fileStorageService,
    );

    this.getDocumentUseCase = new GetDocumentUseCase(this.documentRepository);

    this.downloadDocumentUseCase = new DownloadDocumentUseCase(
      this.documentRepository,
      this.fileStorageService,
    );

    this.listDocumentsUseCase = new ListDocumentsUseCase(this.documentRepository);

    this.approveDocumentUseCase = new ApproveDocumentUseCase(this.documentRepository);

    this.rejectDocumentUseCase = new RejectDocumentUseCase(this.documentRepository);

    this.deleteDocumentUseCase = new DeleteDocumentUseCase(
      this.documentRepository,
      this.fileStorageService,
    );

    this.updateDocumentMetadataUseCase = new UpdateDocumentMetadataUseCase(this.documentRepository);

    this.getDocumentsByRelatedEntityUseCase = new GetDocumentsByRelatedEntityUseCase(
      this.documentRepository,
    );

    this.getPendingDocumentsUseCase = new GetPendingDocumentsUseCase(this.documentRepository);

    this.getDocumentStatisticsUseCase = new GetDocumentStatisticsUseCase(this.documentRepository);

    // Presentation Layer - Controller
    this.documentController = new DocumentController(
      this.uploadDocumentUseCase,
      this.getDocumentUseCase,
      this.downloadDocumentUseCase,
      this.listDocumentsUseCase,
      this.approveDocumentUseCase,
      this.rejectDocumentUseCase,
      this.deleteDocumentUseCase,
      this.updateDocumentMetadataUseCase,
      this.getDocumentsByRelatedEntityUseCase,
      this.getPendingDocumentsUseCase,
      this.getDocumentStatisticsUseCase,
    );
  }

  // Get Router for Farmers
  getFarmerRoutes(authenticateFarmer) {
    return farmerRoutes(this.documentController, authenticateFarmer);
  }

  // Get Router for DTAM Staff
  getDTAMRoutes(authenticateDTAM) {
    return dtamRoutes(this.documentController, authenticateDTAM);
  }

  // Expose services for other modules
  getDocumentRepository() {
    return this.documentRepository;
  }

  getFileStorageService() {
    return this.fileStorageService;
  }

  // Expose use cases for direct access (if needed)
  getUploadDocumentUseCase() {
    return this.uploadDocumentUseCase;
  }

  getGetDocumentUseCase() {
    return this.getDocumentUseCase;
  }

  getDownloadDocumentUseCase() {
    return this.downloadDocumentUseCase;
  }

  getListDocumentsUseCase() {
    return this.listDocumentsUseCase;
  }

  getApproveDocumentUseCase() {
    return this.approveDocumentUseCase;
  }

  getRejectDocumentUseCase() {
    return this.rejectDocumentUseCase;
  }

  getDeleteDocumentUseCase() {
    return this.deleteDocumentUseCase;
  }

  getUpdateDocumentMetadataUseCase() {
    return this.updateDocumentMetadataUseCase;
  }

  getGetDocumentsByRelatedEntityUseCase() {
    return this.getDocumentsByRelatedEntityUseCase;
  }

  getGetPendingDocumentsUseCase() {
    return this.getPendingDocumentsUseCase;
  }

  getGetDocumentStatisticsUseCase() {
    return this.getDocumentStatisticsUseCase;
  }

  // Domain Entity for other modules
  getDocumentEntity() {
    return Document;
  }
}

// Singleton instance
let containerInstance = null;

function getDocumentModuleContainer(database = null) {
  if (!containerInstance) {
    containerInstance = new DocumentModuleContainer(database);
  }
  return containerInstance;
}

module.exports = {
  DocumentModuleContainer,
  getDocumentModuleContainer,
};
