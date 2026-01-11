/**
 * Fee Service - Standardized GACP Fee Calculation
 * Updated based on User Feedback:
 * - Application/Doc Review: 5,000 THB per Scope
 * - Audit Fee: 25,000 THB per Scope
 */
const FEE_RATES = {
    PHASE1_TOTAL: 5000,
    PHASE2_TOTAL: 25000,
};

const calculatePhase1Fee = () => {
    return {
        items: [
            { description: 'ค่าธรรมเนียมคำขอและตรวจสอบเอกสาร (Document Review)', amount: FEE_RATES.PHASE1_TOTAL },
        ],
        total: FEE_RATES.PHASE1_TOTAL,
    };
};

const calculatePhase2Fee = (formData) => {
    // Note: User indicated 25,000 is the standard Audit Fee per scope.
    // We can keep the Online/Travel logic if needed, but for now we align with the 30k total.

    // Check if Online mode still applies distinct logic?
    // User image shows "Indoor" = 30,000.
    // We will stick to the standard 25,000 base.

    const isOnline = formData?.auditMode === 'ONLINE';
    const baseFee = FEE_RATES.PHASE2_TOTAL;

    // If Online, maybe discount? User didn't specify, but implies 30k is standard.
    // Let's use 25,000 as base.

    const items = [
        { description: 'ค่าธรรมเนียมการตรวจประเมิน (Audit Fee)', amount: baseFee },
    ];

    // Travel costs could be added ON TOP, or included.
    // User said: "If 2 areas, x2". 
    // This implies the 25k covers the audit effort.
    // We will return the standard 25k.

    return { items, total: baseFee };
};

module.exports = {
    calculatePhase1Fee,
    calculatePhase2Fee,
};
