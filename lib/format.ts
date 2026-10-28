/** Deterministic LKR formatting (identical on server & client). */
export function formatPrice(value: number) {
  const n = Math.round(value);
  return `Rs. ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
