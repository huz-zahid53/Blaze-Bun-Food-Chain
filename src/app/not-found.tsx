import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-charcoal text-cream">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-ember/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-flame/14 blur-[130px]" />

      <div className="relative mx-auto max-w-[800px] px-4 py-16 text-center sm:px-6">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-cream/12 bg-cream/5">
          <Flame className="h-9 w-9 text-ember animate-flicker" strokeWidth={2} />
        </span>

        <p className="mt-8 font-display text-[clamp(5rem,20vw,10rem)] leading-none tracking-wide text-ember">
          404
        </p>
        <h1 className="t-page mt-2 uppercase tracking-wide">
          This page went cold
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-[1.6] text-cream/60">
          Whatever you were looking for isn't here. It may have been taken off
          the menu, or the link was wrong.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-ember px-8 py-4 text-[13px] font-black uppercase tracking-wider text-white transition-all hover:bg-ember-dark"
          >
            Back to home
            <ArrowRight className="h-4 w-4" strokeWidth={3} />
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-full border-2 border-cream/25 px-8 py-4 text-[13px] font-black uppercase tracking-wider text-cream transition-colors hover:border-cream hover:bg-cream/10"
          >
            Browse the menu
          </Link>
        </div>
      </div>
    </section>
  );
}
