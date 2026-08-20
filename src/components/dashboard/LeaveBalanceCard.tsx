import { Card } from "@/components/ui/Card";

const LEGEND = [
  { label: "Entitlement", swatchClass: "bg-[#C9CDD2]", key: "entitlement" as const },
  { label: "Used", swatchClass: "bg-ink", key: "used" as const },
  { label: "Pending", swatchClass: "", key: "pending" as const },
  { label: "Remaining", swatchClass: "border border-line-hover bg-line", key: "remaining" as const },
];

interface LeaveBalanceCardProps {
  isEligible: boolean;
  cycleLabel: string;
  entitlement: number;
  used: number;
  pending: number;
  remaining: number;
  /** Only known once a leave/extension is actually in progress — its real back-to-work date. Null otherwise. */
  nextCycleStartsOn: string | null;
  /** The 13th-month eligibility date, shown instead of a cycle range before it arrives. */
  eligibleFromLabel: string;
}

export function LeaveBalanceCard({
  isEligible,
  cycleLabel,
  entitlement,
  used,
  pending,
  remaining,
  nextCycleStartsOn,
  eligibleFromLabel,
}: LeaveBalanceCardProps) {
  const balanceValues: Record<"entitlement" | "used" | "pending" | "remaining", number> = {
    entitlement,
    used,
    pending,
    remaining,
  };
  const usedPct = entitlement === 0 ? 0 : (used / entitlement) * 100;
  const pendingPct = entitlement === 0 ? 0 : (pending / entitlement) * 100;
  const remainingPct = entitlement === 0 ? 0 : (remaining / entitlement) * 100;

  return (
    <Card className="shadow-float flex flex-col p-[20px] pb-[16px]">
      <div className="flex items-baseline justify-between">
        <div className="text-[12px] font-semibold tracking-[0.05em] text-muted uppercase">
          Leave balance
        </div>
        <div className="font-mono text-[10.5px] text-muted">
          {isEligible ? cycleLabel : `ELIGIBLE FROM ${eligibleFromLabel}`}
        </div>
      </div>

      <div className="mt-[12px] mb-[16px] flex flex-wrap items-end gap-[10px]">
        {isEligible ? (
          <>
            <div className="text-[54px] leading-[0.85] font-semibold tracking-[-0.04em] tabular-nums">
              {remaining}
            </div>
            <div className="pb-[5px]">
              <div className="text-[14px] font-semibold">days remaining</div>
              <div className="text-[12px] text-muted text-pretty">
                of {entitlement} days annual entitlement
              </div>
            </div>
            <div className="ml-auto pb-[5px] text-right">
              <div className="font-mono text-[10px] tracking-[0.06em] text-muted whitespace-nowrap">
                NEXT CYCLE STARTS
              </div>
              <div className="mt-[2px] text-[13px] font-semibold">
                {nextCycleStartsOn ?? <span className="text-muted">Not due yet</span>}
              </div>
            </div>
          </>
        ) : (
          <div>
            <div className="text-[22px] font-semibold tracking-[-0.02em]">Not eligible yet</div>
            <div className="mt-1 text-[12.5px] text-muted text-pretty">
              Annual leave becomes available from {eligibleFromLabel} — 13th month from joining.
            </div>
          </div>
        )}
      </div>

      <div className="flex h-[16px] overflow-hidden rounded-[8px] bg-line">
        <div className="bg-primary" style={{ width: `${usedPct}%` }} />
        <div
          className="border-x-2 border-white"
          style={{
            width: `${pendingPct}%`,
            background: "repeating-linear-gradient(135deg, #0B96AF 0 3px, #EAF6F9 3px 7px)",
          }}
        />
        <div className="bg-line" style={{ width: `${remainingPct}%` }} />
      </div>

      <div className="my-[16px] grid grid-cols-2 gap-[12px] sm:grid-cols-4">
        {LEGEND.map((item) => (
          <div key={item.key}>
            <div className="flex items-center gap-[6px]">
              <span
                className={`inline-block h-[9px] w-[9px] rounded-[3px] ${item.swatchClass}`}
                style={
                  item.key === "pending"
                    ? { background: "repeating-linear-gradient(135deg, #0B96AF 0 2px, #EAF6F9 2px 5px)" }
                    : undefined
                }
              />
              <span className="text-[11.5px] text-muted">{item.label}</span>
            </div>
            <div
              className={`mt-[3px] text-[21px] font-semibold tabular-nums ${
                item.key === "pending" ? "text-accent" : ""
              }`}
            >
              {balanceValues[item.key]}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto rounded-[9px] bg-surface p-[10px_12px] text-[12px] leading-relaxed text-[#4E5359]">
        {isEligible ? (
          <>
            The {pending} pending days are <b className="text-ink">held, not yet deducted</b>. If
            your manager rejects the request they return to your balance automatically.
          </>
        ) : (
          "Your entitlement starts counting once you're eligible — there's nothing to hold or deduct yet."
        )}
      </div>
    </Card>
  );
}
