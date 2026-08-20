interface QueueStatCardsProps {
  awaitingYou: number;
  oldestInQueueDays: number;
  teamOutNextWeek: number;
  teamSize: number;
  notReturnedAsExpected: number;
}

export function QueueStatCards({
  awaitingYou,
  oldestInQueueDays,
  teamOutNextWeek,
  teamSize,
  notReturnedAsExpected,
}: QueueStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-4">
      <div className="flex-1 rounded-[12px] border border-line bg-card px-[16px] py-[14px]">
        <div className="font-mono text-[9.5px] tracking-[0.07em] text-muted">AWAITING YOU</div>
        <div className="mt-1 text-[26px] font-semibold tabular-nums">{awaitingYou}</div>
      </div>
      <div className="flex-1 rounded-[12px] border border-line bg-card px-[16px] py-[14px]">
        <div className="font-mono text-[9.5px] tracking-[0.07em] text-muted">OLDEST IN QUEUE</div>
        <div className="mt-1 text-[26px] font-semibold tabular-nums">
          {oldestInQueueDays} <span className="text-[13px] font-medium text-muted">days</span>
        </div>
      </div>
      <div className="flex-1 rounded-[12px] border border-line bg-card px-[16px] py-[14px]">
        <div className="font-mono text-[9.5px] tracking-[0.07em] text-muted">
          TEAM OUT NEXT WEEK
        </div>
        <div className="mt-1 text-[26px] font-semibold tabular-nums">
          {teamOutNextWeek} <span className="text-[13px] font-medium text-muted">of {teamSize}</span>
        </div>
      </div>
      <div className="flex-1 rounded-[12px] border border-[#FCD9A6] bg-[#FFFBF3] px-[16px] py-[14px]">
        <div className="font-mono text-[9.5px] tracking-[0.07em] text-[#92400E]">
          NOT RETURNED AS EXPECTED
        </div>
        <div className="mt-1 text-[26px] font-semibold tabular-nums text-[#92400E]">
          {notReturnedAsExpected}
        </div>
      </div>
    </div>
  );
}
