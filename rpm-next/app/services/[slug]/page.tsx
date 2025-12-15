import { servicesData } from "@/lib/services-data";
import { Hero } from "@/components/sections/Hero"; // Reusing Hero for now, or create a specific PageHeader
import { GlassCard } from "@/components/ui/GlassCard";
import React from "react";
import Link from "next/link";
import { Metadata } from "next";

// 1. Generate Static Params for SSG
export async function generateStaticParams() {
    return servicesData.map((service) => ({
        slug: service.slug,
    }));
}

// 2. Generate Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const service = servicesData.find((s) => s.slug === slug);
    if (!service) return {};

    return {
        title: service.seoTitle,
        description: service.seoDesc,
    };
}

// 3. Page Component
export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const service = servicesData.find((s) => s.slug === slug);

    if (!service) {
        return <div className="p-20 text-center text-white">Service not found</div>;
    }

    return (
        <main className="min-h-screen pb-20">
            {/* Header Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/20 z-0"></div>
                <div className="container relative z-10 text-center">
                    <span className="text-6xl mb-4 block animate-bounce">{service.icon}</span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">{service.title}</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">{service.description}</p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="container py-12">
                <h2 className="text-2xl font-bold mb-8 text-center text-primary">Common Repairs We Perform</h2>
                <div className="grid-auto-fit">
                    {service.features.map((feature, i) => (
                        <GlassCard key={i} className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <span className="text-lg text-white">{feature}</span>
                        </GlassCard>
                    ))}
                </div>
            </section>

            {/* FAQ Section (Schema to be added later) */}
            {service.faq.length > 0 && (
                <section className="container py-12 max-w-3xl">
                    <h2 className="text-2xl font-bold mb-8 text-center text-white">Frequently Asked Questions</h2>
                    <div className="flex flex-col gap-4">
                        {service.faq.map((item, i) => (
                            <GlassCard key={i} className="flex flex-col gap-2">
                                <h3 className="font-bold text-lg text-primary">{item.question}</h3>
                                <p className="text-gray-300">{item.answer}</p>
                            </GlassCard>
                        ))}
                    </div>
                </section>
            )}

            {/* Call to Action */}
            <section className="container py-12 text-center">
                <div className="glass p-10 rounded-2xl max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-4 text-white">Need {service.title}?</h2>
                    <p className="mb-8 text-gray-300">Our technicians are ready to dispatch.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="tel:9012579417" className="btn btn-primary text-xl">
                            Call Now: (901) 257-9417
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
