import Hero from "@/components/Hero";
import EducationStrip from "@/components/EducationStrip";
import Services from "@/components/Services";
import FeaturedProjects from "@/components/FeaturedProjects";
import CTA from "@/components/CTA";
import { pageMeta } from "@/lib/seo";
import PageShell from "@/components/PageShell";

export function meta() {
  return pageMeta({
    title: "Custom websites, built right. | Corbin Meier",
    description: "I design and build custom, high-performance websites for local businesses - quoted fairly to fit your project and budget.",
    path: "/",
  });
}

export default function Home() {
  return (
    <PageShell theme="blue">
      <main className="flex flex-col">
        <Hero />
        <EducationStrip />
        <FeaturedProjects />
        <Services />
        <CTA />
      </main>
    </PageShell>
  );
}
