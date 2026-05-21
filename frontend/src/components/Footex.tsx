import { Link, type To } from "react-router"

type LinkWithLabel = {
    to: To
    label: string
}

const Footer = () => {
    const linksWithLabels : LinkWithLabel[]  = [
          { to: '/',          label: 'Feed'    },
          { to: '/register',  label: 'Join'    },
          { to: '/login',     label: 'Sign in' },
        ]

    return (<footer className="bg-white border-t border-border mt-24">
            <div className="page-wrapper py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex-col items-center sm:items-start gap-1">
                    <Link to="/" className="brand-name text-lg">Z-tales</Link>
                    <p className="meta-text uppercase tracking-widest" style={{fontSize: "0.65rem"}}>A sanctuary for the literate mind</p>
                </div>

                <div className="flex items-center gap-6">
                    {linksWithLabels.map((link: LinkWithLabel)=>(
                        <Link key={link.label} to={link.to} className="font-sans text-xs text-muted hover:text-accent transition-colors duration-200">{link.label}</Link>
                    ))}
                </div>
                <p className="meta-text" style={{fontSize: "0.65rem"}}>
                    &copy; {new Date().getFullYear()} Z-tales. All rights reserved.
                </p>
            </div>
        </footer>
    )
}