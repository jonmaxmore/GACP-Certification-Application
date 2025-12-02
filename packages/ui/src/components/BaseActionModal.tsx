/**
 * Base Action Modal Component
 *
 * Reusable modal for approval, review, inspection, and other decision-making actions.
 * Consolidates logic from:
 * - ApprovalActionModal (farmer-portal)
 * - ReviewActionModal (farmer-portal)
 * - ReviewDialog (admin-portal)
 *
 * Features:
 * - Configurable decision options
 * - Validation with feedback
 * - Loading states
 * - Rating/feedback score
 * - Additional fields support
 * - Consistent UI/UX
 *
 * @version 1.0.0
 * @created November 4, 2025
 * @author Code Refactoring - Phase 5
 */

'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { X, AlertCircle } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DecisionOption {
  value: string;
  label: string;
  icon: ReactNode;
  color?: 'success' | 'error' | 'warning' | 'info';
  requiresReason?: boolean;
  requiresAdditionalFields?: boolean;
}

export interface BaseActionModalProps {
  // Core props
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ActionFormData) => Promise<void>;

  // Configuration
  type: 'approval' | 'review' | 'inspection' | 'custom';
  title: string;
  subtitle?: string;

  // Decision options
  decisionOptions: DecisionOption[];
  defaultDecision?: string;

  // Application/item data
  itemId: string;
  itemData: {
    name?: string;
    identifier?: string;
    [key: string]: any;
  };

  // Optional features
  showFeedbackScore?: boolean;
  showRating?: boolean;
  additionalFields?: ReactNode;

  // Validation
  minCommentLength?: number;
  requiredFields?: string[];

  // Customization
  className?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
}

export interface ActionFormData {
  decision: string;
  comments: string;
  feedbackScore?: number;
  rating?: number;
  [key: string]: any;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BaseActionModal({
  isOpen,
  onClose,
  onSubmit,
  type: _type,
  title,
  subtitle,
  decisionOptions,
  defaultDecision,
  itemId: _itemId,
  itemData,
  showFeedbackScore = false,
  showRating = false,
  additionalFields,
  minCommentLength = 10,
  requiredFields = [],
  className = '',
  submitButtonText = 'ยืนยัน',
  cancelButtonText = 'ยกเลิก',
}: BaseActionModalProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<string>(
    defaultDecision || decisionOptions[0]?.value || ''
  );
  const [comments, setComments] = useState('');
  const [feedbackScore, setFeedbackScore] = useState(3);
  const [rating, setRating] = useState(4);
  const [additionalData, setAdditionalData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setDecision(defaultDecision || decisionOptions[0]?.value || '');
      setComments('');
      setFeedbackScore(3);
      setRating(4);
      setAdditionalData({});
      setErrors({});
    }
  }, [isOpen, defaultDecision, decisionOptions]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate comments
    if (!comments.trim()) {
      newErrors.comments = 'กรุณากรอกความคิดเห็น';
    } else if (comments.trim().length < minCommentLength) {
      newErrors.comments = `ความคิดเห็นต้องมีอย่างน้อย ${minCommentLength} ตัวอักษร`;
    }

    // Validate required fields
    requiredFields.forEach((field) => {
      if (!additionalData[field]) {
        newErrors[field] = `กรุณากรอก${field}`;
      }
    });

    // Check if current decision requires additional fields
    const currentOption = decisionOptions.find((opt) => opt.value === decision);
    if (currentOption?.requiresReason && !comments.trim()) {
      newErrors.comments = 'กรุณาระบุเหตุผล';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData: ActionFormData = {
        decision,
        comments: comments.trim(),
        ...additionalData,
      };

      if (showFeedbackScore) {
        formData.feedbackScore = feedbackScore;
      }

      if (showRating) {
        formData.rating = rating;
      }

      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting action:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleAdditionalDataChange = (key: string, value: any) => {
    setAdditionalData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderDecisionOptions = () => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">การตัดสินใจ *</label>
        <div className="grid grid-cols-1 gap-2">
          {decisionOptions.map((option) => {
            const isSelected = decision === option.value;
            const colorClasses = {
              success: 'border-green-500 bg-green-50 text-green-700',
              error: 'border-red-500 bg-red-50 text-red-700',
              warning: 'border-yellow-500 bg-yellow-50 text-yellow-700',
              info: 'border-blue-500 bg-blue-50 text-blue-700',
            };
            const selectedClass = option.color && isSelected ? colorClasses[option.color] : '';

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setDecision(option.value)}
                disabled={loading}
                className={`
                  flex items-center gap-3 p-4 border-2 rounded-lg transition-all
                  ${
                    isSelected
                      ? `${selectedClass || 'border-blue-500 bg-blue-50'} ring-2 ring-offset-2 ring-blue-500`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className={`text-2xl ${isSelected ? '' : 'opacity-50'}`}>{option.icon}</div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{option.label}</div>
                </div>
                {isSelected && (
                  <div className="text-green-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCommentsField = () => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">ความคิดเห็น *</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          disabled={loading}
          rows={4}
          className={`
            w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${errors.comments ? 'border-red-500' : 'border-gray-300'}
            ${loading ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
          `}
          placeholder="กรุณากรอกความคิดเห็นของคุณ..."
        />
        {errors.comments && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.comments}</span>
          </div>
        )}
        <div className="text-sm text-gray-500">
          {comments.length} / {minCommentLength} ตัวอักษรขั้นต่ำ
        </div>
      </div>
    );
  };

  const renderFeedbackScore = () => {
    if (!showFeedbackScore) return null;

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">คะแนนความพึงพอใจ</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="5"
            value={feedbackScore}
            onChange={(e) => setFeedbackScore(Number(e.target.value))}
            disabled={loading}
            className="flex-1"
          />
          <div className="text-2xl font-bold text-blue-600 w-12 text-center">{feedbackScore}</div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>น้อยที่สุด</span>
          <span>มากที่สุด</span>
        </div>
      </div>
    );
  };

  const renderRating = () => {
    if (!showRating) return null;

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">คะแนนประเมิน</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              disabled={loading}
              className={`text-3xl transition-all ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Item Info */}
          {(itemData.name || itemData.identifier) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">รายการ:</div>
              <div className="font-semibold text-gray-900">
                {itemData.identifier && (
                  <span className="text-blue-600">{itemData.identifier}</span>
                )}
                {itemData.identifier && itemData.name && <span className="mx-2">-</span>}
                {itemData.name && <span>{itemData.name}</span>}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-6">
            {renderDecisionOptions()}
            {renderCommentsField()}
            {renderFeedbackScore()}
            {renderRating()}

            {/* Additional Fields */}
            {additionalFields && (
              <div className="space-y-4">
                {React.cloneElement(additionalFields as React.ReactElement<any>, {
                  onChange: handleAdditionalDataChange,
                  disabled: loading,
                  errors,
                })}
              </div>
            )}
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-red-800">เกิดข้อผิดพลาด</div>
                <div className="text-sm text-red-700 mt-1">{errors.submit}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {loading ? 'กำลังดำเนินการ...' : submitButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS (Optional)
// ============================================================================

/**
 * Pre-configured for common use cases
 */
export const ApprovalModal = (props: Omit<BaseActionModalProps, 'type' | 'decisionOptions'>) => (
  <BaseActionModal
    {...props}
    type="approval"
    decisionOptions={[
      { value: 'approve', label: 'อนุมัติ', icon: '✅', color: 'success' },
      { value: 'reject', label: 'ปฏิเสธ', icon: '❌', color: 'error', requiresReason: true },
      {
        value: 'send_back',
        label: 'ส่งกลับแก้ไข',
        icon: '↩️',
        color: 'warning',
        requiresReason: true,
      },
    ]}
  />
);

export const ReviewModal = (props: Omit<BaseActionModalProps, 'type' | 'decisionOptions'>) => (
  <BaseActionModal
    {...props}
    type="review"
    decisionOptions={[
      { value: 'approve', label: 'ผ่าน', icon: '✅', color: 'success' },
      { value: 'reject', label: 'ไม่ผ่าน', icon: '❌', color: 'error', requiresReason: true },
      { value: 'request_info', label: 'ขอข้อมูลเพิ่มเติม', icon: 'ℹ️', color: 'info' },
    ]}
  />
);
