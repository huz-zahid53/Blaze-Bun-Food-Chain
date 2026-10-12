import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Banknote,
  GraduationCap,
  Handshake,
  LayoutGrid,
  LineChart,
  MapPin,
  Megaphone,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { RoiCalculator } from "@/components/franchise/RoiCalculator";
import { brand } from "@/config/brand";
import { formatPKR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Franchise",
  description:
    "Open a Blaze & Bun franchise in Pakistan. Turnkey fit-out, full training, supply chain and marketing support from Rs 2.8 crore. Enquire today.",
};

const reasons = [
  {
    icon: PackageCheck,
    title: "Turnkey fit-out",
    body: "We handle site selection, design, equipment specification and the complete build. You get the keys to a finished restaurant.",
  },
  {
    icon: GraduationCap,
    title: "Six weeks' training",
    body: "You and your core team train in a live branch — grill, prep, service, inventory and the POS. Then we open with you.",
  },
  {
    icon: LineChart,
    title: "Proven unit economics",
    body: "Twelve trading branches, all profitable, all funded from operating cash flow. You see the numbers before you commit.",
  },
  {
    icon: Megaphone,
    title: "Marketing that lands",
    body: "National brand campaigns, local launch support, and a loyalty platform with 180,000+ members from day one.",
  },
  {
    icon: Handshake,
    title: "Supply chain handled",
    body: "Central procurement for everything except fresh produce and our daily-ground chuck. You never chase a supplier.",
  },
  {
    icon: ShieldCheck,
    title: "Territory protection",
    body: "Exclusive territory rights with a defined radius. We will not open a second branch on top of yours.",
  },
];

const investment = [
  { label: "Franchise fee", amount: "Rs 45,00,000", note: "One-time, 10-year term" },
  { label: "Fit-out & equipment", amount: "Rs 1,60,00,000", note: "1,800–2,600 sq ft shell" },
  { label: "Initial inventory", amount: "Rs 22,00,000", note: "Opening stock & packaging" },
  { label: "Training & launch", amount: "Rs 18,00,000", note: "Team training + launch campaign" },
  { label: "Working capital", amount: "Rs 35,00,000", note: "Three months' operating buffer" },
];

const process = [
  {
    title: "Enquiry & intro call",
    body: "Tell us your city, your capital and your background. We'll send the full information pack and book a call.",
  },
  {
    title: "Financial review",
    body: "We review your funding position together and walk through unit economics from our existing branches, line by line.",
  },
  {
    title: "Site approval",
    body: "Our team surveys candidate sites for footfall, catchment and kitchen feasibility. We approve or reject together.",
  },
  {
    title: "Agreement & fit-out",
    body: "Sign the franchise agreement, then our projects team takes over the build. Typically 90–120 days to handover.",
  },
  {
    title: "Training",
    body: "Six weeks embedded in a live branch for you and your core team, covering grill, prep, service and the POS.",
  },
  {
    title: "Launch",
    body: "We open with you — on-site for the first two weeks, plus a full local launch campaign and loyalty onboarding.",
  },
];

const faqs = [
  {
    q: "How much capital do I actually need?",
    a: "A typical branch requires Rs 2.8 crore all-in, of which we expect at least 40% to be unencumbered equity. The balance can be debt-financed, and we have relationships with two banks that understand our model.",
  },
  {
    q: "Do I need restaurant experience?",
    a: "No, but it helps. Roughly a third of our franchise partners came from outside hospitality. The six-week training programme is designed to take someone from zero to running a branch, and we embed an experienced branch manager for your first three months.",
  },
  {
    q: "What are the ongoing fees?",
    a: "A 6% royalty on gross revenue and a 3% contribution to the national marketing fund. There are no hidden fees on equipment, packaging or supplies — our procurement is at cost.",
  },
  {
    q: "How long is the agreement?",
    a: "Ten years, with a mutual renewal option. Territory rights are exclusive for the whole term, subject to performance thresholds we set together at signing.",
  },
  {
    q: "What returns should I expect?",
    a: "Our trading branches run 20–26% EBITDA margins with an indicative payback of 26–38 months depending on site and execution. We'll show you actual branch P&Ls during due diligence — not a projection deck.",
  },
  {
    q: "Which cities are you targeting next?",
    a: "We're actively looking in Faisalabad, Multan, Peshawar, Quetta, Gujranwala and Sialkot, plus additional sites in Karachi, Lahore and Islamabad.",
  },
];

export default function FranchisePage() {
  return (
    <>
      <PageHero
          image="/media/story/franchise.jpg"
        kicker="Franchise"
        title={[<span key="a">Own the</span>, <br key="b" />,
          <span key="c" className="bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">
            flame
          </span>]}
        subtitle="Twelve branches, four cities, zero outside investors and every single one profitable. We're looking for partners who want to build the next dozen."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="#enquiry"
            className="inline-flex items-center gap-2 rounded-full bg-ember px-8 py-4 text-[13px] font-black uppercase tracking-wider text-white hover:bg-ember-dark"
          >
            Request the info pack
          </Link>
          <Link
            href="#calculator"
            className="inline-flex items-center gap-2 rounded-full border-2 border-cream/25 px-7 py-4 text-[13px] font-black uppercase tracking-wider text-cream hover:border-cream hover:bg-cream/10"
          >
            Model the numbers
          </Link>
        </div>
      </PageHero>

      {/* Why */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
              <span className="h-[3px] w-6 rounded-full bg-ember" />
              Why Blaze & Bun
            </span>
            <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
              What you get
            </h2>
          </div>
        </Reveal>

        <Stagger className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r) => {
            const Icon = r.icon;
            return (
              <StaggerItem key={r.title} className="h-full">
                <div className="group h-full rounded-[26px] border border-charcoal/8 bg-white p-6 transition-all hover:-translate-y-1.5 hover:border-ember">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-charcoal text-flame transition-colors group-hover:bg-ember group-hover:text-white">
                    <Icon className="h-5.5 w-5.5" strokeWidth={2.2} />
                  </span>
                  <h3 className="t-sub mt-5 uppercase tracking-wide text-charcoal">
                    {r.title}
                  </h3>
                  <p className="mt-2.5 text-[13.5px] leading-[1.6] text-slate-brand">
                    {r.body}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* Investment + calculator */}
      <section id="calculator" className="scroll-mt-28 border-y border-charcoal/8 bg-bone section-y">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
                <span className="h-[3px] w-6 rounded-full bg-ember" />
                The numbers
              </span>
              <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
                What it costs,
                <br />
                what it returns
              </h2>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-7 lg:grid-cols-[380px_1fr] lg:items-start">
            {/* Investment table */}
            <Reveal>
              <div className="rounded-[28px] bg-charcoal p-6 text-cream sm:p-7">
                <h3 className="t-section-sm flex items-center gap-2.5 uppercase tracking-wide">
                  <Banknote className="h-5 w-5 text-ember" />
                  Investment breakdown
                </h3>

                <dl className="mt-6 space-y-4">
                  {investment.map((i) => (
                    <div
                      key={i.label}
                      className="border-b border-cream/10 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-[13px] font-bold text-cream">{i.label}</dt>
                        <dd className="shrink-0 font-display text-lg text-flame">
                          {i.amount}
                        </dd>
                      </div>
                      <p className="mt-1 text-[11.5px] text-cream/45">{i.note}</p>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 flex items-baseline justify-between border-t-2 border-ember pt-5">
                  <span className="text-[13px] font-black uppercase tracking-wider">
                    Total
                  </span>
                  <span className="font-display text-[32px] leading-none">
                    Rs 2,80,00,000
                  </span>
                </div>

                <p className="mt-4 text-[11.5px] leading-[1.6] text-cream/45">
                  Indicative for a 1,800–2,600 sq ft high-street or mall unit.
                  Final cost confirmed after site survey.
                </p>
              </div>
            </Reveal>

            {/* Calculator */}
            <Reveal delay={0.08}>
              <RoiCalculator />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Reveal>
          <h2 className="t-section uppercase tracking-wide text-charcoal">
            From enquiry to opening
          </h2>
          <p className="mt-3 max-w-xl text-[14.5px] text-slate-brand">
            Typically five to eight months end to end, depending on how quickly
            we land the right site.
          </p>
        </Reveal>

        <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {process.map((p, i) => (
            <StaggerItem key={p.title} className="h-full">
              <div className="relative h-full rounded-[26px] border border-charcoal/8 bg-white p-6">
                <span className="font-display text-5xl leading-none text-ember/20">
                  0{i + 1}
                </span>
                <h3 className="t-sub mt-3 uppercase tracking-wide text-charcoal">
                  {p.title}
                </h3>
                <p className="mt-2.5 text-[13px] leading-[1.6] text-slate-brand">
                  {p.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Image band */}
      <Reveal>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px]">
            <Image
              src="/media/story/franchise.jpg"
              alt="Inside a Blaze & Bun restaurant"
              width={1600}
              height={700}
              sizes="100vw"
              className="h-[320px] w-full object-cover sm:h-[440px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/25 to-transparent" />
            <div className="absolute bottom-0 left-0 p-7 sm:p-11">
              <p className="inline-flex items-center gap-2 rounded-full bg-ember px-4 py-1.5 text-[10.5px] font-black uppercase tracking-wider text-white">
                <MapPin className="h-3.5 w-3.5" />
                Now scouting 6 new cities
              </p>
              <h3 className="t-section-sm mt-4 max-w-xl uppercase tracking-wide text-cream">
                Your city might be next
              </h3>
            </div>
          </div>
        </div>
      </Reveal>

      {/* FAQs */}
      <section className="mx-auto max-w-[900px] px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
              <span className="h-[3px] w-6 rounded-full bg-ember" />
              Franchise FAQs
            </span>
            <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
              The questions everyone asks
            </h2>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <Accordion items={faqs} className="mt-8 border-t border-charcoal/10" defaultOpen={-1} />
        </Reveal>
      </section>

      {/* Enquiry */}
      <section
        id="enquiry"
        className="scroll-mt-28 border-t border-charcoal/8 bg-charcoal py-12 text-cream sm:py-16"
      >
        <div className="mx-auto grid max-w-[1400px] items-start gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_560px] lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
              <span className="h-[3px] w-6 rounded-full bg-ember" />
              Enquire
            </span>
            <h2 className="t-section mt-3 uppercase tracking-wide">
              Let's talk
            </h2>
            <p className="mt-4 max-w-md text-[14.5px] leading-[1.6] text-cream/60">
              Tell us who you are and where you're looking. You'll get the full
              information pack — including real branch P&amp;Ls — within two
              working days.
            </p>

            <div className="mt-8 space-y-3 text-[13.5px]">
              <p className="flex items-center gap-2.5 text-cream/70">
                <LayoutGrid className="h-4 w-4 text-ember" />
                Net worth requirement: Rs 3 crore+
              </p>
              <p className="flex items-center gap-2.5 text-cream/70">
                <Banknote className="h-4 w-4 text-ember" />
                Liquid capital: Rs 1.1 crore minimum
              </p>
              <p className="flex items-center gap-2.5 text-cream/70">
                <Handshake className="h-4 w-4 text-ember" />
                {brand.franchiseEmail}
              </p>
            </div>
          </div>

          <EnquiryForm
            kind="franchise"
            tone="dark"
            title="Franchise enquiry"
            subtitle="All enquiries are confidential."
            submitLabel="Request info pack"
            successTitle="Enquiry received"
            successBody="Our franchise team will send the full pack within two working days."
            fields={[
              { id: "name", label: "Full name", required: true, half: true },
              { id: "phone", label: "Phone", type: "tel", required: true, half: true },
              { id: "email", label: "Email", type: "email", required: true },
              {
                id: "city",
                label: "City of interest",
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
                  "Peshawar",
                  "Quetta",
                  "Gujranwala",
                  "Sialkot",
                  "Other",
                ],
              },
              {
                id: "capital",
                label: "Investment capacity",
                type: "select",
                required: true,
                half: true,
                options: [
                  "Rs 1 – 2 crore",
                  "Rs 2 – 3 crore",
                  "Rs 3 – 5 crore",
                  "Rs 5 crore+",
                ],
              },
              {
                id: "background",
                label: "Business background",
                type: "textarea",
                placeholder:
                  "What do you do now? Any hospitality or retail experience?",
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
