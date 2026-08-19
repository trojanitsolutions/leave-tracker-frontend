import { Card } from "@/components/ui/Card";
import { BalanceProjection } from "@/types/domain";

export function BalanceAfterCard({ projection }: { projection: BalanceProjection | null }) {
  const entitlement = projection?.entitlement ?? 0;
  const used = projection?.used ?? 0;
  const pending = projection?.pending ?? 0;
  const thisRequest = projection?.thisRequest ?? 0;
  const remainingAfter = projection?.remainingAfter ?? null;

  const usedPct = entitlement ? (used / entitlement) * 100 : 0;
  const pendingPct = entitlement ? (pending / entitlement) * 100 : 0;
  const thisPct = entitlement ? (thisRequest / entitlement) * 100 : 0;

  return (
    <Card className="p-[18px]">
      <div className="mb-[14px] text-[12px] font-semibold tracking-[0.05em] text-muted uppercase">
        Balance after this request
      </div>
      <div className="flex items-end gap-[9px]">
        <div
          className={`text-[38px] leading-[0.85] font-semibold tracking-[-0.035em] tabular-nums ${
            remainingAfter !== null && remainingAfter < 0 ? "text-status-rejected-fg" : ""
          }`}
        >
          {remainingAfter ?? "–"}
        </div>
        <div className="pb-[3px] text-[12.5px] text-muted">days left if approved</div>
      </div>
      <div className="mt-[14px] flex h-[12px] overflow-hidden rounded-[6px] bg-line">
        <div className="bg-primary" style={{ width: `${usedPct}%` }} />
        <div
          className="border-l-2 border-white"
          style={{
            width: `${pendingPct}%`,
            background: "repeating-linear-gradient(135deg, #0B96AF 0 3px, #EAF6F9 3px 7px)",
          }}
        />
        <div
          className="border-l-2 border-white"
          style={{
            width: `${thisPct}%`,
            background: "repeating-linear-gradient(135deg, #9AA0A6 0 3px, #F4F5F6 3px 7px)",
          }}
        />
      </div>
      <div className="mt-[14px] flex flex-col gap-[7px] text-[12.5px]">
        <div className="flex justify-between">
          <span className="text-muted">Entitlement</span>
          <b className="tabular-nums">{entitlement}</b>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Already used</span>
          <b className="tabular-nums">−{used}</b>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Pending (held)</span>
          <b className="tabular-nums text-accent">−{pending}</b>
        </div>
        <div className="flex justify-between border-t border-line pt-2">
          <span className="text-muted">This request</span>
          <b className="tabular-nums">−{thisRequest}</b>
        </div>
      </div>
    </Card>
  );
}
