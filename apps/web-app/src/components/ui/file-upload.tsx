"use client";

import { useState, useRef, useCallback } from "react";

interface FileUploadProps {
    onFileSelect: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
    label?: string;
    hint?: string;
    disabled?: boolean;
    uploading?: boolean;
    uploadProgress?: number;
    theme?: "light" | "dark";
}

const themes = {
    light: {
        bg: "#FFFFFF",
        bgHover: "#F9FAFB",
        border: "#E5E7EB",
        borderActive: "#16A34A",
        text: "#111827",
        textMuted: "#6B7280",
        accent: "#16A34A",
        accentBg: "rgba(22, 163, 74, 0.08)",
        error: "#EF4444",
        errorBg: "rgba(239, 68, 68, 0.08)",
    },
    dark: {
        bg: "rgba(15, 23, 42, 0.6)",
        bgHover: "rgba(15, 23, 42, 0.8)",
        border: "rgba(255, 255, 255, 0.08)",
        borderActive: "#10B981",
        text: "#F8FAFC",
        textMuted: "#94A3B8",
        accent: "#10B981",
        accentBg: "rgba(16, 185, 129, 0.15)",
        error: "#EF4444",
        errorBg: "rgba(239, 68, 68, 0.15)",
    }
};

const Icons = {
    upload: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    ),
    file: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
        </svg>
    ),
    check: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    x: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    image: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    ),
    pdf: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M10 12h4" />
            <path d="M10 16h4" />
        </svg>
    ),
};

export default function FileUpload({
    onFileSelect,
    accept = ".pdf,.jpg,.jpeg,.png",
    multiple = true,
    maxSize = 10,
    label = "อัปโหลดไฟล์",
    hint = "ลากไฟล์มาวาง หรือคลิกเพื่อเลือก",
    disabled = false,
    uploading = false,
    uploadProgress = 0,
    theme = "light",
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const t = themes[theme];

    const validateFile = useCallback((file: File): string | null => {
        const maxBytes = maxSize * 1024 * 1024;
        if (file.size > maxBytes) {
            return `ไฟล์ ${file.name} มีขนาดเกิน ${maxSize} MB`;
        }

        const acceptedTypes = accept.split(",").map(t => t.trim().toLowerCase());
        const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
        const mimeType = file.type.toLowerCase();

        const isAccepted = acceptedTypes.some(at => {
            if (at.startsWith(".")) return fileExt === at;
            if (at.includes("*")) return mimeType.startsWith(at.replace("*", ""));
            return mimeType === at;
        });

        if (!isAccepted) {
            return `ประเภทไฟล์ ${fileExt} ไม่รองรับ`;
        }

        return null;
    }, [maxSize, accept]);

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return;

        setError(null);
        const fileArray = Array.from(files);

        // Validate each file
        for (const file of fileArray) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        const newFiles = multiple ? [...selectedFiles, ...fileArray] : fileArray;
        setSelectedFiles(newFiles);
        onFileSelect(newFiles);
    }, [multiple, selectedFiles, onFileSelect, validateFile]);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && !uploading) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (!disabled && !uploading) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleClick = () => {
        if (!disabled && !uploading && inputRef.current) {
            inputRef.current.click();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        if (inputRef.current) inputRef.current.value = "";
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        onFileSelect(newFiles);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith("image/")) return <Icons.image />;
        if (file.type === "application/pdf") return <Icons.pdf />;
        return <Icons.file />;
    };

    return (
        <div style={{ width: "100%" }}>
            {/* Label */}
            {label && (
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px", color: t.text }}>
                    {label}
                </label>
            )}

            {/* Dropzone */}
            <div
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                    padding: "32px",
                    borderRadius: "16px",
                    border: `2px dashed ${isDragging ? t.borderActive : error ? t.error : t.border}`,
                    backgroundColor: isDragging ? t.accentBg : error ? t.errorBg : t.bg,
                    cursor: disabled || uploading ? "not-allowed" : "pointer",
                    textAlign: "center",
                    transition: "all 0.2s",
                    opacity: disabled ? 0.5 : 1,
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleInputChange}
                    style={{ display: "none" }}
                    disabled={disabled || uploading}
                />

                <div style={{ color: isDragging ? t.accent : t.textMuted, marginBottom: "12px" }}>
                    <Icons.upload />
                </div>

                <p style={{ fontSize: "14px", color: t.text, margin: "0 0 4px", fontWeight: 500 }}>
                    {hint}
                </p>
                <p style={{ fontSize: "12px", color: t.textMuted, margin: 0 }}>
                    {accept.split(",").join(", ")} (สูงสุด {maxSize} MB)
                </p>

                {uploading && (
                    <div style={{ marginTop: "16px" }}>
                        <div style={{ height: "4px", backgroundColor: t.border, borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{
                                height: "100%",
                                width: `${uploadProgress}%`,
                                backgroundColor: t.accent,
                                transition: "width 0.3s"
                            }} />
                        </div>
                        <p style={{ fontSize: "12px", color: t.textMuted, margin: "8px 0 0" }}>
                            กำลังอัปโหลด... {uploadProgress}%
                        </p>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <p style={{ marginTop: "8px", fontSize: "13px", color: t.error }}>⚠️ {error}</p>
            )}

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {selectedFiles.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px",
                                backgroundColor: t.bg,
                                border: `1px solid ${t.border}`,
                                borderRadius: "12px",
                            }}
                        >
                            <div style={{ color: t.accent }}>
                                {getFileIcon(file)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    color: t.text,
                                    margin: 0,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}>
                                    {file.name}
                                </p>
                                <p style={{ fontSize: "11px", color: t.textMuted, margin: "2px 0 0" }}>
                                    {formatFileSize(file.size)}
                                </p>
                            </div>
                            {!uploading && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                    style={{
                                        width: "28px",
                                        height: "28px",
                                        borderRadius: "8px",
                                        border: "none",
                                        backgroundColor: t.errorBg,
                                        color: t.error,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Icons.x />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

