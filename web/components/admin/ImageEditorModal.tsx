"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl: string | null;
  itemTitle: string;
  itemSlug: string;
  folder?: string;
  onSave: (newUrl: string) => void;
}

export default function ImageEditorModal({
  isOpen,
  onClose,
  currentImageUrl,
  itemTitle,
  itemSlug,
  folder = "equipment/",
  onSave,
}: ImageEditorModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"adjust" | "gallery">("adjust");

  useEffect(() => {
    setMounted(true);
  }, []);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 1200, height: 900 });
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({ width: 560, height: 420 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with current image or placeholder
  useEffect(() => {
    if (isOpen) {
      if (currentImageUrl) {
        setImageSrc(currentImageUrl.startsWith("http") ? currentImageUrl : `/media/${currentImageUrl}`);
      } else {
        setImageSrc(null);
      }
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
      setError(null);
    }
  }, [isOpen, currentImageUrl]);

  // Measure viewport dimensions when open
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setViewportSize({ width: rect.width, height: rect.height });
      }
    }
  }, [isOpen, activeTab, imageSrc]);

  // Track natural image dimensions
  useEffect(() => {
    if (!imageSrc) return;
    const testImg = new window.Image();
    testImg.src = imageSrc;
    if (testImg.complete && testImg.naturalWidth > 0) {
      setNaturalSize({ width: testImg.naturalWidth, height: testImg.naturalHeight });
    } else {
      testImg.onload = () => {
        if (testImg.naturalWidth > 0 && testImg.naturalHeight > 0) {
          setNaturalSize({ width: testImg.naturalWidth, height: testImg.naturalHeight });
        }
      };
    }
  }, [imageSrc]);

  // Calculate base scale so image comfortably fits inside 4:3 frame by default
  const frameWidth = viewportSize.width || 560;
  const frameHeight = viewportSize.height || 420;
  const baseScale = Math.min(
    frameWidth / (naturalSize.width || 1200),
    frameHeight / (naturalSize.height || 900)
  );
  const displayWidth = (naturalSize.width || 1200) * baseScale;
  const displayHeight = (naturalSize.height || 900) * baseScale;

  // Load available gallery images
  useEffect(() => {
    if (isOpen && activeTab === "gallery" && galleryImages.length === 0) {
      setGalleryLoading(true);
      fetch("/api/gallery")
        .then((res) => res.json())
        .then((data) => {
          if (data.images) setGalleryImages(data.images);
        })
        .catch(() => {})
        .finally(() => setGalleryLoading(false));
    }
  }, [isOpen, activeTab, galleryImages.length]);

  // Handle Drag & Drop of image file
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setError(null);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      loadImageFile(file);
    } else {
      setError("Please drop a valid image file (WebP, PNG, JPEG).");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImageFile(file);
    }
  };

  const loadImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
      setActiveTab("adjust");
    };
    reader.readAsDataURL(file);
  };

  // Mouse & Touch pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageSrc || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
  };

  // Global drag listener so dragging outside frame remains smooth
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        setPan({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y,
        });
      }
    };

    const onTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, dragStart]);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!imageSrc) return;
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setZoom((prev) => Math.min(3.5, Math.max(0.2, parseFloat((prev + delta).toFixed(2)))));
  };

  // Reset to initial centered state
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  // Rotate 90 degrees
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Export cropped canvas & upload to storage
  const handleApplyAndSave = async () => {
    if (!imageSrc) return;
    setUploading(true);
    setError(null);

    try {
      const img = new window.Image();
      if (!imageSrc.startsWith("data:")) {
        img.crossOrigin = "anonymous";
      }
      img.src = imageSrc;

      await new Promise<void>((resolve, reject) => {
        if (img.complete && img.naturalWidth > 0) {
          resolve();
          return;
        }
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load source image for cropping."));
      });

      // Target high-resolution canvas with 4:3 aspect ratio (1200 x 900)
      const canvas = document.createElement("canvas");
      const targetWidth = 1200;
      const targetHeight = 900;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not initialize canvas context.");

      // Background black fill
      ctx.fillStyle = "#0A0A0B";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Current actual frame dimensions on user screen
      const currentViewport = containerRef.current;
      const curFrameWidth = currentViewport?.clientWidth || 560;
      const curFrameHeight = currentViewport?.clientHeight || 420;

      // Scale multiplier from screen pixels to canvas pixels (1200 / 560 ≈ 2.142857)
      const canvasScale = targetWidth / curFrameWidth;

      ctx.save();
      // 1. Move to canvas center (600, 450)
      ctx.translate(targetWidth / 2, targetHeight / 2);

      // 2. Pan in canvas coordinates (exact match to screen displacement)
      ctx.translate(pan.x * canvasScale, pan.y * canvasScale);

      // 3. Rotate around center
      ctx.rotate((rotation * Math.PI) / 180);

      // 4. Scale to match screen appearance exactly
      // On screen: image width = img.naturalWidth * baseScale * zoom
      // On canvas: image width = screenWidth * canvasScale
      const totalScale = baseScale * canvasScale * zoom;
      ctx.scale(totalScale, totalScale);

      // 5. Draw image centered
      ctx.drawImage(
        img,
        -img.naturalWidth / 2,
        -img.naturalHeight / 2,
        img.naturalWidth,
        img.naturalHeight
      );
      ctx.restore();

      // Convert canvas to WebP Blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/webp", 0.92);
      });

      if (!blob) throw new Error("Could not generate image blob.");

      // Upload via server API
      const formData = new FormData();
      formData.append("file", blob, `${itemSlug}.webp`);
      formData.append("folder", folder);
      formData.append("name", `${itemSlug}-${Date.now()}.webp`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      // Notify caller of new URL
      onSave(data.url);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process and save image.");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="im-modal" role="dialog" aria-modal="true">
      <div className="im-modal__backdrop" onClick={onClose} />
      <div className="im-modal__dialog">
        <header className="im-modal__head">
          <div>
            <h2>Frame & Crop Image</h2>
            <p>
              Viewing Frame for <b>{itemTitle}</b> · Recommended 4:3 Ratio
            </p>
          </div>
          <button type="button" className="im-modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="im-modal__tabs">
          <button
            type="button"
            className={`im-modal__tab ${activeTab === "adjust" ? "is-active" : ""}`}
            onClick={() => setActiveTab("adjust")}
          >
            Pan, Zoom & Crop
          </button>
          <button
            type="button"
            className={`im-modal__tab ${activeTab === "gallery" ? "is-active" : ""}`}
            onClick={() => setActiveTab("gallery")}
          >
            Select from Fleet Library
          </button>
        </div>

        {activeTab === "adjust" ? (
          <div className="im-modal__body">
            {/* Visual Frame Container */}
            <div
              className={`im-modal__viewport ${isDragging ? "is-dragging" : ""}`}
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onWheel={handleWheel}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {imageSrc ? (
                <div
                  className="im-modal__img-layer"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: `${displayWidth}px`,
                    height: `${displayHeight}px`,
                    marginLeft: `-${displayWidth / 2}px`,
                    marginTop: `-${displayHeight / 2}px`,
                    transformOrigin: "center center",
                    transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                  }}
                >
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Preview"
                    draggable={false}
                    className="im-modal__img"
                    onLoad={(e) => {
                      const el = e.currentTarget;
                      if (el.naturalWidth > 0 && el.naturalHeight > 0) {
                        setNaturalSize({ width: el.naturalWidth, height: el.naturalHeight });
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="im-modal__empty">
                  <p>Drag and drop a photo here, or browse from computer</p>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </button>
                </div>
              )}

              {/* 4:3 Viewing Frame Cutout Overlay */}
              <div className="im-modal__overlay">
                <div className="im-modal__cutout">
                  {/* Rule of thirds grid lines */}
                  <div className="im-grid-line im-grid-line--h1" />
                  <div className="im-grid-line im-grid-line--h2" />
                  <div className="im-grid-line im-grid-line--v1" />
                  <div className="im-grid-line im-grid-line--v2" />

                  {/* Corner accents */}
                  <span className="im-corner im-corner--tl" />
                  <span className="im-corner im-corner--tr" />
                  <span className="im-corner im-corner--bl" />
                  <span className="im-corner im-corner--br" />

                  <span className="im-badge">Viewing Frame (4:3)</span>
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="im-modal__controls">
              <div className="im-ctrl-group">
                <label className="im-ctrl-label">Zoom: {Math.round(zoom * 100)}%</label>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.02"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  disabled={!imageSrc}
                />
              </div>

              <div className="im-ctrl-btns">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={handleRotate}
                  disabled={!imageSrc}
                  title="Rotate 90 degrees clockwise"
                >
                  Rotate 90°
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={handleReset}
                  disabled={!imageSrc}
                  title="Reset position and zoom"
                >
                  Reset Fit
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Replace File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  style={{ display: "none" }}
                  onChange={handleFileInput}
                />
              </div>
            </div>

            {error && <p className="im-modal__err">{error}</p>}
            <p className="im-modal__hint">
              💡 <b>Tip:</b> Click and drag the image inside the frame to pan. Use your mouse scroll wheel or the slider to zoom in and out.
            </p>
          </div>
        ) : (
          /* Fleet Library Gallery Tab */
          <div className="im-modal__gallery">
            <p className="im-modal__hint" style={{ marginBottom: "16px" }}>
              Click any photo from our catalog to load it into the framing editor:
            </p>
            {galleryLoading ? (
              <p style={{ textAlign: "center", padding: "40px", color: "var(--steel)" }}>
                Loading fleet photos…
              </p>
            ) : (
              <div className="im-gallery__grid">
                {galleryImages.map((img) => (
                  <button
                    key={img}
                    type="button"
                    className="im-gallery__item"
                    onClick={() => {
                      setImageSrc(img);
                      setActiveTab("adjust");
                      handleReset();
                    }}
                  >
                    <Image
                      src={img}
                      alt="Fleet option"
                      width={200}
                      height={150}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    />
                    <span className="im-gallery__label">{img.split("/").pop()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <footer className="im-modal__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleApplyAndSave}
            disabled={!imageSrc || uploading}
          >
            {uploading ? "Applying & Uploading…" : "Apply & Save to Website"}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}

