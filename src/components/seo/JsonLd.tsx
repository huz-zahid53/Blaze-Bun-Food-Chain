import { brand } from "@/config/brand";
import { branches } from "@/data/branches";

/** Structured data for rich results (Restaurant schema). */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: brand.name,
    description: brand.voice,
    servesCuisine: ["Burgers", "Grilled Chicken", "Wings", "Fast Food"],
    priceRange: "$$",
    telephone: brand.phone,
    email: brand.email,
    url: "https://blazeandbun.pk",
    openingHours: "Mo-Su 12:00-03:00",
    address: branches.map((b) => ({
      "@type": "PostalAddress",
      streetAddress: b.address,
      addressLocality: b.city,
      addressCountry: "PK",
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "24118",
    },
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
