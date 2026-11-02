import Hero from "@/components/Hero";
import EducationStrip from "@/components/EducationStrip";
import Services from "@/components/Services";
import FeaturedProjects from "@/components/FeaturedProjects";
import CTA from "@/components/CTA";
import { pageMeta } from "@/lib/seo";
import PageShell from "@/components/PageShell";

export function meta() {
  return pageMeta({
    title: "Corbin Meier | Software Engineer",
    description: "Software Engineer specializing in building sophisticated, high-performance applications.",
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
