import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "accent-outline";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "border-0 bg-primary text-white shadow-[0_1px_2px_rgba(14,15,17,0.18)] hover:bg-black active:translate-y-px",
  secondary: "border border-line bg-card text-ink hover:bg-surface hover:border-line-hover",
  "accent-outline": "border border-accent bg-card text-accent hover:bg-accent-tint",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`cursor-pointer rounded-[9px] px-4 py-2.5 text-[13px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
