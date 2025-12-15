"use client";

import React, { useState } from "react";
import { GlassCard } from "../ui/GlassCard";

export function ContactForm() {
    const [formState, setFormState] = useState<"idle" | "submitting" | "success">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormState("submitting");
        await new Promise(resolve => setTimeout(resolve, 1500));
        setFormState("success");
    };

    if (formState === "success") {
        return (
            <GlassCard className="text-center" style={{ padding: '4rem 2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h3 className="text-white" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Request Received!</h3>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>A dispatch coordinator will contact you shortly.</p>
                <button onClick={() => setFormState("idle")} style={{ color: 'hsl(var(--primary-h), var(--primary-s), var(--primary-l))', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
                    Send another request
                </button>
            </GlassCard>
        );
    }

    return (
        <section id="contact" style={{ paddingTop: '1rem', paddingBottom: '4rem', background: 'rgba(0,0,0,0.2)' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <div className="text-center" style={{ marginBottom: '3rem' }}>
                    <h2 className="text-white">Request Service</h2>
                    <p className="text-muted" style={{ fontSize: '1.2rem' }}>Get a quote or schedule a repair today.</p>
                </div>

                <GlassCard>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label>Business Name</label>
                                <input type="text" required placeholder="e.g. Memphis BBQ Co." />
                            </div>
                            <div>
                                <label>Contact Person</label>
                                <input type="text" required placeholder="Your Name" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label>Phone Number</label>
                                <input type="tel" required placeholder="(901) 555-0123" />
                            </div>
                            <div>
                                <label>Equipment Type</label>
                                <select>
                                    <option>Commercial Oven</option>
                                    <option>Deep Fryer</option>
                                    <option>Walk-In Cooler/Freezer</option>
                                    <option>Ice Machine</option>
                                    <option>Dishwasher</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label>Issue Description</label>
                            <textarea rows={4} placeholder="Describe the problem..."></textarea>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-4" style={{ marginTop: '1rem' }}>
                            <button type="submit" disabled={formState === "submitting"} className="btn btn-primary w-full md:w-auto">
                                {formState === "submitting" ? "Sending..." : "Submit Request"}
                            </button>
                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>*Or call (901) 257-9417 for immediate help</span>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </section>
    );
}
