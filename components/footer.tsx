import { site, waLink, telLink } from "@/lib/site";

const COLUMNS = [
  {
    head: "Explore",
    links: [
      { label: "Catalog", href: "#catalog" },
      { label: "Back to top", href: "#top" },
    ],
  },
  {
    head: "Contact",
    links: [
      { label: "WhatsApp", href: waLink() },
      { label: site.phone, href: telLink() },
      { label: site.email, href: `mailto:${site.email}` },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-paper pb-24 md:pb-0">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 md:grid-cols-[2fr_1fr_1fr_2fr] md:gap-8 md:px-8 md:py-16">
        <div>
          <img src="/logo.png" alt="Wangari" className="h-10 w-auto object-contain" />
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Thoughtful picks. Sustainable choices.
            <br />
            Gifts with pride — bamboo chargers, power
            <br />
            banks, and earbuds made in resonance with
            <br />
            Mother Earth.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.head}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {col.head}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                    className="text-sm text-ink transition-colors hover:text-ultra"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Get In Touch
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            <span className="font-medium text-ink">{site.owner}</span>
            <br />
            {site.address}
          </p>
        </div>
      </div>
      <div className="border-t border-hairline">
        <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-ink-soft md:px-8">
          &copy; {new Date().getFullYear()} {site.name}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
