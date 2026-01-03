"use client";

import { PersonIcon, BuildingIcon, GroupIcon } from "@/components/ui/icons";
import { colors } from "@/lib/design-tokens";

export const ACCOUNT_TYPES = [
    { type: "INDIVIDUAL", label: "บุคคลธรรมดา", subtitle: "เกษตรกรรายย่อย", idLabel: "เลขบัตรประชาชน 13 หลัก", idHint: "1-2345-67890-12-3" },
    { type: "JURISTIC", label: "นิติบุคคล", subtitle: "บริษัท / ห้างหุ้นส่วน", idLabel: "เลขทะเบียนนิติบุคคล 13 หลัก", idHint: "0-1055-12345-67-8" },
    { type: "COMMUNITY_ENTERPRISE", label: "วิสาหกิจชุมชน", subtitle: "กลุ่มเกษตรกร", idLabel: "เลขทะเบียนวิสาหกิจชุมชน", idHint: "XXXX-XXXX-XXX" },
];

interface AccountTypeSelectorProps {
    accountType: string;
    onSelect: (type: string) => void;
}

/**
 * Account Type Selector
 * 🍎 Apple Single Responsibility: Only handles account type selection
 */
export function AccountTypeSelector({ accountType, onSelect }: AccountTypeSelectorProps) {
    const getIcon = (type: string, isSelected: boolean) => {
        const color = isSelected ? "#FFFFFF" : "#6B7280";
        switch (type) {
            case "INDIVIDUAL": return <PersonIcon color={color} />;
            case "JURISTIC": return <BuildingIcon color={color} />;
            case "COMMUNITY_ENTERPRISE": return <GroupIcon color={color} />;
            default: return null;
        }
    };

    return (
        <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "14px", color: colors.textGray, display: "block", marginBottom: "12px" }}>
                ประเภทผู้ใช้งาน
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
                {ACCOUNT_TYPES.map((type) => {
                    const isSelected = accountType === type.type;
                    return (
                        <button
                            key={type.type}
                            type="button"
                            onClick={() => onSelect(type.type)}
                            style={{
                                flex: 1,
                                padding: "12px 8px",
                                borderRadius: "12px",
                                border: isSelected ? "none" : `1px solid ${colors.border}`,
                                backgroundColor: isSelected ? colors.primary : colors.card,
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            <div style={{ marginBottom: "6px", display: "flex", justifyContent: "center" }}>
                                {getIcon(type.type, isSelected)}
                            </div>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: isSelected ? "#FFFFFF" : colors.textDark }}>
                                {type.label}
                            </div>
                            <div style={{ fontSize: "10px", color: isSelected ? "rgba(255,255,255,0.8)" : colors.textGray }}>
                                {type.subtitle}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
