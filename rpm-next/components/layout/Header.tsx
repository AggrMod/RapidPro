"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => setIsMobileMenuOpen(false), [pathname]);

    return (
        <>
            <header
                className={`fixed inset-0 z-50`}
                style={{
                    height: 'auto',
                    bottom: 'auto',
                    padding: isScrolled ? '1rem 0' : '1.5rem 0',
                    background: isScrolled ? 'rgba(10, 15, 29, 0.85)' : 'transparent',
                    backdropFilter: isScrolled ? 'blur(10px)' : 'none',
                    borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    transition: 'all 0.3s'
                }}
            >
                <div className="container flex justify-between items-center">
                    <Link href="/" className="text-white font-bold" style={{ fontSize: '1.5rem', letterSpacing: '-1px' }}>
                        RAPID<span className="text-primary">PRO</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="nav-link">Home</Link>

                        {/* Services Dropdown */}
                        <div className="relative group" style={{ position: 'relative' }}>
                            <button className="nav-link flex items-center gap-2">Services ▾</button>
                            <div className="absolute glass"
                                style={{
                                    top: '100%', left: '-1rem', width: '250px', padding: '0.5rem',
                                    borderRadius: '0.5rem', marginTop: '1rem',
                                    opacity: 0, visibility: 'hidden', transform: 'translateY(10px)',
                                    transition: 'all 0.2s', position: 'absolute'
                                }}>
                                <style jsx>{`
                  .group:hover .absolute { opacity: 1 !important; visibility: visible !important; transform: translateY(0) !important; }
                `}</style>
                                <Link href="/services/commercial-oven-repair" className="block nav-link" style={{ padding: '0.5rem', display: 'block' }}>Oven Repair</Link>
                                <Link href="/services/commercial-fryer-repair" className="block nav-link" style={{ padding: '0.5rem', display: 'block' }}>Fryer Repair</Link>
                                <Link href="/services/commercial-refrigeration-repair" className="block nav-link" style={{ padding: '0.5rem', display: 'block' }}>Refrigeration</Link>
                                <Link href="/services/ice-machine-repair" className="block nav-link" style={{ padding: '0.5rem', display: 'block' }}>Ice Machines</Link>
                            </div>
                        </div>

                        <Link href="#contact" className="nav-link">Contact</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <a href="tel:9012579417" className="hidden md:flex btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                            Call (901) 257-9417
                        </a>
                        <button className="md:hidden text-white" style={{ background: 'none', border: 'none', fontSize: '1.5rem' }} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? "✕" : "☰"}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6" style={{ background: 'hsla(224, 48%, 8%, 0.98)', backdropFilter: 'blur(20px)' }}>
                    <Link href="/" className="text-white font-bold" style={{ fontSize: '2rem' }}>Home</Link>
                    <Link href="/services/commercial-oven-repair" className="text-white font-bold" style={{ fontSize: '1.5rem' }}>Ovens</Link>
                    <Link href="/services/commercial-fryer-repair" className="text-white font-bold" style={{ fontSize: '1.5rem' }}>Fryers</Link>
                    <a href="tel:9012579417" className="btn btn-primary" style={{ fontSize: '1.2rem', marginTop: '2rem' }}>Call Now</a>
                </div>
            )}
        </>
    );
}
