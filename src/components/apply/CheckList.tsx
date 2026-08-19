interface GenericCheckItem {
  key: string;
  ok: boolean;
  title: string;
  body: string;
}

export function CheckList({ checks }: { checks: GenericCheckItem[] }) {
  return (
    <div className="flex flex-col gap-[9px]">
      {checks.map((check) => (
        <div
          key={check.key}
          className={`flex items-start gap-[10px] rounded-[10px] border px-[13px] py-[10px] ${
            check.ok
              ? "border-status-approved-fg/25 bg-status-approved-bg/40"
              : "border-status-rejected-fg/25 bg-status-rejected-bg/40"
          }`}
        >
          <div
            className={`mt-[1px] flex h-[17px] w-[17px] flex-none items-center justify-center rounded-full text-[11px] font-bold text-white ${
              check.ok ? "bg-status-approved-fg" : "bg-status-rejected-fg"
            }`}
          >
            {check.ok ? "✓" : "✕"}
          </div>
          <div className="flex-1">
            <div
              className={`text-[12.5px] font-semibold ${
                check.ok ? "text-status-approved-fg" : "text-status-rejected-fg"
              }`}
            >
              {check.title}
            </div>
            <div className="mt-[1px] text-[12px] leading-[1.45] text-[#4E5359]">{check.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
