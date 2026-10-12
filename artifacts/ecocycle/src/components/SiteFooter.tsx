import { ArrowUpRight, Leaf } from 'lucide-react';
import { Link } from 'wouter';

export function SiteFooter() {
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim();

  return (
    <footer className="border-t border-white/[0.07] bg-[#080f1a]">
      <div className="site-shell grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:py-16">
        <div>
          <Link href="/" className="mb-4 inline-flex items-center gap-3" data-testid="link-footer-brand">
            <span className="grid size-9 place-items-center rounded-xl border border-cyan-200/20 bg-cyan-200/[0.08] text-[#82eee5]"><Leaf size={18} /></span>
            <span className="font-extrabold tracking-[-0.04em] text-slate-100">EcoCycle</span>
          </Link>
          <p className="max-w-sm text-sm leading-6 text-slate-400">A clearer path from the things we throw away to the materials we can use again.</p>
          <p className="mt-5 font-mono text-[0.67rem] uppercase tracking-[0.12em] text-slate-600">A more circular everyday.</p>
        </div>
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Explore</p>
          <div className="flex flex-col items-start gap-3 text-sm text-slate-300">
            <a href="/#materials" className="hover:text-cyan-200">Accepted materials</a>
            <a href="/#how-it-works" className="hover:text-cyan-200">How it works</a>
            <a href="/#why-ecocycle" className="hover:text-cyan-200">Our approach</a>
          </div>
        </div>
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Your EcoCycle</p>
          <div className="flex flex-col items-start gap-3 text-sm text-slate-300">
            <Link href="/register" className="inline-flex items-center gap-1 hover:text-cyan-200" data-testid="link-footer-register">Create an account <ArrowUpRight size={13} /></Link>
            <Link href="/login" className="hover:text-cyan-200" data-testid="link-footer-login">Sign in</Link>
          </div>
        </div>
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Contact</p>
          {supportEmail ? (
            <a className="break-all text-sm text-slate-300 transition hover:text-cyan-200" href={`mailto:${supportEmail}`} data-testid="link-footer-contact">{supportEmail}</a>
          ) : (
            <p className="max-w-[220px] text-sm leading-6 text-slate-500" data-testid="text-footer-contact-pending">Support contact details have not been configured yet.</p>
          )}
        </div>
      </div>
      <div className="site-shell flex flex-col gap-2 border-t border-white/[0.06] py-5 text-[0.72rem] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} EcoCycle. Materials deserve another life.</span>
        <span>Built around trust, transparency, and responsible reuse.</span>
      </div>
    </footer>
  );
}
