'use client';

import { useState, useRef, useCallback } from 'react';

interface DocumentUploadCardProps {
    id: string;
    label: string;
    hint?: string;
    required?: boolean;
    accept?: string;
    maxSize?: number; // MB
    value?: {
        file?: File;
        url?: string;
        name?: string;
        type?: string;
    };
    onChange: (value: { file?: File; url?: string; name?: string; type?: string } | null) => void;
    onPreview?: (file: File) => void;
}

export function DocumentUploadCard({
    id,
    label,
    hint,
    required = false,
    accept = '.pdf,.jpg,.jpeg,.png',
    maxSize = 5,
    value,
    onChange,
    onPreview,
}: DocumentUploadCardProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFile = useCallback((file: File): string | null => {
        const maxBytes = maxSize * 1024 * 1024;
        if (file.size > maxBytes) {
            return `ไฟล์มีขนาดเกิน ${maxSize} MB`;
        }

        const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
        const isAccepted = acceptedTypes.some(at => fileExt === at || file.type.includes(at.replace('.', '')));

        if (!isAccepted) {
            return `รองรับเฉพาะไฟล์ ${accept}`;
        }

        return null;
    }, [accept, maxSize]);

    const handleFile = useCallback((file: File) => {
        setError(null);

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        // Create preview URL for images
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else if (file.type === 'application/pdf') {
            setPreviewUrl('pdf');
        } else {
            setPreviewUrl(null);
        }

        onChange({
            file,
            name: file.name,
            type: file.type,
        });

        if (onPreview) {
            onPreview(file);
        }
    }, [validateFile, onChange, onPreview]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleRemove = () => {
        if (previewUrl && previewUrl !== 'pdf') {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setError(null);
        onChange(null);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const hasFile = value?.file || value?.url;

    return (
        <div className="mb-4">
            {/* Label */}
            <label className="block text-sm font-semibold text-gray-800 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Hint */}
            {hint && (
                <p className="text-xs text-gray-500 mb-2">{hint}</p>
            )}

            {/* Upload Zone */}
            {!hasFile ? (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className={`
                        relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                        transition-all duration-200
                        ${isDragging
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50'
                        }
                        ${error ? 'border-red-400 bg-red-50' : ''}
                    `}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        onChange={handleInputChange}
                        className="hidden"
                        id={id}
                    />

                    {/* Upload Icon */}
                    <div className={`mx-auto mb-3 ${isDragging ? 'text-emerald-500' : 'text-gray-400'}`}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>

                    <p className="text-sm font-medium text-gray-700 mb-1">
                        {isDragging ? 'วางไฟล์ที่นี่' : 'ลากไฟล์มาวาง หรือคลิกเพื่อเลือก'}
                    </p>
                    <p className="text-xs text-gray-500">
                        {accept.split(',').map(a => a.replace('.', '').toUpperCase()).join(', ')} • สูงสุด {maxSize} MB
                    </p>
                </div>
            ) : (
                /* Preview Zone */
                <div className="border-2 border-emerald-500 rounded-xl overflow-hidden bg-emerald-50">
                    {/* Preview Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-emerald-100/50 border-b border-emerald-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800 truncate max-w-48">
                                    {value?.name || 'ไฟล์ที่อัปโหลด'}
                                </p>
                                {value?.file && (
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(value.file.size)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleRemove}
                            className="px-3 py-1.5 rounded-lg bg-red-100 text-red-600 text-xs font-medium hover:bg-red-200 transition-colors"
                        >
                            ลบ
                        </button>
                    </div>

                    {/* Preview Content */}
                    <div className="p-4">
                        {previewUrl && previewUrl !== 'pdf' ? (
                            /* Image Preview */
                            <div className="relative rounded-lg overflow-hidden bg-white border border-gray-200">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-48 object-contain"
                                />
                                {/* AI Ready Badge */}
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded-md">
                                    <p className="text-xs text-white flex items-center gap-1">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 16v-4" />
                                            <path d="M12 8h.01" />
                                        </svg>
                                        พร้อมให้ AI ตรวจสอบ
                                    </p>
                                </div>
                            </div>
                        ) : previewUrl === 'pdf' ? (
                            /* PDF Preview */
                            <div className="flex items-center justify-center h-32 rounded-lg bg-white border border-gray-200">
                                <div className="text-center">
                                    <svg className="mx-auto text-red-500 mb-2" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <path d="M10 12h4" />
                                        <path d="M10 16h4" />
                                    </svg>
                                    <p className="text-sm font-medium text-gray-700">PDF Document</p>
                                    <p className="text-xs text-gray-500 mt-1">พร้อมให้ AI ตรวจสอบ</p>
                                </div>
                            </div>
                        ) : value?.url ? (
                            /* URL Preview */
                            <div className="flex items-center justify-center h-32 rounded-lg bg-white border border-gray-200">
                                <div className="text-center">
                                    <svg className="mx-auto text-emerald-500 mb-2" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <polyline points="16 13 12 17 8 13" />
                                    </svg>
                                    <p className="text-sm font-medium text-gray-700">อัปโหลดสำเร็จ</p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

export { FileUpload } from './file-upload';
