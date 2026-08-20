import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface OnLeaveBannerProps {
  label: string;
  dayNumber: number;
  totalDays: number;
  expectedBackToWork: string;
  progressPercent: number;
  showExtensionCta: boolean;
}

export function OnLeaveBanner({
  label,
  dayNumber,
  totalDays,
  expectedBackToWork,
  progressPercent,
  showExtensionCta,
}: OnLeaveBannerProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-4 rounded-[12px] border border-[#CFE7EE] px-[18px] py-[14px]"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #EAF6F9 100%)" }}
    >
      <div className="inline-flex items-center gap-[7px] rounded-full bg-accent px-[11px] py-[5px] text-[11.5px] font-semibold whitespace-nowrap text-white">
        <span className="inline-block h-[6px] w-[6px] rounded-full bg-white" />
        {label}
      </div>
      <div className="min-w-[260px] flex-1 text-[13.5px]">
        Day <b>{dayNumber}</b> of {totalDays} · expected back at work{" "}
        <b>{expectedBackToWork}</b>
      </div>
      <div className="ml-auto flex min-w-0 flex-wrap items-center gap-3">
        <div className="h-[6px] min-w-[120px] flex-1 overflow-hidden rounded-full bg-[rgba(14,15,17,0.1)]">
          <div className="h-full rounded-full bg-accent" style={{ width: `${progressPercent}%` }} />
        </div>
        {showExtensionCta ? (
          <Link href="/extend">
            <Button variant="accent-outline" className="whitespace-nowrap">
              Request extension
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
