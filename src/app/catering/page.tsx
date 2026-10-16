import type { Metadata } from "next";
import { ImageWithSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import {
  CalendarCheck,
  ChefHat,
  ClipboardList,
  Phone,
  Truck,
  Users,
} from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { brand } from "@/config/brand";
import { formatPKR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Catering",
  description:
    "Blaze & Bun catering for 20 to 500 guests — office lunches, mehndis, weddings and corporate events across Karachi, Lahore and Islamabad.",
};

const packages = [
  {
    id: "grill-squad",
    name: "The Grill Squad",
    serves: "20–40 guests",
    price: 2200,
    unit: "per 10 guests",
    blurb:
      "Built for office lunches and birthdays. Burgers, wings and sides laid out buffet-style, delivered hot in insulated carriers.",
    includes: [
      "Signature smash burgers (2 per guest)",
      "Peri peri wings (4 per guest)",
      "Loaded fries & peri peri fries",
      "House slaw + dipping sauces",
      "Insulated carriers included",
    ],
    hue: 18,
  },
  {
    id: "full-spread",
    name: "The Full Spread",
    serves: "50–120 guests",
    price: 1850,
    unit: "per 10 guests",
    blurb:
      "Our most-booked package. Live flame station on request so guests get burgers straight off the grill.",
    includes: [
      "Live flame grill station (2 chefs)",
      "Build-your-own burger bar",
      "Wings, tenders & loaded fries",
      "Salads, slaws & dips",
      "Soft drinks & water",
      "Setup, service & cleanup",
    ],
    hue: 32,
    featured: true,
  },
  {
    id: "grand-feast",
    name: "The Grand Feast",
    serves: "150–500 guests",
    price: 1450,
    unit: "per 10 guests",
    blurb:
      "Weddings, mehndis and corporate galas. Full event catering with dedicated on-site team and custom menu design.",
    includes: [
      "Multiple live cooking stations",
      "Custom menu designed with you",
      "Full buffet setup & styling",
      "Dedicated event manager",
      "Unlimited soft drinks station",
      "Dessert course included",
      "Setup, service & full cleanup",
    ],
    hue: 6,
  },
];

const process = [
  {
    icon: ClipboardList,
    title: "Tell us the numbers",
    body: "Guest count, date, venue, dietary requirements. That's all we need to quote.",
  },
  {
    icon: CalendarCheck,
    title: "We confirm by phone",
    body: "A catering manager calls within 4 hours to lock the menu, timings and logistics.",
  },
  {
    icon: ChefHat,
    title: "We cook on site",
    body: "For 50+ guests we bring the grill to you. Everything is cooked fresh, not transported cold.",
  },
  {
    icon: Truck,
    title: "We set up and clear",
    body: "Setup, service ware, staffing and full cleanup. You just show up and eat.",
  },
];

export default function CateringPage() {
  return (
    <>
      <PageHero
        image="/media/hero/bg-spread.jpg"
        focus="center"
        kicker="Catering"
        title={[<span key="a">Feed the</span>, <br key="b" />,
          <span key="c" className="bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">
            whole crew
          </span>]}
        subtitle="From 20-person office lunches to 500-guest weddings. Live flame stations, build-your-own burger bars, and a team that handles the setup and the cleanup."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="#enquiry"
            className="inline-flex items-center gap-2 rounded-full bg-ember px-8 py-4 text-[13px] font-black uppercase tracking-wider text-white hover:bg-ember-dark"
          >
            Get a quote
          </Link>
          <a
            href={`tel:${brand.phone.replace(/\D/g, "")}`}
            className="inline-flex items-center gap-2 rounded-full border-2 border-cream/25 px-7 py-4 text-[13px] font-black uppercase tracking-wider text-cream hover:border-cream hover:bg-cream/10"
          >
            <Phone className="h-4 w-4" />
            {brand.phone}
          </a>
        </div>
      </PageHero>

      {/* Packages */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
              <span className="h-[3px] w-6 rounded-full bg-ember" />
              Packages
            </span>
            <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
              Pick your scale
            </h2>
            <p className="mt-3 text-[14.5px] leading-[1.6] text-slate-brand">
              Every package scales by headcount. Prices are per 10 guests and
              include staffing, service ware and cleanup.
            </p>
          </div>
        </Reveal>

        <Stagger className="mt-9 grid gap-6 lg:grid-cols-3">
          {packages.map((p) => (
            <StaggerItem key={p.id} className="h-full">
              <div
                className={
                  p.featured
                    ? "relative flex h-full flex-col rounded-[28px] bg-charcoal p-7 text-cream shadow-[0_30px_70px_-40px_rgba(16,14,12,0.8)] sm:p-8"
                    : "flex h-full flex-col rounded-[28px] border border-charcoal/8 bg-white p-7 sm:p-8"
                }
              >
                {p.featured && (
                  <span className="absolute -top-3 right-7 rounded-full bg-ember px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">
                    Most booked
                  </span>
                )}

                <p
                  className={`text-[10.5px] font-black uppercase tracking-[0.2em] ${
                    p.featured ? "text-flame" : "text-slate-brand"
                  }`}
                >
                  {p.serves}
                </p>
                <h3
                  className={`mt-2 t-sub ${
                    p.featured ? "" : "text-charcoal"
                  }`}
                >
                  {p.name}
                </h3>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span
                    className={`font-display text-[38px] leading-none ${
                      p.featured ? "text-flame" : "text-charcoal"
                    }`}
                  >
                    {formatPKR(p.price)}
                  </span>
                  <span
                    className={`text-[11.5px] font-semibold ${
                      p.featured ? "text-cream/45" : "text-slate-brand"
                    }`}
                  >
                    / {p.unit}
                  </span>
                </div>

                <p
                  className={`mt-4 text-[13.5px] leading-[1.6] ${
                    p.featured ? "text-cream/60" : "text-slate-brand"
                  }`}
                >
                  {p.blurb}
                </p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.includes.map((inc) => (
                    <li
                      key={inc}
                      className={`flex items-start gap-2.5 text-[13px] ${
                        p.featured ? "text-cream/75" : "text-charcoal/85"
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          p.featured ? "bg-flame" : "bg-ember"
                        }`}
                      />
                      {inc}
                    </li>
                  ))}
                </ul>

                <Link
                  href="#enquiry"
                  className={`mt-7 flex w-full items-center justify-center rounded-full py-4 text-[11.5px] font-black uppercase tracking-wider transition-colors ${
                    p.featured
                      ? "bg-ember text-white hover:bg-ember-dark"
                      : "bg-charcoal text-cream hover:bg-ember"
                  }`}
                >
                  Enquire about this
                </Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Process */}
      <section className="border-y border-charcoal/8 bg-bone section-y">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="t-section uppercase tracking-wide text-charcoal">
              How it works
            </h2>
          </Reveal>

          <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p, i) => {
              const Icon = p.icon;
              return (
                <StaggerItem key={p.title} className="h-full">
                  <div className="h-full rounded-[26px] border border-charcoal/8 bg-white p-6">
                    <div className="flex items-center gap-3">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-charcoal text-flame">
                        <Icon className="h-5.5 w-5.5" strokeWidth={2.2} />
                      </span>
                      <span className="font-display text-3xl text-ember">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="t-sub mt-5 uppercase tracking-wide text-charcoal">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-[1.6] text-slate-brand">
                      {p.body}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Enquiry */}
      <section
        id="enquiry"
        className="mx-auto max-w-[1400px] scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
                <span className="h-[3px] w-6 rounded-full bg-ember" />
                Enquire
              </span>
              <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
                Tell us about
                <br />
                your event
              </h2>
              <p className="mt-4 text-[14.5px] leading-[1.6] text-slate-brand">
                Give us the numbers and we'll come back with a proper quote
                within four working hours. For events over 100 guests, please
                allow 48 hours' notice so we can crew it properly.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-charcoal/8 bg-white p-5">
                  <Users className="h-5 w-5 text-ember" />
                  <p className="mt-3 font-display text-2xl text-charcoal">20–500</p>
                  <p className="text-[11.5px] text-slate-brand">Guests we cater for</p>
                </div>
                <div className="rounded-2xl border border-charcoal/8 bg-white p-5">
                  <CalendarCheck className="h-5 w-5 text-ember" />
                  <p className="mt-3 font-display text-2xl text-charcoal">48h</p>
                  <p className="text-[11.5px] text-slate-brand">
                    Notice for large events
                  </p>
                </div>
              </div>

<div className="mt-6 overflow-hidden rounded-3xl">
                 <ImageWithSkeleton
                   src="/media/story/franchise.jpg"
                   alt="A Blaze & Bun dining room"
                   width={800}
                   height={520}
                   sizes="(max-width: 1024px) 100vw, 50vw"
                   className="h-full w-full object-cover"
                 />
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <EnquiryForm
              kind="catering"
              title="Catering enquiry"
              subtitle="Fields marked * are required."
              submitLabel="Request a quote"
              successTitle="Enquiry received"
              successBody="A catering manager will call you within 4 working hours."
              fields={[
                { id: "name", label: "Your name", required: true, half: true },
                { id: "phone", label: "Phone", type: "tel", required: true, half: true },
                { id: "email", label: "Email", type: "email", required: true, half: true },
                {
                  id: "guests",
                  label: "Guest count",
                  type: "number",
                  required: true,
                  half: true,
                  placeholder: "e.g. 80",
                },
                { id: "date", label: "Event date", type: "date", required: true, half: true },
                {
                  id: "package",
                  label: "Package",
                  type: "select",
                  required: true,
                  half: true,
                  options: [
                    "The Grill Squad (20–40)",
                    "The Full Spread (50–120)",
                    "The Grand Feast (150–500)",
                    "Not sure yet — advise me",
                  ],
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
                { id: "venue", label: "Venue / area", half: true },
                {
                  id: "notes",
                  label: "Tell us about the event",
                  type: "textarea",
                  placeholder:
                    "Occasion, setup time, dietary requirements, anything else we should know…",
                },
              ]}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
