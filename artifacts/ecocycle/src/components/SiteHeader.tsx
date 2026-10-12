import { ArrowUpRight, Leaf, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a1220]/85 backdrop-blur-xl">
      <div className="site-shell flex h-[76px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3" data-testid="link-home-brand">
          <span className="grid size-10 place-items-center rounded-xl border border-cyan-200/20 bg-cyan-200/[0.08] text-[#82eee5]">
            <Leaf size={19} strokeWidth={1.8} />
          </span>
          <span className="text-[1.07rem] font-extrabold tracking-[-0.04em] text-slate-100">EcoCycle</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          <a className="text-sm text-slate-300 transition hover:text-cyan-200" href="/#materials">Materials</a>
          <a className="text-sm text-slate-300 transition hover:text-cyan-200" href="/#how-it-works">How it works</a>
          <a className="text-sm text-slate-300 transition hover:text-cyan-200" href="/#why-ecocycle">Why EcoCycle</a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="px-3 py-2 text-sm font-semibold text-slate-300 transition hover:text-white" data-testid="link-login">Log in</Link>
          <Link href="/register" className="button-primary !min-h-10 !px-4 text-xs" data-testid="link-register">Create account <ArrowUpRight size={15} /></Link>
        </div>

        <button className="grid size-10 place-items-center rounded-xl border border-white/10 text-slate-200 md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)} data-testid="button-mobile-menu">
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/[0.07] bg-[#0a1220] px-5 py-5 md:hidden">
          <nav className="mx-auto flex max-w-lg flex-col gap-4" aria-label="Mobile navigation">
            <a className="py-1 text-sm text-slate-200" href="/#materials" onClick={() => setMenuOpen(false)}>Materials</a>
            <a className="py-1 text-sm text-slate-200" href="/#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
            <a className="py-1 text-sm text-slate-200" href="/#why-ecocycle" onClick={() => setMenuOpen(false)}>Why EcoCycle</a>
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="button-secondary flex-1 !min-h-11" onClick={() => setMenuOpen(false)} data-testid="link-mobile-login">Log in</Link>
              <Link href="/register" className="button-primary flex-1 !min-h-11" onClick={() => setMenuOpen(false)} data-testid="link-mobile-register">Create account</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
