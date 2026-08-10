import React, { useState, useRef } from 'react';
import { X, Upload, RotateCw, ZoomIn, Check, Crop } from 'lucide-react';
import { presetAvatarGradients, renderPresetAvatar, getInitials } from '@/constants/avatars';

interface AvatarStepProps {
  displayName: string;
  avatarUrl: string | null;
  avatarPreset: number;
  onUploadFile: (file: File) => void;
  onSelectPreset: (presetIdx: number) => void;
  onRemovePhoto: () => void;
  isDark: boolean;
}

export const AvatarStep: React.FC<AvatarStepProps> = ({
  displayName,
  avatarUrl,
  avatarPreset,
  onUploadFile,
  onSelectPreset,
  onRemovePhoto,
  isDark,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WhatsApp-style Photo Adjuster Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270

  // Mouse/Touch Drag state for pan
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
      // Reset adjuster controls for new file
      setZoom(1.0);
      setPanX(0);
      setPanY(0);
      setRotation(0);
    }
  };

  // Drag Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ x: panX, y: panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setPanX(panStart.x + deltaX);
    setPanY(panStart.y + deltaY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setPanStart({ x: panX, y: panY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStart.x;
    const deltaY = e.touches[0].clientY - dragStart.y;
    setPanX(panStart.x + deltaX);
    setPanY(panStart.y + deltaY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Canvas export handler for saving cropped avatar
  const handleSaveAdjustments = () => {
    if (!avatarUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 320; // High resolution output
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      ctx.save();
      // Center canvas origin for transforms
      ctx.translate(size / 2 + panX * (size / 220), size / 2 + panY * (size / 220));
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Draw image filling circle scale
      const aspect = img.width / img.height;
      let drawWidth = size;
      let drawHeight = size;

      if (aspect > 1) {
        drawWidth = size * aspect;
        drawHeight = size;
      } else {
        drawWidth = size;
        drawHeight = size / aspect;
      }

      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], 'avatar_cropped.png', { type: 'image/png' });
          onUploadFile(croppedFile);
          setIsAdjustModalOpen(false);
        }
      }, 'image/png');
    };

    img.src = avatarUrl;
  };

  const modalColors = {
    bg: isDark ? '#140C2C' : '#FFFFFF',
    headerBg: isDark ? '#1A0E38' : '#F8FAFC',
    viewportBg: isDark ? '#0A041A' : '#F1F5F9',
    textPrimary: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? 'rgba(255, 255, 255, 0.65)' : '#64748B',
    border: isDark ? 'rgba(124, 58, 237, 0.25)' : '#E2E8F0',
    maskOverlay: isDark ? 'rgba(10, 4, 26, 0.80)' : 'rgba(241, 245, 249, 0.85)',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 20, width: '100%', height: '100%', alignItems: 'center', boxSizing: 'border-box' }}>
      {/* Left Column: Avatar Preview & Name */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
        <div style={{ position: 'relative' }}>
          {avatarUrl ? (
            <div style={{
              width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
              border: '3px solid #6366F1', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
              position: 'relative', background: isDark ? '#0A041A' : '#F8FAFC'
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt="Avatar preview"
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          ) : avatarPreset === 0 ? (
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(168,85,247,0.12))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 800, color: '#6366F1',
              border: '3px solid #6366F1',
            }}>
              {getInitials(displayName)}
            </div>
          ) : (
            renderPresetAvatar(avatarPreset, 80, 32)
          )}

          {/* Floating Edit Icon Badge beside profile image circle */}
          {avatarUrl && (
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(true)}
              title="Edit / Crop photo"
              style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 26, height: 26, borderRadius: '50%',
                background: '#6366F1', color: '#FFFFFF',
                border: `2px solid ${isDark ? '#140C2C' : '#FFFFFF'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
                transition: 'transform 180ms ease, background 180ms ease',
              }}
              className="hover:scale-110 active:scale-95"
            >
              <Crop size={13} strokeWidth={2.2} />
            </button>
          )}
        </div>

        <span style={{ fontSize: 13.5, fontWeight: 700, color: isDark ? '#FFFFFF' : '#18181B' }}>
          {displayName || 'Shiv Patel'}
        </span>
      </div>

      {/* Right Column: Upload Box + Preset Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Upload Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#FFFFFF' : '#18181B' }}>
            Upload your photo
          </span>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '14px', borderRadius: 12,
              border: `2px dashed ${isDark ? 'rgba(99, 102, 241, 0.4)' : '#C7D2FE'}`,
              background: isDark ? 'rgba(99, 102, 241, 0.05)' : '#F5F3FF',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4, cursor: 'pointer', transition: 'all 180ms ease',
            }}
            className="hover:!border-[#6366F1] hover:!bg-[rgba(99,102,241,0.08)]"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6366F1', fontSize: 12.5, fontWeight: 700 }}>
              <Upload size={15} /> Upload Image
            </div>
            <span style={{ fontSize: 10.5, color: isDark ? 'rgba(255,255,255,0.45)' : '#71717A' }}>
              PNG, JPG or WEBP (Max 5MB)
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {/* Remove custom image action */}
          {avatarUrl && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
              <button
                type="button"
                onClick={onRemovePhoto}
                style={{
                  padding: '5px 12px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
                  background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.25)', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  transition: 'all 180ms ease'
                }}
                className="hover:!bg-[#EF4444] hover:!text-white"
              >
                <X size={13} /> Remove custom image
              </button>
            </div>
          )}
        </div>

        {/* Divider line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.08)' : '#E4E4E7' }} />
          <span style={{ fontSize: 10.5, color: isDark ? 'rgba(255,255,255,0.4)' : '#A1A1AA' }}>or</span>
          <div style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.08)' : '#E4E4E7' }} />
        </div>

        {/* Choose an Avatar Preset Row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#FFFFFF' : '#18181B' }}>
            Choose an avatar
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Initials button */}
            <button
              type="button"
              onClick={() => onSelectPreset(0)}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: isDark ? 'rgba(99, 102, 241, 0.2)' : '#F5F3FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: '#6366F1',
                border: avatarPreset === 0 && !avatarUrl ? '2px solid #6366F1' : '1.5px solid #E4E4E7',
                cursor: 'pointer', transition: 'all 180ms ease'
              }}
              title="Use initials avatar"
            >
              {getInitials(displayName)}
            </button>

            {presetAvatarGradients.map((_: string, i: number) => {
              const presetIdx = i + 1;
              const isActive = avatarPreset === presetIdx && !avatarUrl;
              return (
                <button
                  key={presetIdx}
                  type="button"
                  onClick={() => onSelectPreset(presetIdx)}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    borderRadius: '50%',
                    outline: isActive ? '2px solid #6366F1' : 'none',
                    outlineOffset: 2,
                    transition: 'all 180ms ease'
                  }}
                >
                  {renderPresetAvatar(presetIdx, 38, 16)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Theme-Aware Photo Cropper & Repositioner Modal */}
      {isAdjustModalOpen && avatarUrl && (
        <>
          {/* Backdrop matching page theme */}
          <div
            onClick={() => setIsAdjustModalOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: isDark ? 'rgba(5, 2, 16, 0.82)' : 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(8px)', zIndex: 100000,
            }}
          />

          {/* Cropper Modal Container */}
          <div
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '92%', maxWidth: 460, zIndex: 100001,
              background: modalColors.bg, color: modalColors.textPrimary,
              border: `1.5px solid ${modalColors.border}`,
              borderRadius: 24,
              boxShadow: isDark
                ? '0 25px 60px rgba(0,0,0,0.50)'
                : '0 20px 60px rgba(124, 58, 237, 0.12), 0 2px 10px rgba(0,0,0,0.04)',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
              animation: 'dropdownFadeIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: `1px solid ${modalColors.border}`, background: modalColors.headerBg,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: 'rgba(99, 102, 241, 0.14)', color: '#6366F1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Crop size={16} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: modalColors.textPrimary, margin: 0 }}>
                    Adjust & Crop Photo
                  </h3>
                  <span style={{ fontSize: 11, color: modalColors.textSecondary }}>
                    Drag photo to reposition inside crop ring
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: modalColors.textSecondary, padding: 4, borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                className="hover:!text-[#6366F1]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Viewport with Drag & Theme-Matched Circular Crop Ring Overlay (280px height) */}
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                width: '100%', height: 280, background: modalColors.viewportBg,
                position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none',
              }}
            >
              {/* Image transform canvas */}
              <div
                style={{
                  position: 'absolute', width: 200, height: 200,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: `scale(${zoom}) translate(${panX}px, ${panY}px) rotate(${rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 100ms ease',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt="Crop target"
                  style={{
                    maxWidth: 'none', width: '100%', height: '100%',
                    objectFit: 'cover', display: 'block', pointerEvents: 'none',
                  }}
                />
              </div>

              {/* Theme-Matched Frosted Circular Mask Overlay */}
              <div
                style={{
                  position: 'absolute', width: 200, height: 200,
                  borderRadius: '50%',
                  border: '3px solid #6366F1',
                  boxShadow: `0 0 0 9999px ${modalColors.maskOverlay}`,
                  pointerEvents: 'none',
                }}
              />

              <div style={{
                position: 'absolute', bottom: 12,
                fontSize: 11, fontWeight: 600, color: modalColors.textSecondary,
                background: isDark ? 'rgba(20, 10, 40, 0.80)' : 'rgba(255, 255, 255, 0.85)',
                padding: '5px 12px', borderRadius: 99,
                border: `1px solid ${modalColors.border}`,
                pointerEvents: 'none', backdropFilter: 'blur(6px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                Drag photo to move • Slider to zoom
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div style={{ padding: '16px 24px', background: modalColors.headerBg, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Zoom Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ZoomIn size={15} style={{ color: '#6366F1', flexShrink: 0 }} />
                <input
                  type="range"
                  min="0.8"
                  max="3.0"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: '#6366F1', cursor: 'pointer' }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#6366F1', minWidth: 35, textAlign: 'right' }}>
                  {zoom.toFixed(1)}x
                </span>
              </div>

              {/* Footer Actions: Rotate, Reset, Cancel, Save */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                    background: isDark ? 'rgba(99, 102, 241, 0.14)' : '#F1F5F9',
                    color: colorsText(isDark), border: `1px solid ${modalColors.border}`,
                    cursor: 'pointer', transition: 'all 180ms ease'
                  }}
                  className="hover:!border-[#6366F1] hover:!text-[#6366F1]"
                >
                  <RotateCw size={13} /> Rotate ({rotation}°)
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1.0);
                      setPanX(0);
                      setPanY(0);
                      setRotation(0);
                    }}
                    style={{
                      padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                      background: 'transparent', color: modalColors.textSecondary, border: 'none', cursor: 'pointer'
                    }}
                    className="hover:!text-[#6366F1]"
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAdjustments}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '9px 20px', borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                      background: '#6366F1', color: '#FFFFFF', border: 'none', cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                      transition: 'all 180ms ease'
                    }}
                    className="hover:brightness-110 active:scale-95"
                  >
                    <Check size={14} strokeWidth={3} /> Apply Crop
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

function colorsText(isDark: boolean): string {
  return isDark ? '#FFFFFF' : '#0F172A';
}
