import { Link, type To } from "react-router";

type LinkWithLabel = {
  to: To;
  label: string;
};

const NAV_LINKS: LinkWithLabel[] = [
  { to: "/",         label: "Feed"    },
  { to: "/register", label: "Join"    },
  { to: "/login",    label: "Sign in" },
];

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border mt-24">
      <div className="page-wrapper py-10 flex flex-col sm:flex-row items-center justify-between gap-6">

        <div className="flex flex-col items-center sm:items-start gap-1">
          <Link to="/" className="brand-name text-lg">Z-Tales</Link>
          <p className="meta-text uppercase tracking-widest fine-text">
            A sanctuary for the literate mind
          </p>
        </div>

        <nav className="flex items-center gap-6">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={label}
              to={to}
              className="font-sans text-xs text-muted hover:text-accent transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="meta-text fine-text">
          &copy; {new Date().getFullYear()} Z-Tales. All rights reserved.
        </p>

      </div>
    </footer>
  );
};

export default Footer;