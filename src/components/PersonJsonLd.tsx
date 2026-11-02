import { SITE_URL } from "@/config/site";
import { serializeJsonLd } from "@/lib/jsonLd";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Corbin Meier",
  url: SITE_URL,
  image: `${SITE_URL}/corbin.jpg`,
  jobTitle: "Software Engineer",
  email: "mailto:contact@corbinmeier.net",
  sameAs: [
    "https://github.com/CorbinMeier",
    "https://www.linkedin.com/in/corbin-meier-a49484125/",
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Butte College",
    url: "https://www.butte.edu/",
  },
  knowsAbout: ["Software Engineering", "Web Development", "React", "Cloudflare"],
};

export default function PersonJsonLd() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(personJsonLd) }} />;
}
