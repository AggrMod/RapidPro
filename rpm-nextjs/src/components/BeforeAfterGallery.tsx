"use client";

import { useState } from "react";
import styles from "./BeforeAfterGallery.module.css";

interface GalleryItem {
  id: string;
  title: string;
  equipment: string;
  issue: string;
  solution: string;
  location: string;
  beforeImage: string;
  afterImage: string;
}

// Placeholder images - in production these would be real repair photos
const galleryItems: GalleryItem[] = [
  {
    id: "1",
    title: "Commercial Oven Restoration",
    equipment: "Vulcan 6-Burner Gas Range",
    issue: "Uneven heating, pilot light failure, rusted burner caps",
    solution: "Replaced pilot assembly, cleaned burners, calibrated thermostats",
    location: "Downtown Memphis Restaurant",
    beforeImage: "/images/gallery/oven-before.jpg",
    afterImage: "/images/gallery/oven-after.jpg",
  },
  {
    id: "2",
    title: "Walk-In Cooler Repair",
    equipment: "Kolpak Walk-In Cooler",
    issue: "Temperature fluctuations, ice buildup, compressor issues",
    solution: "Defrost system repair, refrigerant recharge, door seal replacement",
    location: "Germantown Catering Company",
    beforeImage: "/images/gallery/cooler-before.jpg",
    afterImage: "/images/gallery/cooler-after.jpg",
  },
  {
    id: "3",
    title: "Commercial Fryer Overhaul",
    equipment: "Pitco Frialator Deep Fryer",
    issue: "Oil not reaching temperature, thermostat malfunction",
    solution: "High-limit thermostat replacement, heating element repair",
    location: "Bartlett Sports Bar",
    beforeImage: "/images/gallery/fryer-before.jpg",
    afterImage: "/images/gallery/fryer-after.jpg",
  },
  {
    id: "4",
    title: "Ice Machine Revival",
    equipment: "Manitowoc Ice Machine",
    issue: "Low ice production, water leaks, unusual noise",
    solution: "Water pump replacement, cleaning cycle, bin thermostat calibration",
    location: "Collierville Hotel",
    beforeImage: "/images/gallery/ice-before.jpg",
    afterImage: "/images/gallery/ice-after.jpg",
  },
];

interface SliderProps {
  beforeImage: string;
  afterImage: string;
  title: string;
}

function CompareSlider({ beforeImage, afterImage, title }: SliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.imageWrapper}>
        {/* After image (background) */}
        <div className={styles.afterImage}>
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>After</span>
          </div>
        </div>

        {/* Before image (foreground, clipped) */}
        <div
          className={styles.beforeImage}
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>Before</span>
          </div>
        </div>

        {/* Slider line */}
        <div
          className={styles.sliderLine}
          style={{ left: `${sliderPosition}%` }}
        >
          <div className={styles.sliderHandle}>
            <span className={styles.handleIcon}></span>
          </div>
        </div>

        {/* Hidden range input for accessibility */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleSliderChange}
          className={styles.sliderInput}
          aria-label={`Compare before and after images for ${title}`}
        />
      </div>

      {/* Labels */}
      <div className={styles.labels}>
        <span className={styles.labelBefore}>Before</span>
        <span className={styles.labelAfter}>After</span>
      </div>
    </div>
  );
}

export default function BeforeAfterGallery() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  return (
    <div className={styles.gallery}>
      <div className={styles.grid}>
        {galleryItems.map((item) => (
          <div
            key={item.id}
            className={styles.card}
            onClick={() => setSelectedItem(item)}
          >
            <div className={styles.cardImage}>
              <CompareSlider
                beforeImage={item.beforeImage}
                afterImage={item.afterImage}
                title={item.title}
              />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.equipment}>{item.equipment}</p>
              <div className={styles.details}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Issue:</span>
                  <span className={styles.detailValue}>{item.issue}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Solution:</span>
                  <span className={styles.detailValue}>{item.solution}</span>
                </div>
              </div>
              <div className={styles.location}>
                <span className={styles.locationIcon}>📍</span>
                {item.location}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for expanded view */}
      {selectedItem && (
        <div
          className={styles.modal}
          onClick={() => setSelectedItem(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={() => setSelectedItem(null)}
              aria-label="Close modal"
            >
              x
            </button>
            <div className={styles.modalSlider}>
              <CompareSlider
                beforeImage={selectedItem.beforeImage}
                afterImage={selectedItem.afterImage}
                title={selectedItem.title}
              />
            </div>
            <div className={styles.modalDetails}>
              <h2>{selectedItem.title}</h2>
              <p className={styles.modalEquipment}>{selectedItem.equipment}</p>
              <div className={styles.modalInfo}>
                <div className={styles.infoBlock}>
                  <h4>The Problem</h4>
                  <p>{selectedItem.issue}</p>
                </div>
                <div className={styles.infoBlock}>
                  <h4>Our Solution</h4>
                  <p>{selectedItem.solution}</p>
                </div>
              </div>
              <div className={styles.modalLocation}>
                <span className={styles.locationIcon}>📍</span>
                {selectedItem.location}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
