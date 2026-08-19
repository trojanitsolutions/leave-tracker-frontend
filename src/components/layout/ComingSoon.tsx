export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[13px] border border-dashed border-[#C9CDD2] bg-card px-6 py-[52px] text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-accent-tint text-[18px] text-accent">
        ✓
      </div>
      <div className="text-[15px] font-semibold">{title}</div>
      <div className="max-w-[360px] text-[13px] leading-relaxed text-muted">
        Layout, role access and navigation for this screen are wired up. Its data and business
        logic land in the next build pass, per the Development Requirements doc.
      </div>
    </div>
  );
}
