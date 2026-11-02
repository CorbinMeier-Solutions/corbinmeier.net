import { Link } from "react-router";
import SeoHead from "@/components/SeoHead";
import PageShell from "@/components/PageShell";
import { motion, Variants } from "framer-motion";

const LAST_UPDATED = "July 21, 2026";

export default function TermsOfService() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <PageShell>
      <SeoHead
        title="Terms of Service | Corbin Meier"
        description="Terms of Service governing use of corbinmeier.net, its content, and the contact form."
        path="/terms-of-service"
      />
      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="page-container"
      >
        <motion.header variants={item} className="w-full mb-16 text-center sm:text-left">
          <h1 className="text-h1 font-serif mb-6">Terms of Service</h1>
          <p className="text-narrative">Last updated: {LAST_UPDATED}</p>
          <p className="text-sm text-muted mt-2">
            See also our{" "}
            <Link to="/privacy-policy" className="text-accent hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </motion.header>

        <motion.div variants={item} className="w-full space-y-10 text-muted leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Acceptance of Terms</h2>
            <p>
              By accessing or using corbinmeier.net (the "site"), you agree to be bound by
              these Terms of Service. If you do not agree, please discontinue use of the
              site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Use of the Site</h2>
            <p>
              This site is provided to showcase Corbin Meier's work, background, and
              services as a software engineer, and to allow visitors to make contact
              through the contact form. You agree to use the site only for lawful
              purposes and not to attempt to disrupt its operation, probe it for
              vulnerabilities without authorization, or submit the contact form with
              false, abusive, or malicious content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Intellectual Property</h2>
            <p>
              All content on this site - including text, design, layout, graphics, and
              source code authored by Corbin Meier - is the property of Corbin Meier
              unless otherwise noted, and may not be reproduced, distributed, or used
              commercially without prior written permission. Project names,
              logos, and screenshots may be the property of their respective owners and
              are shown for project/demonstration purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Contact Form Submissions</h2>
            <p>
              Information you submit through the contact form is handled as described in
              the{" "}
              <Link to="/privacy-policy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
              . You are responsible for the accuracy and legality of anything you submit,
              and agree not to use the form to transmit spam, malware, or unlawful
              content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">No Warranty</h2>
            <p>
              This site and its content are provided "as is," without warranties of any
              kind, express or implied, including but not limited to accuracy,
              availability, or fitness for a particular purpose. Project descriptions
              reflect Corbin Meier's own account of work performed and are provided for
              informational purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Corbin Meier is not liable for any
              indirect, incidental, or consequential damages arising from your use of, or
              inability to use, this site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">External Links</h2>
            <p>
              This site may link to third-party sites (e.g. GitHub, LinkedIn, client
              projects, Butte College). Corbin Meier is not responsible for the content,
              policies, or practices of any third-party site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Changes to These Terms</h2>
            <p>
              These terms may be updated from time to time. Continued use of the site
              after changes are posted constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Contact</h2>
            <p>
              Questions about these terms can be sent to{" "}
              <a href="mailto:contact@corbinmeier.net" className="text-accent hover:underline">
                contact@corbinmeier.net
              </a>.
            </p>
          </section>

          <p className="text-xs text-muted-foreground pt-6 border-t border-border">
            These terms are provided as a general good-faith summary and are not legal
            advice. Consult an attorney to confirm they meet your specific legal
            obligations.
          </p>
        </motion.div>
      </motion.main>
    </PageShell>
  );
}
