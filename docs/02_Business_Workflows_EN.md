# GACP System: Business Workflows & Logic

## 1. Pillar 1: Licensing & Certification Workflow
The core process of obtaining a GACP certificate.

### Workflow Diagram
```mermaid
sequenceDiagram
    participant Farmer
    participant System
    participant Staff
    
    Farmer->>System: 1. Submit Application (8 Steps)
    System->>Staff: Notify "New Application"
    Staff->>System: 2. Review Documents
    
    alt Documents Invalid
        Staff->>System: Request Revision (Comment)
        System->>Farmer: Notify "Revision Needed"
        Farmer->>System: Resubmit
    else Documents Valid
        Staff->>System: 3. Create Invoice
        System->>Farmer: Send Invoice
    end
    
    Farmer->>System: 4. Pay Fee (Payment Gateway)
    System->>System: Verify Payment -> Status: PAID
    
    Staff->>System: 5. Schedule Audit
    Staff->>System: 6. Record Audit Result (Pass)
    System->>Farmer: 7. Generate Certificate (PDF)
    System->>System: 8. Auto-Create Farm Profile
```

### Key Logic
*   **Step Logic**: Application saves as Draft until Step 8 is verified.
*   **Auto-Farm**: Upon `Generate Certificate`, the system automatically provisions a `Farm` record and locks its `cultivationType` (Outdoor/Indoor) based on the certificate scope.

---

## 2. Pillar 2: Payment & Financial Flow
Handling secure payments via Ksher Gateway.

### Payment Flowchart
```mermaid
graph TD
    Start[Invoice Issued] -->|Farmer Clicks Pay| Gateway{Payment Gateway}
    
    Gateway -->|Credit Card / QR| Processor[Bank Processor]
    
    Processor -- Success --> Webhook[Webhook Handler]
    Processor -- Fail --> UserRetry[User Retries]
    
    Webhook -->|Verify Signature| UpdateDB[Update Invoice Status: PAID]
    UpdateDB -->|Trigger| UpdateApp[Update Application: PENDING_AUDIT]
    UpdateApp -->|Notify| StaffNotify[Notify Staff]
```

### Security Measures
*   **Signature Verification**: All webhooks verify the `sign` parameter using the Secret Key.
*   **Idempotency**: Webhook handles duplicate calls safely (checks if already PAID).

---

## 3. Pillar 3: Traceability & QR Quota (Strict Mode)
Ensuring product authenticity and limiting supply to capacity.

### Traceability Loop (The Golden Loop)
```mermaid
graph LR
    Plot[Zone/Plot] -->|Link| Cycle[Planting Cycle]
    Cycle -->|Grow| Harvest[Harvest Batch]
    Harvest -->|Pack| Lot[Product Lot]
    Lot -->|Gen| QR[QR Code]
```

### Logic: Quota Enforcement
The system enforces a **Physical Constraint** to prevent fraud (e.g., claiming 100 tons from a 1-rai farm).

1.  **Harvest Input**: Farmer records `Actual Yield` (e.g., 500 kg) for a Batch.
2.  **Lot Creation**: When creating a product Lot (e.g., 1kg packs).
3.  **Validation Rule**:
    $$ \sum (ExistingLots_{weight}) + NewLot_{weight} \le HarvestBatch_{limit} $$
4.  **Result**: If user attempts to generate QR codes exceeding the remaining yield, the system **BLOCKS** the request (HTTP 400).

### Yield Prediction (Early Warning)
*   **Input**: Plot Area x 70% Usage x Spacing.
*   **Warning**: If `Harvest Batch` input exceeds the theoretical maximum capacity of the plot, a warning flag is raised for Audit.
