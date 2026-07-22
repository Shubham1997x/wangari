export const site = {
  name: "Wangari",
  tagline: "Sustainable Innovations",
  owner: "Wangari Sustainable Innovations",
  phone: "+91 91674 72144",
  phoneDigits: "919167472144",
  email: "hello@wangariworld.com",
  address: "Seksaria Industrial Estate, Chincholi Bunder Rd, Mumbai, India",
  description:
    "Wangari makes eco-friendly, sustainable electronics — bamboo wireless chargers, power banks, and earbuds designed in resonance with Mother Earth.",
};

export function waLink(message?: string) {
  const base = `https://wa.me/${site.phoneDigits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function productWaLink(productName: string) {
  return waLink(
    `Hi Wangari, I'm interested in "${productName}". Could you share more details and pricing?`
  );
}

export function buildBulkWaLink(
  items: Array<{ name: string; qty: number; price: number | null; priceUnit: string }>
) {
  const lines = items.map(
    (item, i) =>
      `${i + 1}. ${item.name} — qty ${item.qty}${
        item.price != null ? ` (₹${item.price.toLocaleString("en-IN")}/${item.priceUnit})` : ""
      }`
  );
  return waLink(
    `Hi Wangari, I'd like a quote for:\n${lines.join("\n")}\n\nCould you share pricing and availability?`
  );
}

export function telLink() {
  return `tel:${site.phoneDigits}`;
}
