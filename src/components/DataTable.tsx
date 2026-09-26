import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  className?: string;
}

/** Shared table for tabular content (docs/style_guide.md "Data Table").
 *  Hairline-bordered rows with a Panel Navy header above 640px; below that,
 *  each row collapses into its own stacked label/value card instead of
 *  scrolling horizontally. */
export default function DataTable<T>({ columns, rows, rowKey, className }: DataTableProps<T>) {
  return (
    <div className={cn("w-full", className)}>
      <div className="hidden sm:block rounded-xl border border-border overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-card">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-muted border-b border-border",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-border last:border-b-0">
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3 align-top text-foreground", col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden flex flex-col gap-4">
        {rows.map((row) => (
          <div key={rowKey(row)} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
            {columns.map((col) => (
              <div key={col.key} className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  {col.label}
                </span>
                <div className="text-foreground text-sm">{col.render(row)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
