import type { Metadata } from "next";
import { MessageSquareQuote, ShieldCheck, ThumbsUp } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { FeedbackForm } from "@/components/forms/FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Tell us how we did. Rate your food, service and value, and your feedback goes straight to the branch manager and head office team.",
};

export default function FeedbackPage() {
  return (
    <>
      <PageHero
          image="/media/hero/bg-sweets.jpg"
        kicker="Feedback"
        title={[<span key="a">Tell us</span>, <br key="b" />,
          <span key="c" className="bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">
            the truth
          </span>]}
        subtitle="Good, bad or ugly — we'd rather hear it from you than find out from a review three months later. Every submission is read by the branch manager."
      />

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
          <Reveal>
            <FeedbackForm />
          </Reveal>

          <aside className="space-y-5 lg:sticky lg:top-28">
            <div className="rounded-3xl bg-charcoal p-6 text-cream">
              <h3 className="t-sub flex items-center gap-2.5 uppercase tracking-wide">
                <MessageSquareQuote className="h-5 w-5 text-ember" />
                What happens next
              </h3>
              <ol className="mt-4 space-y-3.5 text-[13px] text-cream/65">
                {[
                  "Your feedback is tagged to the branch within seconds.",
                  "Anything rated 3 stars or below triggers a manager review the same day.",
                  "If you left an email, you get a reply within 48 hours.",
                  "Patterns across branches get reviewed at the weekly ops meeting.",
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-display text-ember">0{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-3xl border border-charcoal/8 bg-white p-6">
              <h3 className="t-sub flex items-center gap-2.5 uppercase tracking-wide text-charcoal">
                <ThumbsUp className="h-5 w-5 text-ember" />
                Recent changes we made
              </h3>
              <ul className="mt-4 space-y-4 text-[13px] leading-[1.6] text-slate-brand">
                <li>
                  <strong className="font-bold text-charcoal">
                    Thicker burger boxes.
                  </strong>{" "}
                  You told us burgers were arriving squashed. We upgraded
                  packaging across all twelve branches.
                </li>
                <li>
                  <strong className="font-bold text-charcoal">
                    Sauce on the side option.
                  </strong>{" "}
                  Added to every burger configurator after roughly 200 requests.
                </li>
                <li>
                  <strong className="font-bold text-charcoal">
                    Midnight menu until 4 AM.
                  </strong>{" "}
                  Extended from 2 AM after your 2 AM feedback.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-charcoal/8 bg-bone p-6">
              <h3 className="t-sub flex items-center gap-2.5 uppercase tracking-wide text-charcoal">
                <ShieldCheck className="h-5 w-5 text-ember" />
                Privacy
              </h3>
              <p className="mt-3 text-[13px] leading-[1.6] text-slate-brand">
                Feedback is anonymous unless you choose to leave your details.
                We never publish your name, and we never sell your data. Ever.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
