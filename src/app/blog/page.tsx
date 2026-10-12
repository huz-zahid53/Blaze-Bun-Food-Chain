import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { posts } from "@/data/blog";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { NewsletterForm } from "@/components/ui/NewsletterForm";

export const metadata: Metadata = {
  title: "The Journal",
  description:
    "Stories from the grill — how we build a smash burger, where Karachi eats at 2 AM, and what it took to build twelve branches without investors.",
};

export default function BlogPage() {
  const [lead, ...rest] = posts;

  return (
    <>
      <PageHero
          image="/media/hero/hero-1.jpg"
        kicker="The Journal"
        title={[<span key="a">Notes from</span>, <br key="b" />,
          <span key="c" className="bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">
            the grill
          </span>]}
        subtitle="Recipes, city guides and the unglamorous operational detail behind running twelve kitchens. Written by the people who actually do the work."
      />

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Lead article */}
        <Reveal>
          <Link
            href={`/blog/${lead.slug}`}
            className="group grid overflow-hidden rounded-[32px] border border-charcoal/8 bg-white lg:grid-cols-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[420px]">
              {lead.image ? (
                <Image
                  src={lead.image}
                  alt={lead.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              ) : (
                <MediaFrame
                  hue={lead.hue}
                  glyph="burger"
                  alt={lead.title}
                  ratio="aspect-[16/10] lg:h-full"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
              <span className="absolute left-5 top-5 rounded-full bg-ember px-3.5 py-1.5 text-[10.5px] font-black uppercase tracking-wider text-white">
                {lead.category}
              </span>
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-10">
              <div className="flex flex-wrap items-center gap-3 text-[12px] font-semibold text-slate-brand">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-ember" />
                  {new Date(lead.date).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-ember" />
                  {lead.readTime}
                </span>
              </div>

              <h2 className="t-section mt-4 uppercase tracking-wide text-charcoal">
                {lead.title}
              </h2>
              <p className="mt-4 text-[14.5px] leading-[1.6] text-slate-brand">
                {lead.excerpt}
              </p>

              <div className="mt-7 flex items-center gap-3">
                <span
                  className="grid h-11 w-11 place-items-center rounded-full font-display text-[15px] text-white"
                  style={{ background: `hsl(${lead.hue} 72% 45%)` }}
                >
                  {lead.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div className="leading-tight">
                  <p className="text-[13.5px] font-bold text-charcoal">{lead.author}</p>
                  <p className="text-[11.5px] text-slate-brand">{lead.authorRole}</p>
                </div>
              </div>

              <span className="mt-7 inline-flex items-center gap-2 self-start rounded-full bg-charcoal px-6 py-3.5 text-[11.5px] font-black uppercase tracking-wider text-cream transition-colors group-hover:bg-ember">
                Read the piece
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  strokeWidth={3}
                />
              </span>
            </div>
          </Link>
        </Reveal>

        {/* Grid */}
        <Stagger className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <StaggerItem key={post.slug} className="h-full">
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-charcoal/8 bg-white transition-all hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-24px_rgba(16,14,12,0.45)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                  ) : (
                    <MediaFrame
                      hue={post.hue}
                      glyph="burger"
                      alt={post.title}
                      ratio="aspect-[16/10]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-charcoal/85 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-cream backdrop-blur">
                    {post.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap items-center gap-3 text-[11.5px] font-semibold text-slate-brand">
                    <span>
                      {new Date(post.date).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-ember">·</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="t-section-sm mt-3 uppercase tracking-wide text-charcoal">
                    {post.title}
                  </h3>
                  <p className="mt-2.5 flex-1 text-[13.5px] leading-[1.6] text-slate-brand">
                    {post.excerpt}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-charcoal/8 pt-4">
                    <span className="text-[12px] font-bold text-charcoal">
                      {post.author}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-ember transition-transform group-hover:translate-x-1"
                      strokeWidth={3}
                    />
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Newsletter */}
        <Reveal>
          <div className="mt-8 overflow-hidden rounded-[32px] bg-charcoal p-8 text-cream sm:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h2 className="t-section uppercase tracking-wide">
                  Get new pieces
                  <br />
                  in your inbox
                </h2>
                <p className="mt-3 text-[14.5px] leading-[1.6] text-cream/60">
                  Roughly one piece a month. No brand fluff — just the craft, the
                  city and the numbers.
                </p>
              </div>
              <NewsletterForm dark buttonLabel="Subscribe" source="blog" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
