import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Terms, Privacy & Policies",
  description:
    "Blaze & Bun terms of service, privacy policy, refund policy, allergen disclaimer and delivery terms.",
};

const sections = [
  {
    id: "terms",
    kicker: "Last updated 1 August 2026",
    title: "Terms of service",
    intro:
      "These terms govern your use of the Blaze & Bun website, ordering platform and any order you place with us.",
    items: [
      {
        q: "Placing an order",
        a: "An order is confirmed when you receive an order number and confirmation screen. Until then, we may decline an order — for example if an item is out of stock, a branch is at capacity, or a delivery address falls outside our serviceable area. If we decline after payment, you receive a full refund within 5 working days.",
      },
      {
        q: "Pricing and taxes",
        a: "All prices are in Pakistani Rupees and include applicable sales tax unless stated otherwise. Delivery charges are shown separately at checkout. Menu prices may vary slightly by branch; the price shown at checkout is the price you pay.",
      },
      {
        q: "Order accuracy",
        a: "You're responsible for checking your order details before confirming, including delivery address, contact number and any customisations. We can't amend an order once it has entered the kitchen.",
      },
      {
        q: "Age and alcohol",
        a: "We do not serve, cook with, or deliver alcohol in any form. There is no minimum age for placing an order, but anyone ordering must be capable of forming a binding contract.",
      },
      {
        q: "Intellectual property",
        a: "All content on this site — including our name, logo, photography, recipes and copy — is owned by Blaze & Bun Foods (Pvt) Ltd. You may not reproduce it commercially without written permission.",
      },
      {
        q: "Liability",
        a: "Nothing in these terms limits our liability for death or personal injury caused by negligence, or for fraudulent misrepresentation. Subject to that, our total liability for any order is limited to the value of that order.",
      },
    ],
  },
  {
    id: "privacy",
    kicker: "Last updated 1 August 2026",
    title: "Privacy policy",
    intro:
      "We collect the minimum data we need to cook your food, get it to you, and improve the service. We never sell it.",
    items: [
      {
        q: "What we collect",
        a: "Name, phone number, email, delivery address, order history and — if you pay by card — payment data processed by our payment provider. We never see or store full card numbers.",
      },
      {
        q: "Why we collect it",
        a: "To fulfil and deliver your order, contact you about that order, handle refunds or complaints, and — if you've opted in — send you offers. That's it.",
      },
      {
        q: "Marketing",
        a: "Marketing emails and SMS are opt-in only, and every message has a one-click unsubscribe. We do not send marketing to anyone who hasn't explicitly asked for it.",
      },
      {
        q: "Who we share it with",
        a: "Our payment processor, our delivery partners (limited to what they need to complete a delivery), and our own branch staff. We do not sell, rent or trade personal data to third parties for marketing.",
      },
      {
        q: "How long we keep it",
        a: "Order records are kept for seven years for tax and accounting purposes. Marketing consent records are kept until you withdraw consent.",
      },
      {
        q: "Your rights",
        a: `You can request a copy of your data, ask us to correct it, or ask us to delete it. Email ${brand.supportEmail} and we'll respond within 30 days.`,
      },
    ],
  },
  {
    id: "refunds",
    kicker: "Last updated 1 August 2026",
    title: "Refunds & replacements",
    intro:
      "If we get it wrong, we fix it. Our default is to refund or re-deliver first and ask questions later.",
    items: [
      {
        q: "Missing or incorrect items",
        a: "Contact the branch or use the contact form within 2 hours of delivery. We'll re-deliver the missing items or refund them in full — your choice.",
      },
      {
        q: "Late delivery",
        a: "If your order is significantly later than the ETA we gave you, tell us. We'll refund the delivery charge and, depending on the delay, offer credit toward your next order.",
      },
      {
        q: "Quality complaints",
        a: "Food arrived cold, undercooked or otherwise not right? Send us a photo if you can. We refund without requiring you to return the food.",
      },
      {
        q: "How refunds are paid",
        a: "Card and wallet refunds go back to the original payment method within 5–10 working days. Cash on delivery refunds are paid by bank transfer or as account credit, whichever you prefer.",
      },
      {
        q: "Cancellations",
        a: "You can cancel free of charge any time before your order enters the kitchen — usually within 2–3 minutes of placing it. After that, the food is being cooked and we can't cancel it.",
      },
    ],
  },
  {
    id: "allergens",
    kicker: "Read before you order",
    title: "Allergen & nutrition disclaimer",
    intro:
      "Important information for anyone with food allergies or dietary restrictions.",
    items: [
      {
        q: "Cross-contamination",
        a: "Every dish is prepared in a kitchen that handles gluten, dairy, egg, sesame, soy and tree nuts. While we keep preparation areas separate where we can, we cannot guarantee that any item is completely free of traces of any allergen.",
      },
      {
        q: "Calorie information",
        a: "Calorie counts shown are estimates based on standard recipes and default customisations. Adding extras, swapping sides or changing portions changes the numbers materially.",
      },
      {
        q: "Halal status",
        a: "All beef and chicken is halal certified. No pork is served or cooked in any branch, and no alcohol is used in any recipe. Supplier certificates are displayed in every branch.",
      },
      {
        q: "Severe allergies",
        a: "If you have a severe or life-threatening allergy, please call the branch directly before ordering so a manager can talk you through what we can safely prepare.",
      },
    ],
  },
];

export default function LegalPage() {
  return (
    <>
      <PageHero
          image="/media/hero/hero-2.jpg"
          tone="soft"
        kicker="Legal"
        title={[<span key="a">Terms, privacy</span>, <br key="b" />, <span key="c">&amp; policies</span>]}
        subtitle="The boring-but-important stuff, written in plain English. If anything here is unclear, email us and we'll explain it properly."
      />

      <section className="mx-auto max-w-[900px] space-y-10 px-4 py-12 sm:px-6 sm:py-16">
        {sections.map((s) => (
          <Reveal key={s.id}>
            <div id={s.id} className="scroll-mt-28">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-ember">
                {s.kicker}
              </p>
              <h2 className="t-section mt-2 uppercase tracking-wide text-charcoal">
                {s.title}
              </h2>
              <p className="mt-4 text-[15px] leading-[1.6] text-slate-brand">
                {s.intro}
              </p>
              <Accordion
                items={s.items}
                className="mt-7 border-t border-charcoal/10"
                defaultOpen={-1}
              />
            </div>
          </Reveal>
        ))}

        <Reveal>
          <div className="rounded-3xl bg-charcoal p-8 text-cream sm:p-10">
            <h2 className="t-section-sm uppercase tracking-wide">
              Questions?
            </h2>
            <p className="mt-3 max-w-lg text-[14px] leading-[1.6] text-cream/60">
              If any of this is unclear, or you need it in a different form,
              email us and a real person will reply properly.
            </p>
            <a
              href={`mailto:${brand.supportEmail}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ember px-7 py-3.5 text-[12px] font-black uppercase tracking-wider text-white hover:bg-ember-dark"
            >
              {brand.supportEmail}
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
