import type { BusinessProfile } from "@/types";

export const BUSINESSES: BusinessProfile[] = [
  {
    id: "contoso-retail",
    name: "Contoso Retail",
    tagline: "Omnichannel retail & loyalty",
    industry: "Retail",
    size: "enterprise",
    region: "North America & EU",
    currentProducts: [
      "E-commerce storefront",
      "Mobile app",
      "Loyalty program",
      "1,200 physical stores",
    ],
    strategicGoals: [
      "Grow digital revenue 25% YoY",
      "Unify online + in-store experience",
      "Lift loyalty engagement and basket size",
    ],
    description:
      "A global omnichannel retailer modernizing the shopping experience across web, mobile, and stores.",
    accent: "#0078D4",
  },
  {
    id: "fabrikam-financial",
    name: "Fabrikam Financial",
    tagline: "Digital banking & payments",
    industry: "Financial services",
    size: "enterprise",
    region: "Global",
    currentProducts: [
      "Retail banking app",
      "Cards & payments",
      "Wealth dashboard",
      "Business banking portal",
    ],
    strategicGoals: [
      "Reduce fraud losses and false declines",
      "Improve digital onboarding conversion",
      "Deepen primary-bank relationships",
    ],
    description:
      "A regulated digital bank focused on trustworthy, fast, and personalized money experiences.",
    accent: "#6B69D6",
  },
  {
    id: "northwind-logistics",
    name: "Northwind Logistics",
    tagline: "Supply chain & fulfillment",
    industry: "Logistics",
    size: "enterprise",
    region: "Global",
    currentProducts: [
      "Freight TMS",
      "Warehouse management",
      "Last-mile tracking",
      "Carrier marketplace",
    ],
    strategicGoals: [
      "Cut delivery exceptions and dwell time",
      "Improve on-time-in-full (OTIF)",
      "Offer predictive visibility to shippers",
    ],
    description:
      "A global logistics operator turning supply-chain data into reliable, predictive fulfillment.",
    accent: "#038387",
  },
];

export const BUSINESS_MAP: Record<string, BusinessProfile> = BUSINESSES.reduce(
  (acc, b) => {
    acc[b.id] = b;
    return acc;
  },
  {} as Record<string, BusinessProfile>,
);
