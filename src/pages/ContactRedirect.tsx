import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useContactModal } from "@/components/ContactModalContext";
import { pageMeta } from "@/lib/seo";
import Home from "@/pages/Home";

export function meta() {
  return pageMeta({
    title: "Contact | Corbin Meier",
    description:
      "Ready to bring your project to life? Get in touch with Corbin Meier to discuss your next software engineering project.",
    path: "/contact",
    noindex: true,
  });
}

export default function ContactRedirect() {
  const navigate = useNavigate();
  const { open } = useContactModal();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const subject = searchParams.get("subject") || undefined;
    open({ subject });
    navigate("/", { replace: true });
  }, [navigate, open, searchParams]);
  return <Home />;
}
