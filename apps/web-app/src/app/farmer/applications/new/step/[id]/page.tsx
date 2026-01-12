'use client';

import React from 'react';
import { notFound, useParams } from 'next/navigation';
import { useWizardStore } from '../../hooks/useWizardStore';

// Step Components - Mapped to 9-step flow
import { StepPlantSelection } from '../../steps/StepPlantSelection';
import { StepGeneral } from '../../steps/StepGeneral'; // -> Applicant
import { StepLand } from '../../steps/StepLand'; // -> Site
import { StepProduction } from '../../steps/StepProduction'; // -> Cultivation
import { StepPlots } from '../../steps/StepPlots'; // -> Security (temporary)
import { StepHarvest } from '../../steps/StepHarvest';
import { StepDocuments } from '../../steps/StepDocuments';
import { StepPreCheck } from '../../steps/StepPreCheck'; // -> Review
import { StepQuote } from '../../steps/StepQuote'; // -> Submit & Payment

// 9 Steps (1-9 in URL, 0-8 in array)
const STEPS_COMPONENTS = [
    StepPlantSelection,   // 1: พืชและวัตถุประสงค์
    StepGeneral,          // 2: ข้อมูลผู้ขอ
    StepLand,             // 3: สถานที่ปลูก
    StepProduction,       // 4: รายละเอียดการปลูก
    StepPlots,            // 5: มาตรการความปลอดภัย (to be replaced with StepSecurity)
    StepHarvest,          // 6: เก็บเกี่ยวและแปรรูป
    StepDocuments,        // 7: เอกสารเพิ่มเติม
    StepPreCheck,         // 8: ตรวจสอบข้อมูล
    StepQuote,            // 9: ส่งคำขอและชำระเงิน
];

// Ensure the component is a Client Component (it imports useWizardStore)
export default function StepPage() {
    const params = useParams();

    // Parse ID from URL
    const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const stepId = parseInt(idStr || '0', 10);

    // Validate ID
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
