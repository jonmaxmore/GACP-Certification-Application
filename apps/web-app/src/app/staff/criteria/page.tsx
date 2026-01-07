'use client';

import { useEffect, useState } from 'react';

interface Criterion {
    id: string;
    code: string;
    category: string;
    categoryTH: string | null;
    label: string;
    description: string | null;
    icon: string | null;
    sortOrder: number;
    isRequired: boolean;
    inputType: string;
    isActive: boolean;
    createdAt: string;
}

interface CriterionForm {
    code: string;
    category: string;
    categoryTH: string;
    label: string;
    description: string;
    icon: string;
    sortOrder: number;
    isRequired: boolean;
    inputType: string;
    isActive: boolean;
}

const defaultForm: CriterionForm = {
    code: '',
    category: '',
    categoryTH: '',
    label: '',
    description: '',
    icon: '📋',
    sortOrder: 0,
    isRequired: false,
    inputType: 'checkbox',
    isActive: true
};

const categoryOptions = [
    { value: 'TESTING', label: 'การทดสอบและตรวจสอบ', icon: '🧪' },
    { value: 'PRODUCTION', label: 'ขั้นตอนการผลิต', icon: '⚙️' },
    { value: 'SEED_SOURCE', label: 'แหล่งที่มาเมล็ดพันธุ์', icon: '🌱' },
    { value: 'HYGIENE', label: 'สุขอนามัยและความปลอดภัย', icon: '🛡️' },
    { value: 'OTHER', label: 'อื่นๆ', icon: '📋' }
];

const inputTypeOptions = [
    { value: 'checkbox', label: 'ติ๊กถูก (Checkbox)' },
    { value: 'text', label: 'ข้อความ (Text)' },
    { value: 'number', label: 'ตัวเลข (Number)' },
    { value: 'file', label: 'ไฟล์แนบ (File)' }
];

export default function CriteriaManagementPage() {
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<CriterionForm>(defaultForm);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchCriteria();
    }, []);

    async function fetchCriteria() {
        try {
            const res = await fetch('/api/proxy/v2/criteria/all');
            const data = await res.json();
            if (data.success) {
                setCriteria(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleEdit(criterion: Criterion) {
        setForm({
            code: criterion.code,
            category: criterion.category,
            categoryTH: criterion.categoryTH || '',
            label: criterion.label,
            description: criterion.description || '',
            icon: criterion.icon || '📋',
            sortOrder: criterion.sortOrder,
            isRequired: criterion.isRequired,
            inputType: criterion.inputType,
            isActive: criterion.isActive
        });
        setEditingId(criterion.id);
        setShowForm(true);
    }

    function handleNew() {
        setForm(defaultForm);
        setEditingId(null);
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const url = editingId
                ? `/api/proxy/v2/criteria/${editingId}`
                : '/api/proxy/v2/criteria';

            const res = await fetch(url, {
                method: editingId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: editingId ? 'อัปเดตเรียบร้อย' : 'สร้างเรียบร้อย' });
                setShowForm(false);
                fetchCriteria();
            } else {
                setMessage({ type: 'error', text: data.message || 'เกิดข้อผิดพลาด' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('ต้องการลบเกณฑ์นี้?')) return;

        try {
            const res = await fetch(`/api/proxy/v2/criteria/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'ลบเรียบร้อย' });
                fetchCriteria();
            } else {
                setMessage({ type: 'error', text: data.message || 'เกิดข้อผิดพลาด' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
        }
    }

    async function handleToggleActive(id: string, isActive: boolean) {
        try {
            const res = await fetch(`/api/proxy/v2/criteria/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !isActive })
            });
            const data = await res.json();
            if (data.success) {
                fetchCriteria();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">จัดการเกณฑ์เสริม</h1>
                    <p className="text-gray-500">เพิ่ม ลบ แก้ไขเกณฑ์ที่แสดงในฟอร์มใบสมัคร</p>
                </div>
                <button
                    onClick={handleNew}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    เพิ่มเกณฑ์ใหม่
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold">{editingId ? 'แก้ไขเกณฑ์' : 'เพิ่มเกณฑ์ใหม่'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสเกณฑ์ *</label>
                                <input
                                    type="text"
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    placeholder="เช่น CONTAMINANT_TEST"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={!!editingId}
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ *</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => {
                                        const opt = categoryOptions.find(o => o.value === e.target.value);
                                        setForm({
                                            ...form,
                                            category: e.target.value,
                                            categoryTH: opt?.label || '',
                                            icon: opt?.icon || '📋'
                                        });
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">-- เลือกหมวดหมู่ --</option>
                                    {categoryOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Label */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเกณฑ์ *</label>
                                <input
                                    type="text"
                                    value={form.label}
                                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                                    placeholder="เช่น ผลตรวจสารปนเปื้อน"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="คำอธิบายเพิ่มเติม..."
                                    rows={2}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Input Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท Input</label>
                                <select
                                    value={form.inputType}
                                    onChange={(e) => setForm({ ...form, inputType: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {inputTypeOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort Order */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ลำดับการแสดง</label>
                                <input
                                    type="number"
                                    value={form.sortOrder}
                                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Checkboxes */}
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.isRequired}
                                        onChange={(e) => setForm({ ...form, isRequired: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">บังคับกรอก</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">เปิดใช้งาน</span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">เกณฑ์</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">หมวดหมู่</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">ประเภท</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">สถานะ</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {criteria.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                                    ยังไม่มีเกณฑ์ในระบบ
                                </td>
                            </tr>
                        ) : (
                            criteria.map((item) => (
                                <tr key={item.id} className={!item.isActive ? 'bg-gray-50' : ''}>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-800">{item.label}</div>
                                        <div className="text-xs text-gray-500">{item.code}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                                            {item.icon} {item.categoryTH || item.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-sm text-gray-600">{item.inputType}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleToggleActive(item.id, item.isActive)}
                                            className={`px-2 py-1 rounded text-xs font-medium ${item.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-200 text-gray-600'
                                                }`}
                                        >
                                            {item.isActive ? '✓ เปิด' : '✗ ปิด'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                title="แก้ไข"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                title="ลบ"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{criteria.length}</div>
                    <div className="text-sm text-blue-600">เกณฑ์ทั้งหมด</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{criteria.filter(c => c.isActive).length}</div>
                    <div className="text-sm text-green-600">เปิดใช้งาน</div>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-600">{criteria.filter(c => !c.isActive).length}</div>
                    <div className="text-sm text-gray-600">ปิดใช้งาน</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{new Set(criteria.map(c => c.category)).size}</div>
                    <div className="text-sm text-purple-600">หมวดหมู่</div>
                </div>
            </div>
        </div>
    );
}
