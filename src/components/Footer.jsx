import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, Linkedin, Mail, ShieldCheck, Twitter } from 'lucide-react';
import LightRays from './LightRays';
import { brand } from '../data/brand';
import { useAuth } from '../state/auth';
import { useToast } from '../state/toast';

const footerGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Dashboard', to: '/admin/dashboard', protected: true },
      { label: 'AI Lab', to: '/admin/ai-lab', protected: true },
      { label: 'Analytics', to: '/admin/analytics', protected: true },
      { label: 'Integrations', to: '/admin/integrations', protected: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/#platform' },
      { label: 'Security', to: '/#security' },
      { label: 'Contact', to: '#contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '#docs' },
      { label: 'Support', to: '#support' },
      { label: 'API', to: '#api' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '#privacy' },
      { label: 'Terms', to: '#terms' },
    ],
  },
];

const socialLinks = [
  { label: 'Github', icon: Github, to: '#github' },
  { label: 'LinkedIn', icon: Linkedin, to: '#linkedin' },
  { label: 'Twitter', icon: Twitter, to: '#twitter' },
  { label: 'Email', icon: Mail, to: `mailto:${brand.supportEmail}` },
];

function FooterLink({ to, protected: protectedRoute = false, children }) {
  const { isAuthed } = useAuth();
  const toast = useToast();
  const isAnchor = to.startsWith('#') || to.startsWith('mailto:');

  if (isAnchor) {
    return <a href={to} className="text-sm text-t-text-muted transition hover:text-t-text">{children}</a>;
  }
  if (protectedRoute && !isAuthed) {
    return (
      <Link to="/admin/login" state={{ from: to, protectedRedirect: true }}
        onClick={() => toast.info('Enterprise workspace locked', 'Please login to access the enterprise workspace.', { durationMs: 3200 })}
        className="text-sm text-t-text-muted transition hover:text-t-text">
        {children}
      </Link>
    );
  }
  return <Link to={to} className="text-sm text-t-text-muted transition hover:text-t-text">{children}</Link>;
}

export default function Footer() {
  return (
    <footer id="footer" className="relative overflow-hidden border-t border-t-border bg-t-bg">
      <LightRays
        raysOrigin="top-center"
        raysColor="var(--t-accent)"
        raysSpeed={0.8} lightSpread={0.7} rayLength={1.3} followMouse mouseInfluence={0.04}
        noiseAmount={0.03} distortion={0.02} pulsating fadeDistance={1.2} className="opacity-60"
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 0%, var(--t-bg) 80%)' }} />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-t-accent/50 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.6fr]">
          <div className="max-w-md">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-t-accent/40 bg-t-accent-subtle text-t-accent">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-black uppercase tracking-normal text-t-text">{brand.name}</span>
            </Link>
            <p className="mt-5 text-sm leading-6 text-t-text-muted">{brand.tagline} Built for teams that need sharper classification, faster routing, and calmer executive visibility.</p>
            <Link to="/signup"
              className="mt-7 inline-flex items-center gap-2 rounded-lg border border-t-accent/30 bg-t-accent-subtle px-4 py-2.5 font-display text-sm font-bold text-t-accent transition hover:border-t-accent hover:bg-t-accent-subtle hover:text-t-text">
              Request access <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
              <h3 className="label-caps text-t-text">{group.title}</h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink to={link.to} protected={link.protected}>
                        {link.label}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-t-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-t-text-muted">{brand.copyright}</p>
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.to} aria-label={social.label}
                className="grid h-9 w-9 place-items-center rounded-lg border border-t-border bg-t-panel text-t-text-muted transition hover:border-t-accent hover:bg-t-accent-subtle hover:text-t-accent">
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
