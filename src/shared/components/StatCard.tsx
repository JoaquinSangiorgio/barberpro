import { ReactNode } from "react";

export default function StatCard({
  title, value, hint, icon
}: { title:string; value:string | ReactNode; hint?:string; icon?:React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-textc-muted">{title}</div>
        {icon && <div className="text-textc-muted">{icon}</div>}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="text-xs text-textc-soft mt-1">{hint}</div>}
    </div>
  );
}

