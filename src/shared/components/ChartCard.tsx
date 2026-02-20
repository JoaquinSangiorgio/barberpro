import { ReactNode } from "react";

export default function ChartCard({
  title, right, children
}: { title:string; right?:ReactNode; children:ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}
