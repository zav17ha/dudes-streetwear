import { site } from "./site";
import { formatPrice } from "./format";
import type { CartItem } from "./types";

export type CustomerDetails = {
  name?: string;
  phone?: string;
  address?: string;
  note?: string;
};

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

function itemLine(item: CartItem, index: number, origin?: string) {
  const options = [item.size && `Size: ${item.size}`, item.color && `Colour: ${item.color}`]
    .filter(Boolean)
    .join(" | ");
  const lines = [
    `${index + 1}. *${item.name}*`,
    options ? `   ${options}` : null,
    `   Qty: ${item.qty} × ${formatPrice(item.price)} = ${formatPrice(item.qty * item.price)}`,
    origin ? `   ${origin}/product/${item.slug}` : null,
  ];
  return lines.filter(Boolean).join("\n");
}

export function buildOrderMessage(items: CartItem[], customer: CustomerDetails = {}, origin?: string) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const details = [
    customer.name && `Name: ${customer.name}`,
    customer.phone && `Phone: ${customer.phone}`,
    customer.address && `Delivery address: ${customer.address}`,
    customer.note && `Note: ${customer.note}`,
  ].filter(Boolean);

  return [
    `Hey DUDES! 🔥 I'd like to place an order:`,
    ``,
    ...items.map((item, i) => itemLine(item, i, origin)),
    ``,
    `Items: ${count}`,
    `*Subtotal: ${formatPrice(total)}* (+ delivery)`,
    ...(details.length ? [``, ...details] : []),
    ``,
    `Please confirm availability & delivery charges. Thanks!`,
  ].join("\n");
}

export function buildEnquiryMessage(productName: string, url?: string) {
  return [`Hey DUDES! I have a question about the *${productName}*.`, url].filter(Boolean).join("\n");
}
