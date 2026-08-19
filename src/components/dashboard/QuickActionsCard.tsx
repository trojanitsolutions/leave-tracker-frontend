import Link from "next/link";
import { Card } from "@/components/ui/Card";

const ACTIONS = [
  { label: "Apply for annual leave", href: "/apply", variant: "primary" as const },
  { label: "Request unpaid extension", href: "/extend", variant: "secondary" as const },
  { label: "View my leave history", href: "/history", variant: "secondary" as const },
];

export function QuickActionsCard() {
  return (
    <Card className="p-[18px]">
      <div className="mb-[12px] text-[12px] font-semibold tracking-[0.05em] text-muted uppercase">
        Quick actions
      </div>
      <div className="flex flex-col gap-[9px]">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex items-center justify-between rounded-[10px] px-[14px] py-[11px] text-[13px] font-semibold transition-colors ${
              action.variant === "primary"
                ? "bg-primary text-white hover:bg-black"
                : "border border-line font-medium hover:border-line-hover hover:bg-surface"
            }`}
          >
            {action.label}
            <span className={action.variant === "primary" ? "opacity-60" : "text-muted-2"}>→</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
