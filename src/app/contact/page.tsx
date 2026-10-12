import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { brand } from "@/config/brand";
import { branches } from "@/data/branches";
import { faqs } from "@/data/content";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { ContactForm } from "@/components/forms/ContactForm";
import { WhatsAppIcon } from "@/components/brand/SocialIcons";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Blaze & Bun — order issues, branch feedback, catering, franchise enquiries and press. Phone, WhatsApp, email or the contact form.",
};

const channels = [
  {
    icon: Phone,
    label: "Call us",
    value: brand.phone,
    href: brand.phoneHref,
    blurb: "Fastest way to fix an order that's gone sideways.",
    accent: "bg-ember",
  },
  {
    icon: WhatsAppIcon,
    label: "WhatsApp",
    value: brand.whatsapp,
    href: `https://wa.me/${brand.whatsapp.replace(/\D/g, "")}`,
    blurb: "Message us any time — replies within the hour.",
    accent: "bg-green-600",
  },
  {
    icon: Mail,
    label: "Email",
    value: brand.email,
    href: `mailto:${brand.email}`,
    blurb: "For catering, franchise, press and anything formal.",
    accent: "bg-charcoal",
  },
  {
    icon: MapPin,
    label: "Head office",
    value: "DHA Phase VI, Karachi",
    href: "/locations",
    blurb: brand.headOffice,
    accent: "bg-flame",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        image="/media/hero/bg-dining.jpg"
        focus="left"
        kicker="Contact"
        title={[<span key="a">Talk to</span>, <br key="b" />,
          <span key="c" className="bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">
            a human
          </span>]}
        subtitle="Order gone wrong? Want to cater 200 people? Thinking about opening a branch? All of it lands in the same inbox — and a real person reads it."
      />

      {/* Channels */}
      <section className="mx-auto -mt-10 max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only">Ways to reach us</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.label} delay={i * 0.06}>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group flex h-full flex-col rounded-[26px] border border-charcoal/8 bg-white p-6 transition-all hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-24px_rgba(16,14,12,0.45)]"
                >
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${c.accent} p-3 text-white`}
                  >
                    <Icon />
                  </span>
                  {/* Label is an eyebrow, not a heading — the value is the
                      meaningful card title, so it carries the h3. */}
                  <p className="t-eyebrow mt-5 text-slate-brand">{c.label}</p>
                  <h3 className="t-sub mt-1.5 uppercase tracking-wide text-charcoal">
                    {c.value}
                  </h3>
                  <p className="mt-2 text-[12.5px] leading-[1.6] text-slate-brand">
                    {c.blurb}
                  </p>
                </a>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Form + hours */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <Reveal>
            <ContactForm />
          </Reveal>

          <aside className="space-y-5 lg:sticky lg:top-28">
            <div className="rounded-3xl bg-charcoal p-6 text-cream">
              <h3 className="t-sub flex items-center gap-2 uppercase tracking-wide">
                <Clock className="h-4.5 w-4.5 text-ember" />
                Opening hours
              </h3>
              <dl className="mt-4 space-y-2.5 text-[13px]">
                {[
                  ["Mon — Thu", "12:00 PM — 02:00 AM"],
                  ["Fri — Sat", "12:00 PM — 03:00 AM"],
                  ["Sunday", "12:00 PM — 02:00 AM"],
                ].map(([d, h]) => (
                  <div key={d} className="flex justify-between gap-4">
                    <dt className="text-cream/55">{d}</dt>
                    <dd className="font-bold">{h}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 border-t border-cream/10 pt-4 text-[12px] leading-[1.6] text-cream/50">
                Karachi and Lahore branches run till 3 AM on weekends.
                Islamabad, Rawalpindi, Faisalabad and Multan close earlier —
                check your branch page.
              </p>
            </div>

            <div className="rounded-3xl border border-charcoal/8 bg-white p-6">
              <h3 className="t-sub uppercase tracking-wide text-charcoal">
                Branch support
              </h3>
              <p className="mt-2 text-[12.5px] leading-[1.6] text-slate-brand">
                For anything about a live order, calling the branch directly is
                always fastest.
              </p>
              <ul className="mt-4 space-y-2.5">
                {branches.slice(0, 4).map((b) => (
                  <li key={b.id}>
                    <a
                      href={`tel:${b.phone.replace(/-/g, "")}`}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-charcoal/4 px-4 py-2.5 transition-colors hover:bg-ember/8"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-bold text-charcoal">
                          {b.name}
                        </span>
                        <span className="block text-[11px] text-slate-brand">
                          {b.city}
                        </span>
                      </span>
                      <span className="shrink-0 text-[12px] font-bold text-ember">
                        {b.phone}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href="/locations"
                className="mt-4 block text-center text-[12px] font-black uppercase tracking-wider text-ember hover:underline"
              >
                All {branches.length} branches →
              </a>
            </div>

            <div className="rounded-3xl border border-charcoal/8 bg-bone p-6">
              <h3 className="t-sub flex items-center gap-2 uppercase tracking-wide text-charcoal">
                <MessageCircle className="h-4.5 w-4.5 text-ember" />
                Problem with an order?
              </h3>
              <p className="mt-2.5 text-[13px] leading-[1.6] text-slate-brand">
                We refund or re-deliver, no interrogation. If something went
                wrong, that's our problem to fix — not yours to justify.
              </p>
              <a
                href={brand.phoneHref}
                className="mt-4 flex w-full items-center justify-center rounded-full bg-ember py-3.5 text-[11.5px] font-black uppercase tracking-wider text-white hover:bg-ember-dark"
              >
                Call {brand.phone}
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* FAQs */}
      <section
        id="faqs"
        className="scroll-mt-28 border-t border-charcoal/8 bg-white section-y"
      >
        <div className="mx-auto max-w-[900px] px-4 sm:px-6">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
                <span className="h-[3px] w-6 rounded-full bg-ember" />
                Frequently asked
              </span>
              <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
                Questions we get a lot
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <Accordion items={faqs} className="mt-8 border-t border-charcoal/10" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
