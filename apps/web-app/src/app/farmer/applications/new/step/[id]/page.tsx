'use client';

import React from 'react';
import { notFound, useParams } from 'next/navigation';
import { useWizardStore } from '../../hooks/useWizardStore';

// Step Components - Mapped to 11-step GACP flow (consolidated Land+Farm)
// 14-Step GACP Application Flow (Architected for Licensing, Traceability, Payment)
// Pillar 1: Licensing
import { StepPlantSelection } from '../../steps/StepPlantSelection';    // 1: Plant & Objective
import { StepGeneral } from '../../steps/StepGeneral';                  // 2: Farmer Profile
import { StepFarm } from '../../steps/StepFarm';                        // 3: Land & Location
import { StepPlots } from '../../steps/StepPlots';                      // 4: Farm Layout

// Pillar 2: Traceability (The "Engine")
import { StepProduction } from '../../steps/StepProduction';            // 5: Production Method (Propagation)
import { StepLots } from '../../steps/StepLots';                        // 6: Lots Tracking Setup
import { StepProductionEstimate } from '../../steps/StepProductionEstimate'; // 7: Yield Logic (Calculation)
import { StepHarvest } from '../../steps/StepHarvest';                  // 8: Harvest Process

// Pillar 3: Compliance & Submission
import { StepDocuments } from '../../steps/StepDocuments';              // 9: Evidence
import { StepPreCheck } from '../../steps/StepPreCheck';                // 10: Self-Audit
import { StepPreview } from '../../steps/StepPreview';                  // 11: Review
import { StepSubmit } from '../../steps/StepSubmit';                    // 12: Legal Submission

// Pillar 4: Payment (Gateway)
import { StepQuote } from '../../steps/StepQuote';                      // 13: Fee Acceptance
import { StepInvoice } from '../../steps/StepInvoice';                  // 14: Payment Processing
import { StepSuccess } from '../../steps/StepSuccess';                  // Success State

// 14-Step Flow Configuration
const STEPS_COMPONENTS = [
    StepPlantSelection,     // 1
    StepGeneral,            // 2
    StepFarm,               // 3
    StepPlots,              // 4
    StepProduction,         // 5 (Restored)
    StepLots,               // 6 (New Integration)
    StepProductionEstimate, // 7
    StepHarvest,            // 8 (Restored)
    StepDocuments,          // 9
    StepPreCheck,           // 10 (Restored)
    StepPreview,            // 11
    StepSubmit,             // 12
    StepQuote,              // 13 (Was 10)
    StepInvoice,            // 14 (Was 11)
    StepSuccess,            // Success (Post-14)
];


export default function StepPage() {
    const params = useParams();

    // Parse ID from URL
    const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const stepId = parseInt(idStr || '0', 10);

    // Validate ID (1-12)
    if (isNaN(stepId) || stepId < 1 || stepId > STEPS_COMPONENTS.length) {
        notFound();
    }

    // Convert to 0-based index
    const stepIndex = stepId - 1;
    const StepComponent = STEPS_COMPONENTS[stepIndex];

    const { setCurrentStep } = useWizardStore();
    const hasSynced = React.useRef(false);

    // Sync Store Step with URL Step - only once on mount
    React.useEffect(() => {
        if (!hasSynced.current) {
            hasSynced.current = true;
            setCurrentStep(stepIndex);
        }
    }, []); // Empty deps - only run on mount

    return (
        <div className="p-8">
            <StepComponent />
        </div>
    );
}

