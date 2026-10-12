import { cn } from "@/lib/utils";

export type Glyph =
  | "burger"
  | "chicken"
  | "wing"
  | "bucket"
  | "fries"
  | "drink"
  | "dessert";

/** Deterministic palette from a hue, so every item gets its own look. */
function palette(hue: number) {
  return {
    main: `hsl(${hue} 78% 54%)`,
    deep: `hsl(${hue} 68% 36%)`,
    light: `hsl(${hue} 88% 70%)`,
    wash: `hsl(${hue} 62% 90%)`,
    bun: `hsl(32 58% 62%)`,
    bunDeep: `hsl(28 52% 47%)`,
    leaf: `hsl(116 42% 47%)`,
    cheese: `hsl(44 92% 60%)`,
    patty: `hsl(16 44% 33%)`,
    bone: `#FFF6EC`,
  };
}

interface Props {
  glyph: Glyph;
  hue: number;
  className?: string;
  title?: string;
}

/**
 * Generative flat-vector food artwork.
 * Used in place of photography so every menu item always has
 * distinctive, on-brand artwork with zero external assets.
 */
export function FoodGlyph({ glyph, hue, className, title }: Props) {
  const c = palette(hue);

  return (
    <svg
      viewBox="0 0 200 160"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={title ?? glyph}
    >
      {title ? <title>{title}</title> : null}

      {/* ---------------- BURGER ---------------- */}
      {glyph === "burger" && (
        <g>
          <ellipse cx="100" cy="140" rx="66" ry="9" fill="#100E0C" opacity="0.07" />
          {/* bottom bun */}
          <path
            d="M32 112h136v9c0 13-13 21-32 21H64c-19 0-32-8-32-21v-9Z"
            fill={c.bun}
          />
          {/* patty */}
          <rect x="28" y="94" width="144" height="20" rx="10" fill={c.patty} />
          {/* cheese drips */}
          <path
            d="M30 92h140l-7 20-13-8-14 11-15-11-15 11-15-11-14 8-13-8-14 8Z"
            fill={c.cheese}
          />
          {/* lettuce */}
          <path
            d="M26 80q13 13 26 0t26 0 26 0 26 0 26 0v13H26Z"
            fill={c.leaf}
          />
          {/* top bun */}
          <path
            d="M28 80C28 42 60 18 100 18s72 24 72 62c0 4-3 6-7 6H35c-4 0-7-2-7-6Z"
            fill={c.bun}
          />
          <path
            d="M28 80C28 42 60 18 100 18c10 0 19 1 28 4C92 26 62 50 60 86H35c-4 0-7-2-7-6Z"
            fill={c.bunDeep}
            opacity="0.45"
          />
          {/* sesame */}
          <g fill={c.bone} opacity="0.95">
            <ellipse cx="70" cy="52" rx="4.4" ry="2.9" transform="rotate(-18 70 52)" />
            <ellipse cx="100" cy="42" rx="4.4" ry="2.9" />
            <ellipse cx="130" cy="52" rx="4.4" ry="2.9" transform="rotate(18 130 52)" />
            <ellipse cx="86" cy="66" rx="4.4" ry="2.9" transform="rotate(-8 86 66)" />
            <ellipse cx="116" cy="66" rx="4.4" ry="2.9" transform="rotate(8 116 66)" />
          </g>
        </g>
      )}

      {/* ---------------- CHICKEN ---------------- */}
      {glyph === "chicken" && (
        <g>
          <ellipse cx="92" cy="140" rx="58" ry="9" fill="#100E0C" opacity="0.07" />
          {/* bone */}
          <g transform="rotate(-36 138 84)">
            <rect x="122" y="72" width="60" height="24" rx="12" fill={c.bone} />
            <circle cx="124" cy="70" r="13" fill={c.bone} />
            <circle cx="124" cy="98" r="13" fill={c.bone} />
          </g>
          {/* meat */}
          <ellipse cx="90" cy="92" rx="54" ry="48" fill={c.main} />
          <ellipse cx="78" cy="78" rx="30" ry="24" fill={c.light} opacity="0.6" />
          <ellipse cx="90" cy="92" rx="54" ry="48" fill="none" stroke={c.deep} strokeWidth="3" />
          {/* char marks */}
          <g stroke={c.deep} strokeWidth="5" strokeLinecap="round" opacity="0.65">
            <path d="M58 76l26 16" />
            <path d="M76 62l30 20" />
            <path d="M62 104l34-8" />
            <path d="M88 118l22-22" />
          </g>
        </g>
      )}

      {/* ---------------- WING ---------------- */}
      {glyph === "wing" && (
        <g>
          <ellipse cx="96" cy="140" rx="60" ry="9" fill="#100E0C" opacity="0.07" />
          {/* bone */}
          <g transform="rotate(24 52 104)">
            <rect x="20" y="94" width="52" height="22" rx="11" fill={c.bone} />
            <circle cx="24" cy="94" r="12" fill={c.bone} />
            <circle cx="24" cy="116" r="12" fill={c.bone} />
          </g>
          {/* wing body */}
          <path
            d="M70 132c-22 0-38-15-38-35 0-24 26-44 52-44 22 0 38 14 38 33 0 27-20 46-52 46Z"
            fill={c.main}
          />
          <path
            d="M84 128c16 0 28-12 28-28 0-14-10-24-24-24-16 0-30 12-30 28 0 15 11 24 26 24Z"
            fill={c.light}
            opacity="0.55"
          />
          {/* sauce drips */}
          <path
            d="M60 96c14 6 44 8 66-2-8 20-34 30-56 26-8-2-12-12-10-24Z"
            fill={c.deep}
            opacity="0.55"
          />
          <g fill={c.bone} opacity="0.9">
            <circle cx="82" cy="72" r="3.4" />
            <circle cx="104" cy="66" r="3" />
            <circle cx="118" cy="82" r="2.6" />
          </g>
        </g>
      )}

      {/* ---------------- BUCKET ---------------- */}
      {glyph === "bucket" && (
        <g>
          <ellipse cx="100" cy="146" rx="62" ry="9" fill="#100E0C" opacity="0.07" />
          {/* handle */}
          <path
            d="M56 62C56 36 144 36 144 62"
            fill="none"
            stroke={c.deep}
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* chicken poking out */}
          <g fill={c.bun}>
            <ellipse cx="76" cy="52" rx="17" ry="13" transform="rotate(-16 76 52)" />
            <ellipse cx="104" cy="44" rx="18" ry="14" transform="rotate(6 104 44)" />
            <ellipse cx="130" cy="54" rx="16" ry="12" transform="rotate(18 130 54)" />
          </g>
          <g stroke={c.bunDeep} strokeWidth="3" strokeLinecap="round" opacity="0.7">
            <path d="M68 50l16 4" />
            <path d="M96 42l16 3" />
            <path d="M124 54l13-2" />
          </g>
          {/* body */}
          <path
            d="M44 62h112l-9 74c-1 8-8 14-16 14H69c-8 0-15-6-16-14L44 62Z"
            fill={c.main}
          />
          <path
            d="M44 62h34l-4 74c0 8-5 14-11 14H69c-8 0-15-6-16-14L44 62Z"
            fill={c.light}
            opacity="0.35"
          />
          <rect x="36" y="54" width="128" height="16" rx="8" fill={c.deep} />
          {/* label */}
          <rect x="66" y="88" width="68" height="34" rx="8" fill={c.bone} opacity="0.92" />
          <g fill={c.deep}>
            <rect x="78" y="98" width="44" height="5" rx="2.5" />
            <rect x="78" y="108" width="30" height="5" rx="2.5" />
          </g>
        </g>
      )}

      {/* ---------------- FRIES ---------------- */}
      {glyph === "fries" && (
        <g>
          <ellipse cx="100" cy="146" rx="56" ry="9" fill="#100E0C" opacity="0.07" />
          {/* fries */}
          <g fill={c.cheese}>
            <rect x="62" y="28" width="15" height="66" rx="7" transform="rotate(-11 62 28)" />
            <rect x="80" y="20" width="15" height="74" rx="7" transform="rotate(-4 80 20)" />
            <rect x="98" y="16" width="15" height="78" rx="7" />
            <rect x="116" y="22" width="15" height="72" rx="7" transform="rotate(5 116 22)" />
            <rect x="132" y="32" width="15" height="62" rx="7" transform="rotate(12 132 32)" />
          </g>
          {/* carton */}
          <path
            d="M56 66h96l-8 66c-1 8-8 14-16 14H80c-8 0-15-6-16-14L56 66Z"
            fill={c.main}
          />
          <path
            d="M56 66h30l-4 66c0 8-5 14-11 14H80c-8 0-15-6-16-14L56 66Z"
            fill={c.light}
            opacity="0.4"
          />
          <rect x="50" y="58" width="108" height="15" rx="7" fill={c.deep} />
          {/* seasoning */}
          <g fill={c.deep} opacity="0.8">
            <circle cx="80" cy="104" r="3" />
            <circle cx="100" cy="96" r="2.6" />
            <circle cx="120" cy="108" r="3.2" />
            <circle cx="92" cy="120" r="2.4" />
            <circle cx="112" cy="126" r="2.8" />
          </g>
        </g>
      )}

      {/* ---------------- DRINK ---------------- */}
      {glyph === "drink" && (
        <g>
          <ellipse cx="100" cy="148" rx="46" ry="8" fill="#100E0C" opacity="0.07" />
          {/* straw */}
          <rect
            x="120"
            y="6"
            width="11"
            height="56"
            rx="5.5"
            fill={c.leaf}
            transform="rotate(16 120 6)"
          />
          {/* cup */}
          <path
            d="M62 52h76l-9 84c-1 7-7 12-14 12H85c-7 0-13-5-14-12L62 52Z"
            fill={c.main}
          />
          <path
            d="M62 52h24l-4 84c0 7-4 12-9 12h-2c-7 0-13-5-14-12L62 52Z"
            fill={c.light}
            opacity="0.4"
          />
          {/* liquid line + ice */}
          <g fill={c.bone} opacity="0.55">
            <rect x="70" y="72" width="16" height="16" rx="4" transform="rotate(-14 70 72)" />
            <rect x="94" y="84" width="18" height="18" rx="4" transform="rotate(12 94 84)" />
            <rect x="112" y="66" width="15" height="15" rx="4" transform="rotate(20 112 66)" />
            <rect x="86" y="108" width="16" height="16" rx="4" transform="rotate(-8 86 108)" />
          </g>
          {/* lid */}
          <rect x="54" y="38" width="92" height="16" rx="8" fill={c.deep} />
          <rect x="60" y="30" width="80" height="10" rx="5" fill={c.deep} opacity="0.7" />
          {/* condensation */}
          <g fill={c.bone} opacity="0.65">
            <circle cx="80" cy="118" r="3.4" />
            <circle cx="122" cy="104" r="3" />
            <circle cx="98" cy="132" r="2.6" />
          </g>
        </g>
      )}

      {/* ---------------- DESSERT ---------------- */}
      {glyph === "dessert" && (
        <g>
          <ellipse cx="100" cy="150" rx="42" ry="8" fill="#100E0C" opacity="0.07" />
          {/* glass stem */}
          <rect x="94" y="112" width="12" height="26" fill={c.wash} />
          <ellipse cx="100" cy="142" rx="28" ry="7" fill={c.wash} />
          {/* glass bowl */}
          <path
            d="M64 70h72l-13 46c-3 8-12 14-23 14s-20-6-23-14L64 70Z"
            fill={c.wash}
          />
          <path
            d="M72 84h56l-9 30c-2 6-9 10-19 10s-17-4-19-10L72 84Z"
            fill={c.main}
            opacity="0.85"
          />
          {/* scoops */}
          <circle cx="80" cy="62" r="22" fill={c.main} />
          <circle cx="120" cy="62" r="22" fill={c.main} />
          <circle cx="100" cy="42" r="25" fill={c.light} />
          <circle cx="90" cy="34" r="9" fill={c.bone} opacity="0.35" />
          {/* drizzle */}
          <path
            d="M84 56c8 8 24 8 32 0 4 12-4 22-16 22s-20-10-16-22Z"
            fill={c.deep}
            opacity="0.6"
          />
          {/* cherry */}
          <circle cx="100" cy="14" r="9" fill="#E11D48" />
          <path
            d="M100 6c4-6 12-8 18-6"
            fill="none"
            stroke={c.leaf}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* sprinkles */}
          <g fill={c.bone}>
            <rect x="76" y="58" width="9" height="4" rx="2" transform="rotate(24 76 58)" />
            <rect x="112" y="70" width="9" height="4" rx="2" transform="rotate(-18 112 70)" />
            <rect x="98" y="30" width="9" height="4" rx="2" transform="rotate(8 98 30)" />
          </g>
        </g>
      )}
    </svg>
  );
}
