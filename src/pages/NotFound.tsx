import CrtNotFound from "@/components/CrtNotFound";

export function meta() {
  return [
    { title: "Page not found | Corbin Meier" },
    {
      name: "description",
      content:
        "The page you are looking for might have been removed, had its name changed or is temporarily unavailable.",
    },
  ];
}

export default function NotFound() {
  return <CrtNotFound />;
}
