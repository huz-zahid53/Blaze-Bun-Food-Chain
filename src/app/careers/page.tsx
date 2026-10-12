import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Heart,
  MapPin,
  Rocket,
  TrendingUp,
  Users,
} from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { openings } from "@/data/content";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Work at Blaze & Bun — grill masters, shift leads, riders, brand designers and operations analysts across Karachi, Lahore and Islamabad.",
};

const perks = [
  {
    icon: TrendingUp,
    title: "Above-market pay",
    body: "We benchmark every role against the top of the market, not the middle. Riders keep 100% of their tips.",
  },
  {
    icon: GraduationCap,
    title: "Real promotion paths",
    body: "Half our branch managers started on the grill. We promote from inside first — always.",
  },
  {
    icon: Heart,
    title: "Health coverage",
    body: "IPD coverage for every permanent employee and their immediate family. Not just the managers.",
  },
  {
    icon: Users,
    title: "Sane scheduling",
    body: "Rotas published two weeks ahead. Paid overtime. Actual breaks. No on-call nonsense.",
  },
  {
    icon: Rocket,
    title: "Free food, obviously",
    body: "One hot meal on every shift plus 40% off on your days off. Yes, even on the Inferno burger.",
  },
  {
    icon: Briefcase,
    title: "Skills that travel",
    body: "Certified food safety and hospitality training we pay for, that's yours to take anywhere.",
  },
];

const typeStyles: Record<string, string> = {
  Restaurant: "bg-ember/12 text-ember-dark",
  Operations: "bg-flame/15 text-amber-800",
  Office: "bg-indigo-500/12 text-indigo-700",
};

export default function CareersPage() {
  return (
    <>
      <PageHero
          image="/media/hero/bg-kitchen.jpg"
          focus="left"
        kicker="Careers"
        title={[<span key="a">Work where</span>, <br key="b" />,
          <span key="c" className="bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">
            it's hot
          </span>]}
        subtitle="We're 400+ people across twelve branches and one head office. Half our branch managers started on the grill."
      >
        <Link
          href="#openings"
          className="inline-flex items-center gap-2 rounded-full bg-ember px-8 py-4 text-[13px] font-black uppercase tracking-wider text-white hover:bg-ember-dark"
        >
          See {openings.length} open roles
        </Link>
      </PageHero>

      {/* Perks */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
              <span className="h-[3px] w-6 rounded-full bg-ember" />
              Why here
            </span>
            <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
              What you actually get
            </h2>
          </div>
        </Reveal>

        <Stagger className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {perks.map((p) => {
            const Icon = p.icon;
            return (
              <StaggerItem key={p.title} className="h-full">
                <div className="flex h-full gap-5 rounded-[26px] border border-charcoal/8 bg-white p-6">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-charcoal p-3 text-flame">
                    <Icon className="h-6 w-6" strokeWidth={2.2} />
                  </span>
                  <div>
                    <h3 className="t-sub uppercase tracking-wide text-charcoal">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-[1.6] text-slate-brand">
                      {p.body}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* Openings */}
      <section
        id="openings"
        className="scroll-mt-28 border-y border-charcoal/8 bg-bone section-y"
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
                  <span className="h-[3px] w-6 rounded-full bg-ember" />
                  Open roles
                </span>
                <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
                  {openings.length} positions open
                </h2>
              </div>
              <p className="max-w-xs text-[13.5px] text-slate-brand">
                Don't see your role? Send us a spec — we hire ahead of
                openings fairly often.
              </p>
            </div>
          </Reveal>

          <Stagger className="mt-8 space-y-4">
            {openings.map((job) => (
              <StaggerItem key={job.id}>
                <details className="group rounded-[26px] border border-charcoal/8 bg-white transition-colors open:border-ember">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-4 p-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="t-section-sm uppercase tracking-wide text-charcoal">
                          {job.title}
                        </h3>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                            typeStyles[job.type] ?? "bg-charcoal/8 text-slate-brand",
                          )}
                        >
                          {job.type}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-slate-brand">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-ember" />
                          {job.location}
                        </span>
                        <span>{job.commitment}</span>
                        <span className="font-bold text-charcoal">{job.salary}</span>
                      </div>
                    </div>

                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-charcoal/6 text-charcoal transition-all group-open:rotate-45">
                      <span className="text-lg leading-none">+</span>
                    </span>
                  </summary>

                  <div className="border-t border-charcoal/8 px-6 pb-6 pt-5">
                    <p className="max-w-2xl text-[13.5px] leading-[1.6] text-slate-brand">
                      {job.body}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href="#apply"
                        className="rounded-full bg-charcoal px-6 py-3 text-[11.5px] font-black uppercase tracking-wider text-cream transition-colors hover:bg-ember"
                      >
                        Apply for this role
                      </Link>
                      <a
                        href={`mailto:${brand.careersEmail}?subject=Application:%20${encodeURIComponent(
                          job.title,
                        )}`}
                        className="rounded-full border-2 border-charcoal/12 px-6 py-3 text-[11.5px] font-black uppercase tracking-wider text-charcoal transition-colors hover:border-charcoal"
                      >
                        Email your CV
                      </a>
                    </div>
                  </div>
                </details>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Apply */}
      <section
        id="apply"
        className="mx-auto max-w-[1400px] scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
                <span className="h-[3px] w-6 rounded-full bg-ember" />
                Apply
              </span>
              <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
                Tell us
                <br />
                who you are
              </h2>
              <p className="mt-4 max-w-md text-[14.5px] leading-[1.6] text-slate-brand">
                No cover letter required. Tell us the role, why you want it, and
                one thing you're genuinely good at. We read every application
                ourselves within a week.
              </p>

              <div className="mt-8 rounded-3xl bg-charcoal p-7 text-cream">
                <h3 className="t-sub uppercase tracking-wide">
                  Hiring process
                </h3>
                <ol className="mt-4 space-y-3 text-[13px]">
                  {[
                    "Application reviewed within 5 working days",
                    "15-minute phone screen with the hiring lead",
                    "Practical trial — paid, on-site, half a shift",
                    "Offer within 48 hours of the trial",
                  ].map((s, i) => (
                    <li key={s} className="flex gap-3">
                      <span className="font-display text-ember">0{i + 1}</span>
                      <span className="text-cream/70">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <EnquiryForm
              kind="careers"
              title="Application"
              subtitle="We reply to every application within five working days."
              submitLabel="Submit application"
              successTitle="Application received"
              successBody="Thanks — we'll be in touch within five working days."
              fields={[
                { id: "name", label: "Full name", required: true, half: true },
                { id: "phone", label: "Phone", type: "tel", required: true, half: true },
                { id: "email", label: "Email", type: "email", required: true },
                {
                  id: "role",
                  label: "Role applying for",
                  type: "select",
                  required: true,
                  half: true,
                  options: [...openings.map((o) => o.title), "Speculative application"],
                },
                {
                  id: "city",
                  label: "City",
                  type: "select",
                  required: true,
                  half: true,
                  options: [
                    "Karachi",
                    "Lahore",
                    "Islamabad",
                    "Rawalpindi",
                    "Faisalabad",
                    "Multan",
                  ],
                },
                {
                  id: "experience",
                  label: "Years of relevant experience",
                  type: "select",
                  required: true,
                  half: true,
                  options: ["None yet", "1–2 years", "3–5 years", "5+ years"],
                },
                {
                  id: "notice",
                  label: "Notice period",
                  half: true,
                  placeholder: "e.g. Immediately / 1 month",
                },
                {
                  id: "about",
                  label: "Why you, and one thing you're great at",
                  type: "textarea",
                  required: true,
                  placeholder:
                    "Keep it short and honest — we'd rather hear your voice than a CV template.",
                },
                {
                  id: "portfolio",
                  label: "Portfolio / LinkedIn / CV link",
                  placeholder: "https:// (optional)",
                },
              ]}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
