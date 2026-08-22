interface LeaveTypeStyle {
  /** Small pill/chip background+text, e.g. queue rows, type filters. */
  chip: string;
  /** Calendar bar background+text when the underlying record is approved. */
  barApproved: string;
  /** Calendar bar background+text when the underlying record is pending. */
  barPending: string;
  /** Solid swatch color for legends/charts. */
  swatch: string;
}

// Index 0/1 intentionally match today's exact Annual Leave / Unpaid Extension look.
const PALETTE: LeaveTypeStyle[] = [
  {
    chip: "bg-[#EEEFF1] text-[#4E5359]",
    barApproved: "bg-primary text-white",
    barPending: "bg-status-pending-bg text-status-pending-fg",
    swatch: "#17191D",
  },
  {
    chip: "bg-accent-tint text-accent",
    barApproved: "bg-[#7C5CD6] text-white",
    barPending: "bg-[#EDE9FB] text-[#7C5CD6]",
    swatch: "#7C5CD6",
  },
  {
    chip: "bg-[#EAF6F9] text-[#08768A]",
    barApproved: "bg-[#08768A] text-white",
    barPending: "bg-[#EAF6F9] text-[#08768A]",
    swatch: "#08768A",
  },
  {
    chip: "bg-[#FEF3C7] text-[#92400E]",
    barApproved: "bg-[#92400E] text-white",
    barPending: "bg-[#FEF3C7] text-[#92400E]",
    swatch: "#92400E",
  },
  {
    chip: "bg-[#FDE2E1] text-[#B42318]",
    barApproved: "bg-[#B42318] text-white",
    barPending: "bg-[#FDE2E1] text-[#B42318]",
    swatch: "#B42318",
  },
];

/** Keyed by id (not list position), so a type's color never shifts as others are added/removed/reordered. */
export function getLeaveTypeStyle(leaveTypeId: number): LeaveTypeStyle {
  const index = (leaveTypeId - 1) % PALETTE.length;
  return PALETTE[index] ?? PALETTE[0];
}
