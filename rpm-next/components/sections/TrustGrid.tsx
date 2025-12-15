"use client";

import React, { useState } from "react";
import { GlassCard } from "../ui/GlassCard";

const badges = [
    { icon: "⚡", title: "24/7 Emergency", desc: "Always on call" },
    { icon: "🛡️", title: "EPA Certified", desc: "Licensed Pros" },
    { icon: "📍", title: "Locally Owned", desc: "Memphis Based" },
    { icon: "✨", title: "Same Day", desc: "Quick Response" }
];

export function TrustGrid() {
    return (
        <section className="relative z-20 container" style={{ marginTop: '-4rem', marginBottom: '2rem' }}>
            <div className="grid-auto-fit">
                {badges.map((badge, idx) => (
                    <GlassCard key={idx} className="flex-col items-center text-center gap-2 flex">
                        <span style={{ fontSize: '2.5rem' }}>{badge.icon}</span>
                        <h3 className="text-white font-bold" style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>{badge.title}</h3>
                        <p className="text-muted">{badge.desc}</p>
                    </GlassCard>
                ))}
            </div>
        </section>
    );
}
