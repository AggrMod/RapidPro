import { locationsData } from "@/lib/locations-data";
import { GlassCard } from "@/components/ui/GlassCard";
import React from "react";
import Link from "next/link";
import { Metadata } from "next";

// 1. Generate Static Params for SSG
export async function generateStaticParams() {
    return locationsData.map((loc) => ({
        slug: loc.slug,
    }));
}

// 2. Generate Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const location = locationsData.find((l) => l.slug === slug);
    if (!location) return {};

    return {
        title: location.seoTitle,
        description: location.seoDesc,
    };
}

// 3. Page Component
export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const location = locationsData.find((l) => l.slug === slug);

    if (!location) {
        return <div className="p-20 text-center text-white">Location not found</div>;
    }

    return (
        <main className="min-h-screen pb-20">
            {/* Header Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                {/* Map Background Pattern or Image Placeholder */}
                <div className="absolute inset-0 bg-slate-900 z-0 opacity-80"></div>
                <div className="container relative z-10 text-center">
                    <div className="inline-block px-4 py-1 rounded-full bg-primary mb-4">
                        <span className="text-black font-bold">Serving {location.name}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Commercial Kitchen Repair in {location.name}</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">{location.description}</p>
                </div>
            </section>

            {/* Local Details Grid */}
            <section className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <GlassCard>
                        <h3 className="text-2xl font-bold mb-4 text-primary">Service Coverage</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <span>⏱️</span>
                                <span className="text-gray-300">Typical Response Time: <strong className="text-white">{location.travelTime}</strong></span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>📍</span>
                                <span className="text-gray-300">Dispatching from Memphis HQ</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>✅</span>
                                <span className="text-gray-300">No Extra Travel Fees for Scheduled Service</span>
                            </li>
                        </ul>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-2xl font-bold mb-4 text-primary">Local Landmarks Served</h3>
                        <p className="mb-4 text-gray-400">We frequent kitchens near:</p>
                        <div className="flex flex-wrap gap-2">
                            {location.landmarks.map((mark, i) => (
                                <span key={i} className="px-3 py-1 rounded bg-white/10 text-white text-sm">
                                    {mark}
                                </span>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* Call to Action */}
            <section className="container py-12 text-center">
                <div className="glass p-10 rounded-2xl max-w-2xl mx-auto border-t-4 border-primary">
                    <h2 className="text-3xl font-bold mb-4 text-white">Restaurant in {location.name}?</h2>
                    <p className="mb-8 text-gray-300">Get a local technician on site today.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="tel:9012579417" className="btn btn-primary text-xl">
                            Call (901) 257-9417
                        </a>
                    </div>
                </div>
            </section>

            <div className="text-center mt-12">
                <Link href="/" className="text-muted hover:text-white transition-colors">
                    ← Back to Homepage
                </Link>
            </div>
        </main>
    );
}
