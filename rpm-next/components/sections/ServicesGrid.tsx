import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { servicesData } from '@/lib/services-data';

export default function ServicesGrid() {
    return (
        <section className="relative z-10 py-16" id="services">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-[var(--accent)]">
                        Premium Kitchen Solutions
                    </h2>
                    <p className="text-lg text-[var(--foreground-muted)]">
                        Specialized maintenance and repair for high-volume commercial kitchens.
                        We keep your equipment running so you can keep serving.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicesData.map((service, index) => (
                        <Link key={service.slug} href={`/services/${service.slug}`} className="block group">
                            <GlassCard className="h-full p-8 transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[var(--accent)]/50 relative overflow-hidden">

                                {/* Hover Gradient Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/0 to-[var(--accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {service.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--accent)] transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed mb-6">
                                    {service.description}
                                </p>

                                {/* Features List (Preview) */}
                                <ul className="space-y-2">
                                    {service.features.slice(0, 3).map((feature, i) => (
                                        <li key={i} className="flex items-center text-xs text-[var(--foreground-muted)]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mr-2" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {/* Learn More Link */}
                                <div className="mt-6 flex items-center text-[var(--accent)] text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    View Service Details
                                    <span className="ml-2">→</span>
                                </div>
                            </GlassCard>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
