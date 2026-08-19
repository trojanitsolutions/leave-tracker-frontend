import { Card } from "@/components/ui/Card";
import { ADMIN_DEPT_LOAD } from "@/data/mock";
import { DepartmentLoad } from "@/types/domain";

interface DeptLoadCardProps {
  departments?: DepartmentLoad[];
}

export function DeptLoadCard({ departments = ADMIN_DEPT_LOAD }: DeptLoadCardProps = {}) {
  return (
    <Card className="p-[18px]">
      <div className="mb-[14px] text-[13.5px] font-semibold">Leave load by department</div>
      <div className="flex flex-col gap-[11px]">
        {departments.map((dept) => {
          const pct = Math.round((dept.onLeave / dept.headcount) * 100);
          return (
            <div key={dept.id}>
              <div className="mb-[5px] flex justify-between text-[12px]">
                <span>{dept.name}</span>
                <span className="text-muted tabular-nums">
                  {dept.onLeave} / {dept.headcount}
                </span>
              </div>
              <div className="h-[6px] overflow-hidden rounded-[3px] bg-[#EFF0F2]">
                <div className="h-full rounded-[3px] bg-accent" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
