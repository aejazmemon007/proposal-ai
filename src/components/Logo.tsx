import React from "react";
import { Link } from "react-router-dom";

export function LogoSymbol({
  className = "w-4 h-4",
  alt = "ProposalAI Symbol"
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src="/logo-symbol.png"
      alt={alt}
      className={`object-contain select-none pointer-events-none drop-shadow-xs ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}

export function LogoIcon({
  size = "md",
  className = "",
  symbolClassName = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  symbolClassName?: string;
}) {
  const sizeClasses = {
    sm: "w-7 h-7 rounded-lg",
    md: "w-8 h-8 rounded-lg",
    lg: "w-10 h-10 rounded-xl",
    xl: "w-12 h-12 rounded-2xl",
  };

  const symbolSizes = {
    sm: "w-4 h-4",
    md: "w-4.5 h-4.5",
    lg: "w-5.5 h-5.5",
    xl: "w-7 h-7",
  };

  return (
    <div
      className={`bg-primary flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${sizeClasses[size]} ${className}`}
    >
      <LogoSymbol className={`${symbolSizes[size]} ${symbolClassName}`} />
    </div>
  );
}

export default function Logo({
  to = "/dashboard",
  showText = true,
  className = "",
  size = "md",
  textClassName = "",
}: {
  to?: string;
  showText?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  textClassName?: string;
}) {
  const content = (
    <div className={`flex items-center gap-2.5 group cursor-pointer ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <span className={`font-semibold text-foreground tracking-tight text-[15px] ${textClassName}`}>
          ProposalAI
        </span>
      )}
    </div>
  );

  if (!to) return content;
  return <Link to={to} className="inline-flex items-center">{content}</Link>;
}
