import { ArrowUpRight, Leaf } from 'lucide-react';
import { Link } from 'wouter';

export function SiteFooter() {
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim();

  return (
    <footer className="bg-[#193a29] text-[#eef0e5]">
      <div className="site-shell grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:py-14">
        <div>
          <Link href="/" className="mb-4 inline-flex items-center gap-2.5" data-testid="link-footer-brand">
            <span className="grid size-9 place-items-center border border-[#b7c6a7]/35 text-[#d7dbb8]"><Leaf size={18} /></span>
            <span className="font-bold tracking-[-0.04em]">EcoCycle</span>
          </Link>
          <p className="max-w-sm text-sm leading-6 text-[#c5d0c2]">A practical first step toward giving everyday materials a more responsible route.</p>
          <p className="mt-5 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-[#a6b8a5]">Keep useful things in use.</p>
        </div>
        <div>
          <p className="mb-4 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#bdc8a9]">Explore</p>
          <div className="flex flex-col items-start gap-3 text-sm text-[#e0e6d9]">
            <a href="/#how-it-works" className="transition-colors hover:text-[#e7bd70]">How It Works</a>
            <a href="/#materials" className="transition-colors hover:text-[#e7bd70]">Waste Categories</a>
            <a href="/#about" className="transition-colors hover:text-[#e7bd70]">About EcoCycle</a>
          </div>
        </div>
        <div>
          <p className="mb-4 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#bdc8a9]">Your EcoCycle</p>
          <div className="flex flex-col items-start gap-3 text-sm text-[#e0e6d9]">
            <Link href="/register" className="inline-flex items-center gap-1 transition-colors hover:text-[#e7bd70]" data-testid="link-footer-register">Get started <ArrowUpRight size={13} /></Link>
            <Link href="/login" className="transition-colors hover:text-[#e7bd70]" data-testid="link-footer-login">Sign in</Link>
          </div>
        </div>
        <div>
          <p className="mb-4 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#bdc8a9]">Contact</p>
          {supportEmail ? (
            <a className="break-all text-sm text-[#e0e6d9] transition-colors hover:text-[#e7bd70]" href={`mailto:${supportEmail}`} data-testid="link-footer-contact">{supportEmail}</a>
          ) : (
            <p className="max-w-[220px] text-sm leading-6 text-[#bdc8a9]" data-testid="text-footer-contact-pending">Support contact details have not been configured yet.</p>
          )}
        </div>
      </div>
      <div className="site-shell flex flex-col gap-2 border-t border-white/15 py-5 text-[0.7rem] text-[#bdc8a9] sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} EcoCycle. Materials deserve another life.</span>
        <span>Trust, transparency, responsible reuse.</span>
      </div>
    </footer>
  );
}
