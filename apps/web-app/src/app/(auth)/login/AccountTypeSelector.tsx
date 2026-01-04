"use client";

import { PersonIcon, BuildingIcon, GroupIcon } from "@/components/ui/icons";

export const ACCOUNT_TYPES = [
    { type: "INDIVIDUAL", label: "บุคคลธรรมดา", subtitle: "เกษตรกรรายย่อย", idLabel: "เลขบัตรประชาชน 13 หลัก", idHint: "1-2345-67890-12-3" },
    { type: "JURISTIC", label: "นิติบุคคล", subtitle: "บริษัท / ห้างหุ้นส่วน", idLabel: "เลขทะเบียนนิติบุคคล 13 หลัก", idHint: "0-1055-12345-67-8" },
    { type: "COMMUNITY_ENTERPRISE", label: "วิสาหกิจชุมชน", subtitle: "กลุ่มเกษตรกร", idLabel: "เลขทะเบียนวิสาหกิจชุมชน", idHint: "XXXX-XXXX-XXX" },
];

interface AccountTypeSelectorProps {
    accountType: string;
    onSelect: (type: string) => void;
}

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
        <div className="mb-5">
            <label className="text-sm text-slate-500 block mb-3">ประเภทผู้ใช้งาน</label>
            <div className="flex gap-2">
                {ACCOUNT_TYPES.map((type) => {
                    const isSelected = accountType === type.type;
                    return (
                        <button
                            key={type.type}
                            type="button"
                            onClick={() => onSelect(type.type)}
                            className={`
                                flex-1 py-3 px-2 rounded-xl transition-all
                                ${isSelected
                                    ? 'bg-gradient-to-br from-primary-600 to-primary-500 border-none shadow-lg shadow-primary-500/30'
                                    : 'bg-white border border-surface-200 hover:border-primary-300'
                                }
                            `}
                        >
                            <div className="mb-1.5 flex justify-center">
                                {getIcon(type.type, isSelected)}
                            </div>
                            <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                {type.label}
                            </div>
                            <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                                {type.subtitle}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
