import React from "react";

export function Hero() {
    return (
        <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
            {/* Video Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.4))' }} />
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                >
                    {/* Placeholder video */}
                    <source src="/hero-video.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Content */}
            <div className="container relative z-20 text-center flex flex-col items-center gap-6 animate-fade-in">
                <div className="glass" style={{ padding: '0.5rem 1.5rem', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--success-h), var(--success-s), var(--success-l))' }} className="animate-pulse"></span>
                    <span className="uppercase text-white font-medium" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>24/7 Emergency Service Available</span>
                </div>

                <h1 className="text-white" style={{ textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                    Memphis Commercial <br />
                    <span className="text-primary">Kitchen Repair</span>
                </h1>

                <p className="text-white" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2rem auto', opacity: 0.9 }}>
                    The most trusted equipment specialists in the Mid-South. We fix what others can't.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center w-full">
                    <a href="tel:9012579417" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                        Call Tech Now: (901) 257-9417
                    </a>
                    <a href="#contact" className="btn btn-glass" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                        Get a Quote
                    </a>
                </div>
            </div>
        </section>
    );
}
