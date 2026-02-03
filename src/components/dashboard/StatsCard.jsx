import { cn } from "@/lib/utils";

export default function StatsCard({ title, value, icon: Icon, trend, trendUp, className }) {
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-semibold text-slate-900 tracking-tight">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm mt-2 font-medium",
              trendUp ? "text-emerald-600" : "text-red-500"
            )}>
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-slate-50 rounded-xl">
            <Icon className="w-6 h-6 text-slate-600" />
          </div>
        )}
      </div>
    </div>
  );
}