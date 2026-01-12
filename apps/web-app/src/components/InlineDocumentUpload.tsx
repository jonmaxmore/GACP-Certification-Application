'use client';

import React, { useState, useRef } from 'react';

interface InlineDocumentUploadProps {
    /** Unique ID for the document */
    id: string;
    /** Document type label (Thai) */
    label: string;
    /** English label */
    labelEn?: string;
    /** Whether the document is required */
    required?: boolean;
    /** Accepted file types */
    accept?: string;
    /** Maximum file size in MB */
    maxSizeMB?: number;
    /** Hint text for the document */
    hint?: string;
    /** Current uploaded file URL */
    value?: string;
    /** Callback when file is uploaded */
    onChange?: (file: File | null, url: string | null) => void;
    /** Error message */
    error?: string;
    /** Disabled state */
    disabled?: boolean;
}

export function InlineDocumentUpload({
    id,
    label,
    labelEn,
    required = false,
    accept = '.pdf,.jpg,.jpeg,.png',
    maxSizeMB = 10,
    hint,
    value,
    onChange,
    error,
    disabled = false,
}: InlineDocumentUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File | null) => {
        setUploadError(null);

        if (!file) {
            setPreview(null);
            setFileName(null);
            onChange?.(null, null);
            return;
        }

        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            setUploadError(`ไฟล์ต้องมีขนาดไม่เกิน ${maxSizeMB} MB`);
            return;
        }

        // Validate file type
        const validTypes = accept.split(',').map(t => t.trim());
        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!validTypes.includes(fileExt)) {
            setUploadError(`รองรับเฉพาะไฟล์ ${accept}`);
            return;
        }

        setFileName(file.name);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const url = e.target?.result as string;
                setPreview(url);
                onChange?.(file, url);
            };
            reader.readAsDataURL(file);
        } else {
            // For PDFs, just show the file name
            setPreview(null);
            onChange?.(file, file.name);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;

        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleClick = () => {
        if (!disabled) fileInputRef.current?.click();
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        setFileName(null);
        onChange?.(null, null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const displayError = uploadError || error;
    const hasFile = !!preview || !!fileName;

    return (
        <div className="space-y-1.5">
            {/* Label */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-700">
                        {label}
                        {labelEn && <span className="text-slate-400 ml-1">({labelEn})</span>}
                        {required && <span className="text-red-500 ml-0.5">*</span>}
                    </span>
                </div>
                {hasFile && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="text-xs text-red-500 hover:text-red-600"
                    >
                        ลบไฟล์
                    </button>
                )}
            </div>

            {/* Hint */}
            {hint && (
                <p className="text-xs text-slate-500">{hint}</p>
            )}

            {/* Upload Area */}
            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                    relative border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer
                    ${isDragging ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}
                    ${hasFile ? 'bg-emerald-50 border-emerald-300' : 'bg-white'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${displayError ? 'border-red-300 bg-red-50' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                    className="hidden"
                    disabled={disabled}
                />

                {hasFile ? (
                    <div className="flex items-center gap-3">
                        {/* Preview or Icon */}
                        {preview && preview.startsWith('data:image') ? (
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-12 h-12 object-cover rounded border"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-emerald-100 rounded flex items-center justify-center">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">
                                {fileName}
                            </p>
                            <p className="text-xs text-emerald-600 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                อัปโหลดเรียบร้อย
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <svg className="mx-auto w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-1 text-sm text-slate-500">
                            คลิกหรือลากไฟล์มาวาง
                        </p>
                        <p className="text-xs text-slate-400">
                            {accept.replace(/\./g, '').toUpperCase()} (สูงสุด {maxSizeMB} MB)
                        </p>
                    </div>
                )}
            </div>

            {/* Error */}
            {displayError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {displayError}
                </p>
            )}
        </div>
    );
}

export default InlineDocumentUpload;
