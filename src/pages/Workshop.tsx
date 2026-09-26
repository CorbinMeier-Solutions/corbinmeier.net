import { workshop } from "@/data/workshop";
import WorkshopLog from "@/components/WorkshopLog";
import SeoHead from "@/components/SeoHead";
import PageShell from "@/components/PageShell";
import PageSection from "@/components/PageSection";

export default function Workshop() {
  return (
    <PageShell theme="yellow">
      <SeoHead
        title="Workshop | Corbin Meier"
        description="Side projects and internal tools built by Corbin Meier, sectioned by category with full specs: the problem, what was built, and the stack behind it."
        path="/workshop"
      />
      <main className="page-container">
        <PageSection
          headingLevel={1}
          reveal
          prompt="ls -la ./workshop/"
          eyebrow={workshop.eyebrow}
          heading={
            <>
              {workshop.headingPre}{" "}
              <span className="text-accent italic">{workshop.headingAccent}</span>
            </>
          }
          lead={workshop.intro}
        />

        {workshop.categories.map((category) => (
          <PageSection key={category.id} heading={category.title}>
            <WorkshopLog entries={category.entries} emptyNote={workshop.emptyCategoryNote} />
          </PageSection>
        ))}
      </main>
    </PageShell>
  );
}
