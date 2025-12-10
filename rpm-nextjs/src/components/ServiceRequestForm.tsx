"use client";

import { useState } from "react";
import styles from "./ServiceRequestForm.module.css";

interface FormData {
  isEmergency: boolean;
  equipmentType: string;
  issue: string;
  name: string;
  business: string;
  phone: string;
  email: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

const equipmentTypes = [
  { value: "oven", label: "Commercial Oven", icon: "🔥" },
  { value: "fryer", label: "Commercial Fryer", icon: "🍟" },
  { value: "dishwasher", label: "Dishwasher", icon: "🍽️" },
  { value: "ice-machine", label: "Ice Machine", icon: "🧊" },
  { value: "walk-in", label: "Walk-In Cooler/Freezer", icon: "❄️" },
  { value: "griddle", label: "Griddle / Flat Top", icon: "🥓" },
  { value: "steam-table", label: "Steam Table", icon: "♨️" },
  { value: "other", label: "Other Equipment", icon: "🔧" },
];

const commonIssues = [
  "Not heating / Not cooling",
  "Making strange noises",
  "Leaking water",
  "Not turning on",
  "Temperature inconsistent",
  "Error code showing",
  "Preventive maintenance",
  "Other issue",
];

export default function ServiceRequestForm() {
  const [step, setStep] = useState(1);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    isEmergency: false,
    equipmentType: "",
    issue: "",
    name: "",
    business: "",
    phone: "",
    email: "",
    address: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  });

  const handleEmergencyToggle = (isEmergency: boolean) => {
    setFormData({ ...formData, isEmergency });
    if (isEmergency) {
      setShowEmergencyModal(true);
    }
  };

  const handleEquipmentSelect = (equipmentType: string) => {
    setFormData({ ...formData, equipmentType });
    setStep(2);
  };

  const handleIssueSelect = (issue: string) => {
    setFormData({ ...formData, issue });
    setStep(3);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In production, you would send this to your backend/email service
    console.log("Form submitted:", formData);

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const canProceedToStep3 = formData.equipmentType && formData.issue;
  const canSubmit = formData.name && formData.phone && formData.email;

  if (isSubmitted) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>✓</div>
        <h3>Request Received!</h3>
        <p>
          A technician will contact you shortly to confirm your appointment.
          {formData.isEmergency && " Since this is an emergency, expect a call within 15 minutes."}
        </p>
        <div className={styles.successDetails}>
          <div className={styles.detailRow}>
            <span>Equipment:</span>
            <strong>
              {equipmentTypes.find((e) => e.value === formData.equipmentType)?.label}
            </strong>
          </div>
          <div className={styles.detailRow}>
            <span>Issue:</span>
            <strong>{formData.issue}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Contact:</span>
            <strong>{formData.phone}</strong>
          </div>
        </div>
        <p className={styles.urgentNote}>
          Need immediate assistance?
          <br />
          <a href="tel:+19012579417" className={styles.callLink}>
            Call (901) 257-9417
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.form}>
      {/* Progress Bar */}
      <div className={styles.progress}>
        <div className={styles.progressSteps}>
          <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ""}`}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepLabel}>Equipment</span>
          </div>
          <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ""}`}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>Issue</span>
          </div>
          <div className={`${styles.progressStep} ${step >= 3 ? styles.active : ""}`}>
            <span className={styles.stepNumber}>3</span>
            <span className={styles.stepLabel}>Contact</span>
          </div>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>
      </div>

      {/* Emergency Toggle */}
      <div className={styles.emergencyToggle}>
        <label className={styles.toggleLabel}>
          <span className={styles.toggleText}>
            <span className={styles.emergencyIcon}>🚨</span>
            Is this an emergency?
          </span>
          <button
            type="button"
            className={`${styles.toggle} ${formData.isEmergency ? styles.toggleActive : ""}`}
            onClick={() => handleEmergencyToggle(!formData.isEmergency)}
            aria-pressed={formData.isEmergency}
          >
            <span className={styles.toggleSwitch} />
          </button>
        </label>
        {formData.isEmergency && (
          <p className={styles.emergencyNote}>
            We prioritize emergencies 24/7. A technician will respond ASAP.
          </p>
        )}
      </div>

      {/* Step 1: Equipment Selection */}
      {step === 1 && (
        <div className={styles.stepContent}>
          <h3 className={styles.stepTitle}>What equipment needs service?</h3>
          <div className={styles.equipmentGrid}>
            {equipmentTypes.map((equipment) => (
              <button
                key={equipment.value}
                type="button"
                className={`${styles.equipmentCard} ${
                  formData.equipmentType === equipment.value ? styles.selected : ""
                }`}
                onClick={() => handleEquipmentSelect(equipment.value)}
              >
                <span className={styles.equipmentIcon}>{equipment.icon}</span>
                <span className={styles.equipmentLabel}>{equipment.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Issue Selection */}
      {step === 2 && (
        <div className={styles.stepContent}>
          <h3 className={styles.stepTitle}>What&apos;s the problem?</h3>
          <div className={styles.issueList}>
            {commonIssues.map((issue) => (
              <button
                key={issue}
                type="button"
                className={`${styles.issueButton} ${
                  formData.issue === issue ? styles.selected : ""
                }`}
                onClick={() => handleIssueSelect(issue)}
              >
                {issue}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => setStep(1)}
          >
            ← Back to Equipment
          </button>
        </div>
      )}

      {/* Step 3: Contact Information */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className={styles.stepContent}>
          <h3 className={styles.stepTitle}>How can we reach you?</h3>

          <div className={styles.selectedSummary}>
            <span>
              {equipmentTypes.find((e) => e.value === formData.equipmentType)?.icon}{" "}
              {equipmentTypes.find((e) => e.value === formData.equipmentType)?.label}
            </span>
            <span>•</span>
            <span>{formData.issue}</span>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Your Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="John Smith"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="business">Business Name</label>
              <input
                type="text"
                id="business"
                name="business"
                value={formData.business}
                onChange={handleInputChange}
                placeholder="Restaurant Name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="(901) 555-0123"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="john@restaurant.com"
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="address">Service Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St, Memphis, TN"
              />
            </div>

            {!formData.isEmergency && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="preferredDate">Preferred Date</label>
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="preferredTime">Preferred Time</label>
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                  >
                    <option value="">Select time...</option>
                    <option value="morning">Morning (7AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 5PM)</option>
                    <option value="evening">Evening (5PM - 8PM)</option>
                  </select>
                </div>
              </>
            )}

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional details about the issue..."
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => setStep(2)}
            >
              ← Back
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className={styles.spinner} />
                  Sending...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEmergencyModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>📞</div>
            <h3>For Emergencies, Calling is Faster!</h3>
            <p>
              Our emergency line is answered 24/7. A technician can be dispatched
              immediately.
            </p>
            <a href="tel:+19012579417" className={styles.modalCallButton}>
              Call Now: (901) 257-9417
            </a>
            <button
              type="button"
              className={styles.modalContinueButton}
              onClick={() => setShowEmergencyModal(false)}
            >
              Continue with form instead
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
