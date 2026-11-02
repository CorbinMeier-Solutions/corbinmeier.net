import CrtNotFound from "@/components/CrtNotFound";
import { pageMeta } from "@/lib/seo";

export function meta() {
  return pageMeta({
    title: "Page not found | Corbin Meier",
    description:
      "The page you are looking for might have been removed, had its name changed or is temporarily unavailable.",
    path: "/404",
    noindex: true,
  });
}

export default function NotFound() {
  return <CrtNotFound />;
}
