"use client";

import React, { useEffect, useState } from "react";

export function StickyCallBar() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling past hero (approx 500px)
            setIsVisible(window.scrollY > 500);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden transition-transform duration-300 ${isVisible ? "translate-y-0" : "translate-y-full"
                }`}
        >
            <a
                href="tel:9012579417"
                className="flex items-center justify-center w-full bg-primary text-black font-bold text-lg py-4 rounded-xl shadow-2xl border border-white/20"
            >
                📞 Call Tech Now
            </a>
        </div>
    );
}
