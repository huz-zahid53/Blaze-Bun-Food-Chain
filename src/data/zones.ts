import type { Branch } from "./branches";

/**
 * DELIVERY ZONES
 * ---------------
 * Serviceable neighbourhoods, each mapped to the branch that fulfils delivery
 * for it. Like `src/data/branches.ts`, this is seed configuration that ships
 * with the app until a city/zone management system exists in the database.
 *
 * The order flow treats this as the single source of truth for "can we deliver
 * here?". The delivery modal only ever offers zones defined here, /api/orders
 * re-checks the zone against this list server-side, and `zoneId` is what gets
 * persisted — never a display name — so a rename can't silently break an order.
 */
export interface DeliveryZone {
  id: string;
  city: string;
  /** Customer-facing area / landmark name. */
  area: string;
  /** Branch that cooks and dispatches delivery for this zone. */
  branchId: string;
  /** Indicative delivery time in minutes for this zone. */
  eta: number;
}

export const deliveryZones: DeliveryZone[] = [
  /* ----------------------------- Karachi ----------------------------- */
  { id: "z-khi-2-minute-chowrangi", city: "Karachi", area: "2 Minute Chowrangi", branchId: "bb-bahadurabad-karachi", eta: 27 },
  { id: "z-khi-bahadurabad", city: "Karachi", area: "Bahadurabad", branchId: "bb-bahadurabad-karachi", eta: 26 },
  { id: "z-khi-pechs", city: "Karachi", area: "PECHS", branchId: "bb-bahadurabad-karachi", eta: 29 },
  { id: "z-khi-saddar", city: "Karachi", area: "Saddar", branchId: "bb-bahadurabad-karachi", eta: 31 },
  { id: "z-khi-gulshan", city: "Karachi", area: "Gulshan-e-Iqbal", branchId: "bb-gulshan-karachi", eta: 31 },
  { id: "z-khi-north-nazimabad", city: "Karachi", area: "North Nazimabad", branchId: "bb-gulshan-karachi", eta: 33 },
  { id: "z-khi-dha-phase-vi", city: "Karachi", area: "DHA Phase VI", branchId: "bb-dha-karachi", eta: 28 },
  { id: "z-khi-clifton", city: "Karachi", area: "Clifton Block 4", branchId: "bb-clifton-karachi", eta: 34 },

  /* ------------------------------ Lahore ----------------------------- */
  { id: "z-lhr-mm-alam", city: "Lahore", area: "MM Alam Road", branchId: "bb-mmalam-lahore", eta: 30 },
  { id: "z-lhr-gulberg", city: "Lahore", area: "Gulberg III", branchId: "bb-mmalam-lahore", eta: 32 },
  { id: "z-lhr-model-town", city: "Lahore", area: "Model Town", branchId: "bb-mmalam-lahore", eta: 34 },
  { id: "z-lhr-dha-phase-5", city: "Lahore", area: "DHA Phase 5", branchId: "bb-dha-lahore", eta: 36 },
  { id: "z-lhr-johar-town", city: "Lahore", area: "Johar Town", branchId: "bb-johar-lahore", eta: 33 },
  { id: "z-lhr-wapda-town", city: "Lahore", area: "Wapda Town", branchId: "bb-johar-lahore", eta: 35 },

  /* ---------------------------- Islamabad ---------------------------- */
  { id: "z-isb-f7-markaz", city: "Islamabad", area: "F-7 Markaz", branchId: "bb-f7-islamabad", eta: 29 },
  { id: "z-isb-blue-area", city: "Islamabad", area: "Blue Area", branchId: "bb-f7-islamabad", eta: 31 },
  { id: "z-isb-dha-2", city: "Islamabad", area: "DHA Phase II", branchId: "bb-giga-islamabad", eta: 35 },
  { id: "z-isb-bahria-town", city: "Islamabad", area: "Bahria Town", branchId: "bb-giga-islamabad", eta: 38 },

  /* ---------------------------- Rawalpindi --------------------------- */
  { id: "z-rwp-saddar", city: "Rawalpindi", area: "Saddar", branchId: "bb-saddar-rawalpindi", eta: 32 },
  { id: "z-rwp-satellite-town", city: "Rawalpindi", area: "Satellite Town", branchId: "bb-saddar-rawalpindi", eta: 34 },
  { id: "z-rwp-bahria-ph4", city: "Rawalpindi", area: "Bahria Town Phase 4", branchId: "bb-saddar-rawalpindi", eta: 37 },

  /* ---------------------------- Faisalabad --------------------------- */
  { id: "z-fsd-kohinoor", city: "Faisalabad", area: "Kohinoor City", branchId: "bb-kohinoor-faisalabad", eta: 30 },
  { id: "z-fsd-d-ground", city: "Faisalabad", area: "D Ground", branchId: "bb-kohinoor-faisalabad", eta: 32 },
  { id: "z-fsd-peoples-colony", city: "Faisalabad", area: "People's Colony", branchId: "bb-kohinoor-faisalabad", eta: 34 },

  /* ------------------------------ Multan ----------------------------- */
  { id: "z-mux-cantt", city: "Multan", area: "Cantt", branchId: "bb-cantt-multan", eta: 34 },
  { id: "z-mux-gulgasht", city: "Multan", area: "Gulgasht Colony", branchId: "bb-cantt-multan", eta: 33 },
  { id: "z-mux-shah-rukn", city: "Multan", area: "Shah Rukn-e-Alam", branchId: "bb-cantt-multan", eta: 36 },
];

/** Delivery zones in a city, in the order they're offered. */
export const zonesByCity = (city: string) =>
  deliveryZones.filter((z) => z.city === city);

/** Zones fulfilled by a given branch (used for geolocation + revalidation). */
export const zonesByBranch = (branchId: string) =>
  deliveryZones.filter((z) => z.branchId === branchId);

/** Look up a zone by id; `null` for unknown or retired ids. */
export const findZone = (id: string | null | undefined): DeliveryZone | null =>
  id ? deliveryZones.find((z) => z.id === id) ?? null : null;

/** Branch record for a zone, or `undefined` if the branch was removed. */
export const branchForZone = (
  id: string | null | undefined,
  branches: Branch[],
): Branch | undefined => {
  const zone = findZone(id);
  return zone ? branches.find((b) => b.id === zone.branchId) : undefined;
};
