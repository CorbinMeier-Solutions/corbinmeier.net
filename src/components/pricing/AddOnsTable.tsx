import DataTable, { type DataTableColumn } from "@/components/DataTable";
import type { PricingCategory, PricingLevelInfo, PricingLineItem } from "@/data/types";

/** Every add-on keyed by id (plus the standalone database tier), so a row
 *  can resolve its own prerequisites' real prices instead of the data file
 *  restating those numbers and drifting out of sync the next time one of
 *  them changes. */
function buildItemIndex(categories: PricingCategory[], databaseTier: PricingLineItem) {
  const index = new Map<string, PricingLineItem>([[databaseTier.id, databaseTier]]);
  for (const category of categories) {
    for (const entry of category.items) {
      index.set(entry.id, entry);
    }
  }
  return index;
}

/** Both halves of a price as one string. A prerequisite whose real cost is
 *  the monthly rather than the build fee still has to show that monthly, or
 *  the running total a reader adds up is wrong. */
function fullCost({ upfront, recurring }: Pick<PricingLineItem, "upfront" | "recurring">) {
  return recurring ? `${upfront} + ${recurring}` : upfront;
}

function levelLabel(level: number | undefined, legend: PricingLevelInfo[]) {
  if (!level) return null;
  return legend.find((entry) => entry.level === level)?.name ?? null;
}

/** Level legend, rendered once above every category's table. */
function LevelLegend({ legend }: { legend: PricingLevelInfo[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      {legend.map((entry) => (
        <div key={entry.level} className="rounded-xl border border-border bg-card p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-1">
            Level {entry.level} &middot; {entry.name}
          </p>
          <p className="text-sm text-muted leading-relaxed">{entry.description}</p>
        </div>
      ))}
    </div>
  );
}

function AddOnCategory({
  category,
  itemsById,
  databaseId,
  legend,
}: {
  category: PricingCategory;
  itemsById: Map<string, PricingLineItem>;
  databaseId: string;
  legend: PricingLevelInfo[];
}) {
  const columns: DataTableColumn<PricingLineItem>[] = [
    {
      key: "name",
      label: "Add-on",
      render: (entry) => (
        <div className="flex flex-col gap-1">
          <span className="font-serif text-base">{entry.name}</span>
          {entry.responsibility && (
            <span className="text-xs text-muted leading-relaxed">{entry.responsibility}</span>
          )}
        </div>
      ),
    },
    {
      key: "level",
      label: "Level",
      render: (entry) => {
        const label = levelLabel(entry.level, legend);
        return label ? `L${entry.level} · ${label}` : "-";
      },
    },
    {
      key: "upfront",
      label: "Up front",
      render: (entry) => entry.upfront,
    },
    {
      key: "recurring",
      label: "Monthly",
      render: (entry) => entry.recurring ?? "-",
    },
    {
      key: "needs",
      label: "Needs",
      render: (entry) => {
        if (entry.prerequisites.length === 0) return "-";
        return (
          <ul className="flex flex-col gap-1">
            {entry.prerequisites.map((id) => {
              if (id === databaseId) {
                const database = itemsById.get(databaseId);
                return (
                  <li key={id}>
                    Needs: database (usage billed {database?.recurring})
                  </li>
                );
              }
              const required = itemsById.get(id);
              if (!required) return null;
              return (
                <li key={id}>
                  {required.name} ({fullCost(required)})
                </li>
              );
            })}
          </ul>
        );
      },
    },
  ];

  return (
    <div className="section-gap">
      <div className="mb-6 pb-4 border-b border-border">
        <h3 className="text-h3 font-serif mb-1">{category.title}</h3>
        <p className="text-sm text-muted">{category.blurb}</p>
        {category.note && <p className="text-sm text-muted mt-2 italic">{category.note}</p>}
      </div>
      <DataTable columns={columns} rows={category.items} rowKey={(entry) => entry.id} />
    </div>
  );
}

export default function AddOnsTable({
  categories,
  levelLegend,
  databaseTier,
  customSolution,
}: {
  categories: PricingCategory[];
  levelLegend: PricingLevelInfo[];
  databaseTier: PricingLineItem;
  customSolution: PricingLineItem;
}) {
  const itemsById = buildItemIndex(categories, databaseTier);

  return (
    <div>
      <LevelLegend legend={levelLegend} />
      {categories.map((category) => (
        <AddOnCategory
          key={category.id}
          category={category}
          itemsById={itemsById}
          databaseId={databaseTier.id}
          legend={levelLegend}
        />
      ))}

      <div className="mt-10">
        <div className="mb-6 pb-4 border-b border-border">
          <h3 className="text-h3 font-serif mb-1">{customSolution.name}</h3>
        </div>
        <p className="text-sm text-muted leading-relaxed">{customSolution.responsibility}</p>
      </div>
    </div>
  );
}
