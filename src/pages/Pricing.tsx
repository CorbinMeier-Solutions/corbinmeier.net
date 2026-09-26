import { Link } from "react-router-dom";
import { Info, ArrowRight } from "lucide-react";
import PageShell from "@/components/PageShell";
import SeoHead from "@/components/SeoHead";
import PageSection from "@/components/PageSection";
import PackagesTable from "@/components/pricing/PackagesTable";
import AddOnsTable from "@/components/pricing/AddOnsTable";
import { pricing } from "@/data/pricing";

export default function Pricing() {
  return (
    <PageShell theme="teal">
      <SeoHead
        title="Pricing | Corbin Meier"
        description="Custom websites from $1,400, built once and owned outright. Three packages, maintenance you can opt out of entirely, and add-ons with every cost and responsibility stated up front."
        path="/pricing"
      />

      <main className="page-container">
        <PageSection
          headingLevel={1}
          prompt="cat ./pricing/menu.md"
          eyebrow={pricing.eyebrow}
          heading={
            <>
              {pricing.headingPre}{" "}
              <span className="text-accent italic">{pricing.headingAccent}</span>
            </>
          }
          lead={pricing.intro}
        >
          <div className="glass-panel border-accent/20 p-5 flex gap-4 items-start">
            <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-muted leading-relaxed">{pricing.ballpark}</p>
          </div>
        </PageSection>

        {/* Packages */}
        <PageSection heading={pricing.tiersHeading} lead={pricing.tiersIntro}>
          <PackagesTable tiers={pricing.tiers} />
        </PageSection>

        {/* Maintenance axis: offered against every package, so it renders once
            here rather than being repeated inside each package's row. */}
        <PageSection heading={pricing.maintenanceHeading} lead={pricing.maintenanceIntro}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {pricing.maintenanceOptions.map((option) => (
              <div
                key={option.id}
                className="glass-panel p-8 flex flex-col gap-5 h-full hover:border-accent/30 transition-colors duration-300"
              >
                <div>
                  <h3 className="text-h3 font-serif mb-3">{option.name}</h3>
                  <span className="font-serif text-3xl text-accent">{option.price}</span>
                </div>

                <p className="text-narrative text-base">{option.summary}</p>

                <ul className="space-y-3 mt-auto">
                  {option.points.map((line) => (
                    <li key={line} className="flex items-start gap-3 text-sm text-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </PageSection>

        {/* Add-ons */}
        <PageSection
          heading={
            <>
              {pricing.addOnsHeadingPre}{" "}
              <span className="text-accent italic">{pricing.addOnsHeadingAccent}</span>
            </>
          }
          lead={pricing.addOnsIntro}
        >
          <AddOnsTable
            categories={pricing.categories}
            levelLegend={pricing.levelLegend}
            databaseTier={pricing.databaseTier}
            customSolution={pricing.customSolution}
          />
        </PageSection>

        {/* Notices */}
        <PageSection heading={pricing.noticesHeading}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricing.notices.map((notice) => (
              <div key={notice.title} className="glass-panel p-6">
                <h3 className="font-serif text-lg mb-3 text-accent">{notice.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{notice.body}</p>
              </div>
            ))}
          </div>
        </PageSection>

        {/* CTA */}
        <section className="glass-panel p-12 text-center">
          <h2 className="text-h2 font-serif mb-6">
            {pricing.ctaHeadingPre}{" "}
            <span className="text-accent italic">{pricing.ctaHeadingAccent}</span>
          </h2>
          <p className="text-narrative mx-auto mb-10">{pricing.ctaBody}</p>
          <Link to="/contact" className="btn-artisan">
            {pricing.ctaLabel}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </section>
      </main>
    </PageShell>
  );
}
