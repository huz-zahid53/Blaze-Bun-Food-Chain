import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { brand, navLinks } from "@/config/brand";
import { Logo } from "@/components/brand/Logo";
import { StripeBar } from "@/components/ui/Marquee";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
} from "@/components/brand/SocialIcons";

const columns = [
  {
    title: "Eat",
    links: [
      { label: "Full menu", href: "/menu" },
      { label: "Deals & offers", href: "/deals" },
      { label: "Midnight drops", href: "/deals#midnight" },
      { label: "Catering", href: "/catering" },
      { label: "Nutrition & allergens", href: "/menu#allergens" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our story", href: "/about" },
      { label: "Locations", href: "/locations" },
      { label: "Journal", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Franchise", href: "/franchise" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "Feedback", href: "/feedback" },
      { label: "Track your order", href: "/track" },
      { label: "FAQs", href: "/contact#faqs" },
      { label: "Terms & privacy", href: "/legal" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-charcoal text-cream">
      <StripeBar />

      {/* Newsletter */}
      <div className="border-b border-cream/10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <h3 className="t-section-sm uppercase tracking-wide">
              Get the drop on every deal
            </h3>
            <p className="mt-2 max-w-md text-[14px] text-cream/55">
              New drops, midnight menus and the occasional free-burger giveaway.
              No spam, unsubscribe whenever.
            </p>
          </div>
          <NewsletterForm dark className="max-w-md" source="footer" />
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div>
          <Logo reverse />
          <p className="mt-5 max-w-xs text-[13.5px] leading-[1.6] text-cream/55">
            {brand.voice}
          </p>

          <ul className="mt-6 space-y-3 text-[13px] text-cream/70">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember" strokeWidth={2.4} />
              <span>{brand.headOffice}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-ember" strokeWidth={2.4} />
              <a href={brand.phoneHref} className="hover:text-cream">
                {brand.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-ember" strokeWidth={2.4} />
              <a href={`mailto:${brand.email}`} className="hover:text-cream">
                {brand.email}
              </a>
            </li>
          </ul>

          <div className="mt-6 flex gap-2.5">
            {[
              { Icon: InstagramIcon, href: brand.social.instagram, label: "Instagram" },
              { Icon: FacebookIcon, href: brand.social.facebook, label: "Facebook" },
              { Icon: XIcon, href: brand.social.x, label: "X" },
              { Icon: TikTokIcon, href: brand.social.tiktok, label: "TikTok" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full bg-cream/8 p-2.5 text-cream/70 transition-all hover:bg-ember hover:text-white"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="t-card uppercase tracking-[0.18em] text-ember">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13.5px] text-cream/60 transition-colors hover:text-cream"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-[12px] text-cream/40">
            © {year} {brand.name} Foods (Pvt) Ltd. Built in Karachi. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-cream/40">
            <span>Halal certified</span>
            <span className="text-cream/20">|</span>
            <span>{brand.hours}</span>
            <span className="text-cream/20">|</span>
            <nav className="flex gap-4">
              {navLinks.slice(0, 3).map((n) => (
                <Link key={n.href} href={n.href} className="hover:text-cream">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
