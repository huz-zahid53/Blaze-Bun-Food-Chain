import { cn } from "@/lib/utils";

/**
 * Minimal line-art landmark marks for the city picker. Deliberately flat and
 * single-colour so each tile inherits the card's text colour (charcoal, or
 * ember when selected) and stays crisp at small sizes. Decorative — the city
 * name beside it carries the meaning, so the mark is aria-hidden.
 */
export function CityGlyph({
  city,
  className,
}: {
  city: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-full w-full", className)}
    >
      {marks(city)}
    </svg>
  );
}

function marks(city: string) {
  switch (city) {
    /* Quaid's mausoleum */
    case "Karachi":
      return (
        <>
          <path d="M7 40h34" />
          <path d="M12 40V27c0-6.6 5.4-11 12-11s12 4.4 12 11v13" />
          <path d="M24 16V9" />
          <circle cx="24" cy="7" r="2" />
          <path d="M20 40v-7a4 4 0 0 1 8 0v7" />
        </>
      );
    /* Minar-e-Pakistan */
    case "Lahore":
      return (
        <>
          <path d="M8 41h32" />
          <path d="M19 41l2.5-20h5L29 41" />
          <path d="M21.5 21c0-4.5 1-7 2.5-10 1.5 3 2.5 5.5 2.5 10" />
          <path d="M16 41c-2.4-1.6-3.4-3.6-2.6-6M32 41c2.4-1.6 3.4-3.6 2.6-6" />
          <circle cx="24" cy="6" r="1.7" />
        </>
      );
    /* Faisal Mosque */
    case "Islamabad":
      return (
        <>
          <path d="M6 41h36" />
          <path d="M14 41l10-19 10 19z" />
          <path d="M10 41V27M38 41V27" />
          <path d="M10 25v-2M38 25v-2" />
        </>
      );
    /* Clock tower */
    case "Rawalpindi":
      return (
        <>
          <path d="M8 41h32" />
          <path d="M17 41V16h14v25" />
          <path d="M14 16h20" />
          <path d="M21 16V9h6v7" />
          <circle cx="24" cy="27" r="4" />
          <path d="M24 25v2.5l1.8 1" />
        </>
      );
    /* Spinning wheel — the "Manchester of Pakistan" */
    case "Faisalabad":
      return (
        <>
          <path d="M8 41h32" />
          <circle cx="24" cy="25" r="10" />
          <path d="M24 15v20M14 25h20M17 18l14 14M31 18L17 32" />
          <path d="M24 40v3" />
        </>
      );
    /* Shah Rukn-e-Alam tomb */
    case "Multan":
      return (
        <>
          <path d="M7 41h34" />
          <path d="M13 41V29c0-6.2 4.9-10.5 11-10.5S35 22.8 35 29v12" />
          <path d="M24 18.5V13" />
          <circle cx="24" cy="10.5" r="2.2" />
          <path d="M20 41v-6a4 4 0 0 1 8 0v6" />
        </>
      );
    /* Historic gateway */
    case "Peshawar":
      return (
        <>
          <path d="M8 41h32" />
          <path d="M12 41V17h24v24" />
          <path d="M20 41V29a4 4 0 0 1 8 0v12" />
          <path d="M12 17h24" />
          <path d="M20 17v-3h8v3" />
        </>
      );
    /* Mountains */
    case "Quetta":
      return (
        <>
          <path d="M6 38h36" />
          <path d="M6 38l9-16 6 8 5-12 8 20" />
          <circle cx="35" cy="12" r="3" />
        </>
      );
    default:
      return (
        <>
          <path d="M8 41h32" />
          <path d="M11 41V22h10v19M27 41V26h10v15" />
          <path d="M15 27h2M15 33h2M31 31h2M31 36h2" />
        </>
      );
  }
}
