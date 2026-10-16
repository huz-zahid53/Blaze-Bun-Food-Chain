import type { Metadata } from "next";
import { ImageWithSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock } from "lucide-react";
import { posts, getPost } from "@/data/blog";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { Reveal } from "@/components/ui/Reveal";
import { NewsletterForm } from "@/components/ui/NewsletterForm";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const index = posts.findIndex((p) => p.slug === slug);
  const next = posts[(index + 1) % posts.length];

  return (
    <>
      <ReadingProgress />

      {/* Hero */}
<section className="relative isolate overflow-hidden bg-charcoal pt-12 text-cream sm:pt-24">
         <ImageWithSkeleton
           src={post.image ?? "/media/hero/hero-1.jpg"}
           alt=""
           aria-hidden
           fill
           sizes="100vw"
           style={{ objectPosition: "65% center" }}
           className="object-cover"
         />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/90 to-charcoal/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-charcoal/70" />
        <div className="absolute inset-0 bg-gradient-to-tr from-ember/18 via-transparent to-flame/10 mix-blend-overlay" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] grain" />

        <div className="relative mx-auto max-w-[820px] px-4 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[11.5px] font-black uppercase tracking-wider text-cream/55 transition-colors hover:text-ember"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={3} />
            All pieces
          </Link>

          <span className="mt-6 inline-block rounded-full bg-ember px-3.5 py-1.5 text-[10.5px] font-black uppercase tracking-wider text-white">
            {post.category}
          </span>

          <h1 className="t-page mt-4 uppercase tracking-wide">
            {post.title}
          </h1>

          <p className="t-lead mt-4 max-w-2xl text-cream/70">
            {post.excerpt}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5 text-[12.5px] font-semibold text-cream/60">
            <span className="flex items-center gap-3">
              <span
                className="grid h-11 w-11 place-items-center rounded-full font-display text-[15px] text-white"
                style={{ background: `hsl(${post.hue} 72% 45%)` }}
              >
                {post.author
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <span className="leading-tight">
                <span className="block font-bold text-cream">{post.author}</span>
                <span className="block text-[11.5px] text-cream/55">
                  {post.authorRole}
                </span>
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-ember" />
              {new Date(post.date).toLocaleDateString("en-PK", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-ember" />
              {post.readTime}
            </span>
          </div>
        </div>

        {/* Cover */}
        <div className="relative mx-auto mt-9 max-w-[1100px] px-4 sm:px-6">
<div className="overflow-hidden rounded-t-[30px]">
             {post.image ? (
               <ImageWithSkeleton
                 src={post.image}
                 alt={post.title}
                 width={1400}
                 height={780}
                 sizes="100vw"
                 className="h-[300px] w-full object-cover sm:h-[440px] lg:h-[560px]"
               />
             ) : (
              <div className="h-[300px] w-full bg-gradient-to-br from-ember to-flame sm:h-[440px]" />
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16">
        <div className="prose-blaze space-y-5 text-charcoal/85">
          {post.body.map((para, i) => (
            <Reveal key={i} delay={i * 0.03}>
              <p>{para}</p>
            </Reveal>
          ))}
        </div>

        {/* Pull quote */}
        <Reveal>
          <blockquote className="my-8 rounded-3xl border-l-4 border-ember bg-bone p-7 sm:p-9">
            <p className="t-section-sm uppercase tracking-wide text-charcoal">
              &ldquo;The boring, unglamorous, write-it-down-and-weigh-it work is
              the thing that actually compounds. The rest is just noise.&rdquo;
            </p>
            <footer className="mt-4 text-[12.5px] font-bold uppercase tracking-wider text-slate-brand">
              — {post.author}, {post.authorRole}
            </footer>
          </blockquote>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <div className="mt-8 rounded-3xl bg-charcoal p-7 text-cream sm:p-9">
            <h2 className="t-section-sm uppercase tracking-wide">
              Hungry yet?
            </h2>
            <p className="mt-2.5 text-[14px] leading-[1.6] text-cream/60">
              Everything you just read about is happening right now at a branch
              near you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="rounded-full bg-ember px-7 py-3.5 text-[12px] font-black uppercase tracking-wider text-white hover:bg-ember-dark"
              >
                Order now
              </Link>
              <Link
                href="/locations"
                className="rounded-full border-2 border-cream/25 px-7 py-3.5 text-[12px] font-black uppercase tracking-wider text-cream hover:border-cream hover:bg-cream/10"
              >
                Find a branch
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Next */}
        <Reveal>
          <Link
            href={`/blog/${next.slug}`}
            className="group mt-8 flex items-center justify-between gap-5 rounded-3xl border border-charcoal/10 bg-white p-6 transition-colors hover:border-ember"
          >
            <div>
              <p className="text-[10.5px] font-black uppercase tracking-[0.2em] text-slate-brand">
                Next up
              </p>
              <p className="mt-1.5 font-display text-2xl uppercase tracking-wide text-charcoal">
                {next.title}
              </p>
            </div>
            <ArrowRight
              className="h-5 w-5 shrink-0 text-ember transition-transform group-hover:translate-x-1"
              strokeWidth={3}
            />
          </Link>
        </Reveal>

        <div className="mt-8">
          <NewsletterForm buttonLabel="Subscribe" source="post" />
        </div>
      </article>
    </>
  );
}
