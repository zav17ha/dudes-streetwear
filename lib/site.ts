export const site = {
  name: "Dudes Streetwear",
  shortName: "DUDES",
  tagline: "Fashion Redefined",
  claim: "#1 Streetwear Brand in Sri Lanka",
  manifesto: "We aren't just dropping fits, we're buildin' the Biggest Community.",
  description:
    "Dudes Streetwear — the #1 streetwear brand in Sri Lanka. Oversized T-shirts built for the streets. Shop the latest drops and order straight from WhatsApp.",
  established: "1991",
  currency: "LKR",

  // WhatsApp number in international format, digits only (071 878 7087 → 94718787087)
  whatsapp: "94718787087",
  phoneDisplay: "071 878 7087",
  phoneHref: "tel:+94718787087",
  email: "thecomicdudelk@gmail.com",
  address: {
    line1: "211/b/26 Alotiyawa Road",
    city: "Bandaragama",
    postalCode: "12530",
    country: "Sri Lanka",
  },
  mapQuery: "211/b/26 Alotiyawa Road, Bandaragama 12530, Sri Lanka",

  socials: {
    instagram: "https://www.instagram.com/dudestreetwear_/",
    instagramHandle: "@dudestreetwear_",
    facebook: "https://web.facebook.com/dudesstreetwear",
  },
} as const;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
