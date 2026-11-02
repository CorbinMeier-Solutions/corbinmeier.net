import type { MetaDescriptor } from "react-router";
import { SITE_URL } from "@/config/site";

const IMAGE_PATH = "/corbin.jpg";
const IMAGE_SIZE = "288";

export function canonicalUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
};

export function pageMeta({ title, description, path, noindex = false }: PageMetaInput): MetaDescriptor[] {
  const base: MetaDescriptor[] = [{ title }, { name: "description", content: description }];
  if (noindex) return [...base, { name: "robots", content: "noindex" }];

  const url = canonicalUrl(path);
  const image = `${SITE_URL}${IMAGE_PATH}`;
  return [
    ...base,
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: IMAGE_SIZE },
    { property: "og:image:height", content: IMAGE_SIZE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
}
