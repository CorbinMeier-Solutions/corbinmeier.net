import { Check } from "lucide-react";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import type { PricingTier } from "@/data/types";

/** The three build packages, compared side by side. Order and copy are
 *  unchanged from the previous card layout - only the display format moved
 *  to the shared table component. */
export default function PackagesTable({ tiers }: { tiers: PricingTier[] }) {
  const columns: DataTableColumn<PricingTier>[] = [
    {
      key: "name",
      label: "Package",
      render: (tier) => (
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-serif text-lg">{tier.name}</span>
            {tier.featured && (
              <span className="px-2 py-0.5 rounded border border-accent/30 bg-accent/10 text-accent text-[0.6rem] font-bold uppercase tracking-[0.15em]">
                Most chosen
              </span>
            )}
          </div>
          <span className="text-xs text-muted uppercase tracking-widest">{tier.tagline}</span>
        </div>
      ),
    },
    {
      key: "build",
      label: "Build",
      render: (tier) => (
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-serif text-2xl text-accent">{tier.build}</span>
          <span className="text-xs text-muted">one-time</span>
        </div>
      ),
    },
    {
      key: "includes",
      label: "Includes",
      render: (tier) => (
        <ul className="flex flex-col gap-2">
          {tier.includes.map((line) => (
            <li key={line} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return <DataTable columns={columns} rows={tiers} rowKey={(tier) => tier.id} />;
}
