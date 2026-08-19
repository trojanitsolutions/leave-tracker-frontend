import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[14px] border border-line bg-card shadow-card ${className}`}
      {...props}
    />
  );
}
