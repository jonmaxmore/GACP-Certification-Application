# System Architecture Diagrams

## GACP Certify Flow Admin Portal

This document contains visual architecture diagrams created with Mermaid.js to help understand the system structure, data flow, and deployment topology.

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Application Architecture](#application-architecture)
3. [Database Schema](#database-schema)
4. [Authentication Flow](#authentication-flow)
5. [Application Submission Flow](#application-submission-flow)
6. [Document Verification Flow](#document-verification-flow)
7. [Payment Processing Flow](#payment-processing-flow)
8. [Deployment Architecture](#deployment-architecture)
9. [CI/CD Pipeline](#cicd-pipeline)

---

## System Architecture Overview

High-level view of the entire system:

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile App]
    end

    subgraph "CDN & Load Balancer"
        CDN[CloudFront/CDN]
        LB[Load Balancer<br/>Nginx/ALB]
    end

    subgraph "Application Layer"
        APP1[Next.js App<br/>Instance 1]
        APP2[Next.js App<br/>Instance 2]
        APP3[Next.js App<br/>Instance 3]
    end

    subgraph "Cache Layer"
        REDIS[(Redis<br/>Cache & Sessions)]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Primary)]
        DB_REPLICA[(PostgreSQL<br/>Replica)]
    end

    subgraph "Storage Layer"
        S3[AWS S3<br/>Document Storage]
    end

    subgraph "External Services"
        EMAIL[Email Service<br/>SendGrid/SES]
        SMS[SMS Service<br/>Twilio]
        PAYMENT[Payment Gateway<br/>PromptPay/Omise]
        SENTRY[Error Tracking<br/>Sentry]
    end

    WEB --> CDN
    MOBILE --> CDN
    CDN --> LB
    LB --> APP1
    LB --> APP2
    LB --> APP3

    APP1 --> REDIS
    APP2 --> REDIS
    APP3 --> REDIS

    APP1 --> DB
    APP2 --> DB
    APP3 --> DB

    DB --> DB_REPLICA

    APP1 --> S3
    APP2 --> S3
    APP3 --> S3

    APP1 --> EMAIL
    APP1 --> SMS
    APP1 --> PAYMENT
    APP1 --> SENTRY

    style WEB fill:#e3f2fd
    style MOBILE fill:#e3f2fd
    style CDN fill:#fff3e0
    style LB fill:#fff3e0
    style APP1 fill:#c8e6c9
    style APP2 fill:#c8e6c9
    style APP3 fill:#c8e6c9
    style REDIS fill:#ffccbc
    style DB fill:#f8bbd0
    style DB_REPLICA fill:#f8bbd0
    style S3 fill:#d1c4e9
```

---

## Application Architecture

Internal structure of the Next.js application:

```mermaid
graph LR
    subgraph "Frontend - React"
        UI[UI Components]
        STATE[State Management<br/>React Context]
        HOOKS[Custom Hooks]
    end

    subgraph "Backend - Next.js API"
        API[API Routes]
        MIDDLEWARE[Middleware Layer]
        SERVICES[Business Logic<br/>Services]
    end

    subgraph "Core Libraries"
        AUTH[Authentication<br/>JWT/Session]
        ERROR[Error Handling]
        LOGGING[Logging]
        MONITOR[Performance<br/>Monitoring]
        SECURITY[Security<br/>Rate Limiting]
    end

    subgraph "Data Access"
        PRISMA[Prisma ORM]
        QUERIES[Custom Queries]
    end

    UI --> HOOKS
    UI --> STATE
    HOOKS --> API

    API --> MIDDLEWARE
    MIDDLEWARE --> AUTH
    MIDDLEWARE --> ERROR
    MIDDLEWARE --> SECURITY

    API --> SERVICES
    SERVICES --> PRISMA
    SERVICES --> QUERIES

    SERVICES --> LOGGING
    SERVICES --> MONITOR

    PRISMA --> DATABASE[(PostgreSQL)]

    style UI fill:#e3f2fd
    style API fill:#c8e6c9
    style AUTH fill:#fff3e0
    style PRISMA fill:#f8bbd0
```

---

## Database Schema

Entity Relationship Diagram:

```mermaid
erDiagram
    User ||--o{ Application : creates
    User ||--o{ AuditLog : generates
    User {
        uuid id PK
        string email UK
        string name
        enum role
        datetime createdAt
        datetime updatedAt
    }

    Application ||--o{ Document : contains
    Application ||--|{ Payment : requires
    Application ||--o{ Comment : has
    Application ||--o{ StatusHistory : tracks
    Application {
        uuid id PK
        uuid userId FK
        string farmName
        string farmerName
        string farmAddress
        float farmSize
        string cropType
        enum status
        datetime submittedAt
        datetime createdAt
        datetime updatedAt
    }

    Document {
        uuid id PK
        uuid applicationId FK
        string filename
        string fileUrl
        enum type
        enum status
        uuid verifiedBy FK
        datetime verifiedAt
        datetime createdAt
    }

    Payment ||--o{ PaymentTransaction : has
    Payment {
        uuid id PK
        uuid applicationId FK
        decimal amount
        enum status
        enum method
        string transactionId
        datetime paidAt
        datetime createdAt
    }

    PaymentTransaction {
        uuid id PK
        uuid paymentId FK
        enum type
        decimal amount
        string reference
        datetime createdAt
    }

    Comment {
        uuid id PK
        uuid applicationId FK
        uuid userId FK
        text content
        boolean isInternal
        datetime createdAt
    }

    StatusHistory {
        uuid id PK
        uuid applicationId FK
        uuid userId FK
        enum previousStatus
        enum newStatus
        text reason
        datetime createdAt
    }

    AuditLog {
        uuid id PK
        uuid userId FK
        string action
        string entityType
        uuid entityId
        json metadata
        datetime createdAt
    }

    Certification ||--|| Application : certifies
    Certification {
        uuid id PK
        uuid applicationId FK
        string certificateNumber
        datetime issuedAt
        datetime expiresAt
        enum status
        datetime createdAt
    }
```

---

## Authentication Flow

User authentication process:

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant API
    participant Auth as Auth Service
    participant DB as Database
    participant Redis

    User->>Browser: Enter credentials
    Browser->>API: POST /api/auth/login
    API->>Auth: Validate credentials
    Auth->>DB: Query user by email
    DB-->>Auth: User data
    Auth->>Auth: Verify password hash

    alt Authentication successful
        Auth->>Auth: Generate JWT tokens
        Auth->>Redis: Store refresh token
        Redis-->>Auth: Confirmation
        Auth-->>API: Tokens + User data
        API-->>Browser: Success response
        Browser->>Browser: Store access token
        Browser-->>User: Redirect to dashboard
    else Authentication failed
        Auth-->>API: Authentication error
        API-->>Browser: Error response
        Browser-->>User: Display error message
    end
```

---

## Application Submission Flow

End-to-end application submission process:

```mermaid
flowchart TD
    START([Farmer Logs In]) --> CREATE[Create Application]
    CREATE --> FILL[Fill Basic Info]
    FILL --> UPLOAD[Upload Documents]
    UPLOAD --> CHECK_DOCS{All Required<br/>Docs Uploaded?}

    CHECK_DOCS -->|No| UPLOAD
    CHECK_DOCS -->|Yes| REVIEW_SELF[Review Application]

    REVIEW_SELF --> SUBMIT[Submit Application]
    SUBMIT --> NOTIFY_ADMIN[Notify Admin]

    NOTIFY_ADMIN --> ASSIGN[Admin Assigns<br/>Reviewer]
    ASSIGN --> VERIFY_DOCS[Reviewer Verifies<br/>Documents]

    VERIFY_DOCS --> CHECK_VALID{Documents<br/>Valid?}

    CHECK_VALID -->|No| REQUEST_INFO[Request More Info]
    REQUEST_INFO --> NOTIFY_FARMER[Notify Farmer]
    NOTIFY_FARMER --> UPLOAD

    CHECK_VALID -->|Yes| ASSESS[Conduct Assessment]

    ASSESS --> DECISION{Decision}

    DECISION -->|Approve| GENERATE_CERT[Generate Certificate]
    GENERATE_CERT --> NOTIFY_APPROVED[Notify Farmer]
    NOTIFY_APPROVED --> END_APPROVED([Application Approved])

    DECISION -->|Reject| DOCUMENT_REASON[Document Rejection]
    DOCUMENT_REASON --> NOTIFY_REJECTED[Notify Farmer]
    NOTIFY_REJECTED --> END_REJECTED([Application Rejected])

    DECISION -->|Need More Info| REQUEST_INFO

    style START fill:#c8e6c9
    style END_APPROVED fill:#c8e6c9
    style END_REJECTED fill:#ffcdd2
    style DECISION fill:#fff3e0
    style CHECK_DOCS fill:#fff3e0
    style CHECK_VALID fill:#fff3e0
```

---

## Document Verification Flow

Document verification process:

```mermaid
stateDiagram-v2
    [*] --> Uploaded: Farmer uploads document

    Uploaded --> PendingReview: Assigned to reviewer

    PendingReview --> UnderReview: Reviewer opens document

    UnderReview --> Verified: Document is valid
    UnderReview --> Rejected: Document is invalid
    UnderReview --> NeedsReview: Unclear/Suspicious

    Verified --> [*]: Approved

    Rejected --> Uploaded: Farmer re-uploads

    NeedsReview --> EscalatedReview: Escalated to supervisor
    EscalatedReview --> Verified: Supervisor approves
    EscalatedReview --> Rejected: Supervisor rejects
    EscalatedReview --> ReportedFraud: Suspected fraud

    ReportedFraud --> [*]: Investigation
```

---

## Payment Processing Flow

Payment processing sequence:

```mermaid
sequenceDiagram
    participant Farmer
    participant App
    participant API
    participant Payment as Payment Service
    participant Gateway as Payment Gateway
    participant DB as Database
    participant Notif as Notification Service

    Farmer->>App: Initiate payment
    App->>API: POST /api/payments
    API->>DB: Create payment record (PENDING)
    DB-->>API: Payment ID

    alt QR Code Payment
        API->>Payment: Generate QR code
        Payment->>Gateway: Request QR code
        Gateway-->>Payment: QR code data
        Payment-->>API: QR code URL
        API-->>App: Display QR code
        App-->>Farmer: Show QR code
        Farmer->>Farmer: Scan & pay
        Gateway->>Payment: Webhook: Payment success
        Payment->>DB: Update payment (COMPLETED)
        Payment->>Notif: Send confirmation
        Notif-->>Farmer: Email/SMS confirmation
    else Bank Transfer
        API->>Payment: Generate instructions
        Payment-->>API: Bank details
        API-->>App: Show bank details
        App-->>Farmer: Display instructions
        Farmer->>Farmer: Transfer money
        Farmer->>App: Upload receipt
        App->>API: POST /api/payments/{id}/receipt
        API->>DB: Update payment (PROCESSING)
        Note over API: Admin verifies manually
        API->>DB: Update payment (COMPLETED)
        API->>Notif: Send confirmation
        Notif-->>Farmer: Email/SMS confirmation
    end
```

---

## Deployment Architecture

Production deployment on AWS:

```mermaid
graph TB
    subgraph "AWS Cloud"
        subgraph "VPC"
            subgraph "Public Subnet"
                ALB[Application<br/>Load Balancer]
                NAT[NAT Gateway]
            end

            subgraph "Private Subnet - AZ1"
                APP1[EC2 Instance<br/>Next.js App 1]
                RDS1[(RDS PostgreSQL<br/>Primary)]
            end

            subgraph "Private Subnet - AZ2"
                APP2[EC2 Instance<br/>Next.js App 2]
                RDS2[(RDS PostgreSQL<br/>Replica)]
            end

            subgraph "Private Subnet - AZ3"
                REDIS1[ElastiCache<br/>Redis Primary]
                REDIS2[ElastiCache<br/>Redis Replica]
            end
        end

        subgraph "Storage & Services"
            S3[S3 Bucket<br/>Document Storage]
            CF[CloudFront CDN]
            SES[Amazon SES<br/>Email Service]
            SNS[Amazon SNS<br/>Notifications]
            CW[CloudWatch<br/>Monitoring]
        end
    end

    subgraph "External"
        USER[End Users]
        ADMIN[Administrators]
    end

    USER --> CF
    ADMIN --> CF
    CF --> ALB
    ALB --> APP1
    ALB --> APP2

    APP1 --> RDS1
    APP2 --> RDS1
    RDS1 --> RDS2

    APP1 --> REDIS1
    APP2 --> REDIS1
    REDIS1 --> REDIS2

    APP1 --> S3
    APP2 --> S3

    APP1 --> SES
    APP1 --> SNS

    APP1 --> CW
    APP2 --> CW
    RDS1 --> CW
    REDIS1 --> CW

    style USER fill:#e3f2fd
    style ADMIN fill:#e3f2fd
    style ALB fill:#fff3e0
    style APP1 fill:#c8e6c9
    style APP2 fill:#c8e6c9
    style RDS1 fill:#f8bbd0
    style RDS2 fill:#f8bbd0
    style REDIS1 fill:#ffccbc
    style REDIS2 fill:#ffccbc
    style S3 fill:#d1c4e9
    style CF fill:#fff9c4
```

---

## CI/CD Pipeline

Continuous Integration and Deployment pipeline:

```mermaid
flowchart LR
    DEV[Developer] -->|git push| GITHUB[GitHub Repository]

    GITHUB -->|Webhook| GH_ACTIONS[GitHub Actions]

    subgraph "CI Pipeline"
        GH_ACTIONS --> LINT[Lint & Format Check]
        LINT --> TYPE[TypeScript Check]
        TYPE --> TEST[Run Unit Tests]
        TEST --> BUILD[Build Application]
        BUILD --> SCAN[Security Scan]
    end

    SCAN -->|Success| DOCKER[Build Docker Image]
    DOCKER --> PUSH[Push to ECR/Docker Hub]

    subgraph "CD Pipeline - Staging"
        PUSH -->|Auto Deploy| STAGE_DEPLOY[Deploy to Staging]
        STAGE_DEPLOY --> STAGE_MIGRATE[Run Migrations]
        STAGE_MIGRATE --> STAGE_TEST[Integration Tests]
        STAGE_TEST --> STAGE_SMOKE[Smoke Tests]
    end

    STAGE_SMOKE -->|Manual Approval| PROD_DEPLOY[Deploy to Production]

    subgraph "CD Pipeline - Production"
        PROD_DEPLOY --> PROD_BACKUP[Backup Database]
        PROD_BACKUP --> PROD_MIGRATE[Run Migrations]
        PROD_MIGRATE --> PROD_BLUE[Deploy Blue/Green]
        PROD_BLUE --> PROD_HEALTH[Health Check]
        PROD_HEALTH --> PROD_SWITCH[Switch Traffic]
        PROD_SWITCH --> PROD_MONITOR[Monitor Metrics]
    end

    PROD_MONITOR -->|Issues Detected| ROLLBACK[Automatic Rollback]
    ROLLBACK --> PROD_BLUE

    PROD_MONITOR -->|Success| COMPLETE([Deployment Complete])

    style DEV fill:#e3f2fd
    style GITHUB fill:#333,color:#fff
    style GH_ACTIONS fill:#2088FF,color:#fff
    style DOCKER fill:#2496ED,color:#fff
    style COMPLETE fill:#c8e6c9
    style ROLLBACK fill:#ffcdd2
```

---

## Component Interaction Diagram

How different components interact:

```mermaid
graph TB
    subgraph "Frontend Components"
        PAGE[Page Component]
        FORM[Form Component]
        TABLE[Table Component]
        MODAL[Modal Component]
    end

    subgraph "State Management"
        CONTEXT[React Context]
        HOOKS[Custom Hooks]
    end

    subgraph "API Client"
        FETCH[Fetch Wrapper]
        AUTH_INT[Auth Interceptor]
        ERROR_INT[Error Interceptor]
    end

    subgraph "API Routes"
        AUTH_API[/api/auth]
        APP_API[/api/applications]
        DOC_API[/api/documents]
        PAY_API[/api/payments]
    end

    subgraph "Middleware"
        AUTH_MW[Auth Middleware]
        RATE_MW[Rate Limit MW]
        VALID_MW[Validation MW]
        ERROR_MW[Error MW]
    end

    subgraph "Services"
        AUTH_SVC[Auth Service]
        APP_SVC[Application Service]
        DOC_SVC[Document Service]
        PAY_SVC[Payment Service]
    end

    PAGE --> FORM
    PAGE --> TABLE
    FORM --> MODAL

    FORM --> HOOKS
    TABLE --> HOOKS
    HOOKS --> CONTEXT
    HOOKS --> FETCH

    FETCH --> AUTH_INT
    AUTH_INT --> ERROR_INT
    ERROR_INT --> AUTH_API
    ERROR_INT --> APP_API
    ERROR_INT --> DOC_API
    ERROR_INT --> PAY_API

    AUTH_API --> AUTH_MW
    APP_API --> AUTH_MW
    DOC_API --> AUTH_MW
    PAY_API --> AUTH_MW

    AUTH_MW --> RATE_MW
    RATE_MW --> VALID_MW
    VALID_MW --> ERROR_MW

    ERROR_MW --> AUTH_SVC
    ERROR_MW --> APP_SVC
    ERROR_MW --> DOC_SVC
    ERROR_MW --> PAY_SVC

    AUTH_SVC --> DB[(Database)]
    APP_SVC --> DB
    DOC_SVC --> DB
    PAY_SVC --> DB

    DOC_SVC --> S3[(S3 Storage)]

    style PAGE fill:#e3f2fd
    style CONTEXT fill:#fff3e0
    style FETCH fill:#c8e6c9
    style AUTH_MW fill:#ffccbc
    style AUTH_SVC fill:#f8bbd0
    style DB fill:#d1c4e9
```

---

## Error Handling Flow

How errors are handled throughout the system:

```mermaid
flowchart TD
    ERROR([Error Occurs]) --> SOURCE{Error Source}

    SOURCE -->|Frontend| FE_ERROR[React Error Boundary]
    SOURCE -->|API| API_ERROR[API Error Handler]
    SOURCE -->|Service| SVC_ERROR[Service Error]

    FE_ERROR --> LOG_FE[Log to Console]
    LOG_FE --> TRACK_FE[Track in Sentry]
    TRACK_FE --> DISPLAY[Display User-Friendly Message]
    DISPLAY --> RETRY{Retryable?}
    RETRY -->|Yes| RETRY_BTN[Show Retry Button]
    RETRY -->|No| ERROR_PAGE[Show Error Page]

    API_ERROR --> TRANSFORM[Transform to AppError]
    TRANSFORM --> CATEGORIZE{Error Category}

    CATEGORIZE -->|Validation| VAL_RESP[400 Bad Request]
    CATEGORIZE -->|Auth| AUTH_RESP[401/403 Response]
    CATEGORIZE -->|Not Found| NOT_FOUND[404 Response]
    CATEGORIZE -->|System| SYS_RESP[500 Internal Error]

    VAL_RESP --> LOG_API[Log Error]
    AUTH_RESP --> LOG_API
    NOT_FOUND --> LOG_API
    SYS_RESP --> LOG_API

    LOG_API --> CHECK_SEV{Severity}
    CHECK_SEV -->|Low| FILE_LOG[Write to Log File]
    CHECK_SEV -->|High| ALERT[Send Alert]

    ALERT --> EMAIL[Email Admin]
    ALERT --> SLACK[Slack Notification]

    FILE_LOG --> AGGREGATE[Aggregate Metrics]
    EMAIL --> AGGREGATE
    SLACK --> AGGREGATE

    AGGREGATE --> MONITOR[Performance Monitor]
    MONITOR --> END([Error Handled])

    style ERROR fill:#ffcdd2
    style DISPLAY fill:#fff3e0
    style END fill:#c8e6c9
```

---

## Viewing These Diagrams

These Mermaid diagrams can be viewed in:

1. **GitHub**: Automatically renders in markdown files
2. **VS Code**: Install "Markdown Preview Mermaid Support" extension
3. **Mermaid Live Editor**: [https://mermaid.live](https://mermaid.live)
4. **Documentation Sites**: Docusaurus, MkDocs, GitBook (with plugins)

---

**Last Updated:** October 15, 2025  
**Version:** 1.0.0
