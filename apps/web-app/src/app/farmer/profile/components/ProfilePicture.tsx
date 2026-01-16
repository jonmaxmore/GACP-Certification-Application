// File: src/app/farmer/profile/components/ProfilePicture.tsx
"use client";

import React, { useState, useRef } from 'react';
import { IconUser, IconCamera } from '@/components/ui/icons';

interface ProfilePictureProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  isEditing: boolean;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ currentImage, onImageChange, isEditing }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('รูปภาพต้องมีขนาดไม่เกิน 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('profileImage', fileInputRef.current.files[0]);
    
    try {
      const response = await fetch('/api/auth/profile/image', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        onImageChange(result.profileImage);
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      alert('อัพโหลดรูปภาพไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="w-32 h-32 bg-white rounded-full shadow-elevated mx-auto mb-6 flex items-center justify-center border-4 border-white overflow-hidden">
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : currentImage ? (
          <img src={currentImage} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <IconUser className="w-16 h-16 text-slate-400" />
        )}
      </div>
      
      {isEditing && (
        <>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-all"
            disabled={uploading}
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <IconCamera className="w-4 h-4" />
            )}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};

export default ProfilePicture;
