import { Link } from "react-router-dom";

const icons = {
  email: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M6.94 8.5H3.56V20h3.38V8.5Zm.22-3.55c0-1.03-.77-1.85-1.91-1.85-1.14 0-1.91.82-1.91 1.85 0 1 .74 1.85 1.86 1.85h.02c1.17 0 1.94-.85 1.94-1.85ZM20.44 13.42c0-3.2-1.71-4.69-3.98-4.69-1.84 0-2.67 1.01-3.13 1.73V8.5h-3.38c.04 1.29 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.68.12-.93.27-.68.89-1.39 1.93-1.39 1.36 0 1.91 1.04 1.91 2.57V20h3.38v-6.58Z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.41-4.04-1.41-.55-1.38-1.34-1.75-1.34-1.75-1.1-.75.09-.74.09-.74 1.2.08 1.84 1.24 1.84 1.24 1.08 1.83 2.83 1.3 3.51.99.1-.78.43-1.3.78-1.6-2.66-.3-5.47-1.34-5.47-5.92 0-1.31.47-2.39 1.24-3.24-.13-.31-.54-1.55.12-3.24 0 0 1.01-.33 3.3 1.24a11.5 11.5 0 0 1 6 0c2.28-1.57 3.29-1.24 3.29-1.24.66 1.69.25 2.93.12 3.24.77.85 1.24 1.93 1.24 3.24 0 4.59-2.82 5.62-5.5 5.91.44.38.83 1.1.83 2.22v3.3c0 .32.21.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  ),
  portfolio: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="M9 5V4a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4v1" />
      <path d="M4 11h16" />
    </svg>
  )
};

const socialLinks = [
  {
    id: "email",
    href: "mailto:vishalgupta979204@gmail.com",
    label: "Email"
  },
  {
    id: "linkedin",
    href: "https://www.linkedin.com/in/vishal-gupta-913a55298",
    label: "LinkedIn"
  },
  {
    id: "github",
    href: "https://github.com/vishalgupta9792",
    label: "GitHub"
  },
  {
    id: "portfolio",
    href: "https://vishal-portfolio-mu-one.vercel.app",
    label: "Portfolio"
  }
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-slate-700 bg-slate-950/70 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-3">
        <div>
          <h3 className="text-xl font-bold text-emerald-400">AuctionAI</h3>
          <p className="mt-2 text-sm text-slate-400">
            Real-time online auction platform with AI bid insights, fraud detection, and smart dashboards.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-200">Quick Links</h4>
          <div className="grid gap-2 text-sm">
            <Link to="/" className="hover:text-emerald-300">Home</Link>
            <Link to="/live" className="hover:text-emerald-300">Live Auctions</Link>
            <Link to="/trending" className="hover:text-emerald-300">Trending</Link>
            <Link to="/sell" className="hover:text-emerald-300">Sell Item</Link>
            <Link to="/dashboard" className="hover:text-emerald-300">Dashboard</Link>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-200">Connect</h4>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                title={item.label}
                className="group rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-300 transition hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-300"
              >
                {icons[item.id]}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-3 text-center text-xs text-slate-500">
        {year} AuctionAI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
