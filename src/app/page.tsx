import { Hero } from "@/components/home/Hero";
import { CategoryRail } from "@/components/home/CategoryRail";
import { BestSellers } from "@/components/home/BestSellers";
import { DealsShowcase } from "@/components/home/DealsShowcase";
import { HowItWorks } from "@/components/home/HowItWorks";
import { StoryStrip } from "@/components/home/StoryStrip";
import { MidnightStrip } from "@/components/home/MidnightStrip";
import { Testimonials } from "@/components/home/Testimonials";
import { RewardsBanner } from "@/components/home/RewardsBanner";
import { LocationsPreview } from "@/components/home/LocationsPreview";
import { JsonLd } from "@/components/seo/JsonLd";

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <Hero />
      <CategoryRail />
      <BestSellers />
      <DealsShowcase compact />
      <HowItWorks />
      <StoryStrip />
      <MidnightStrip />
      <Testimonials />
      <RewardsBanner />
      <LocationsPreview />
    </>
  );
}
