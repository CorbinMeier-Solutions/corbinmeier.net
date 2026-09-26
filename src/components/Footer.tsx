"use client";

import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { IconBrandGithub, IconBrandLinkedin } from "@tabler/icons-react";
import { site } from "@/data/site";
import { CyberCodeSocialLink } from "@/components/cybercode/CyberCodeUIKit";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-10">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link to="/" className="font-serif text-2xl tracking-tight mb-6 block">
              {site.brandName}
            </Link>
            <p className="text-muted max-w-sm mb-8">
              {site.footerTagline}
            </p>
            <div className="flex gap-3">
              <CyberCodeSocialLink href={site.footerSocial.github} target="_blank" rel="noopener noreferrer" icon={<IconBrandGithub className="w-5 h-5" />} label="GitHub" />
              <CyberCodeSocialLink href={site.footerSocial.linkedin} target="_blank" rel="noopener noreferrer" icon={<IconBrandLinkedin className="w-5 h-5" />} label="LinkedIn" />
              <CyberCodeSocialLink href={site.footerSocial.email} icon={<Mail className="w-5 h-5" />} label="Email" />
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-6">{site.footerNavLabel}</h4>
            <ul className="space-y-4">
              {site.navItems.map((item) => (
                <li key={item.href}><Link to={item.href} className="text-muted hover:text-accent transition-colors">{item.name}</Link></li>
              ))}
              <li><Link to="/contact" className="text-muted hover:text-accent transition-colors">{site.contactCtaLabel}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-6">{site.footerLegalLabel}</h4>
            <ul className="space-y-4">
              {site.footerLegalLinks.map((item) => (
                <li key={item.href}><Link to={item.href} className="text-muted hover:text-accent transition-colors">{item.name}</Link></li>
              ))}
              <li><span className="text-muted">© {currentYear} {site.brandName}</span></li>
              <li><span className="text-muted">All rights reserved</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-xs text-accent uppercase tracking-widest font-mono">
            {site.missionStatement}
          </p>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
            {site.builtWithLine}
          </p>
        </div>
      </div>
    </footer>
  );
}
