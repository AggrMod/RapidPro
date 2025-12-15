import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className = "", hoverEffect = true, ...props }: GlassCardProps) {
    return (
        <div className={`glass-card ${hoverEffect ? "" : "no-hover"} ${className}`} {...props}>
            {children}
        </div>
    );
}
