import { ArrowUpRight, Leaf, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import { useGetCurrentUser } from '@workspace/api-client-react';

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const account = useGetCurrentUser();
  const signedIn = Boolean(account.data?.user);
  const pickupHref = signedIn ? '/account' : '/register';
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Waste Categories', href: '/#materials' },
    { label: 'About', href: '/#about' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#e0e4d9] bg-[#f4f3e9]/95">
      <div className="site-shell flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" data-testid="link-home-brand">
          <span className="grid size-9 place-items-center bg-[#214b34] text-[#f5f0dc]">
            <Leaf size={18} strokeWidth={1.8} />
          </span>
          <span className="text-[1.08rem] font-bold tracking-[-0.045em] text-[#203c2d]">EcoCycle</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <a key={item.label} className="text-[0.83rem] font-semibold text-[#586a5e] transition-colors hover:text-[#214b34]" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href={signedIn ? '/account' : '/login'} className="text-sm font-semibold text-[#365440] transition-colors hover:text-[#182f21]" data-testid="link-login">
            {signedIn ? 'My account' : 'Log in'}
          </Link>
          <Link href={pickupHref} className="button-primary !min-h-10 !px-4 text-xs" data-testid="link-register">
            {signedIn ? 'Schedule a Pickup' : 'Get Started'} <ArrowUpRight size={14} />
          </Link>
        </div>

        <button
          className="grid size-10 place-items-center border border-[#cbd5c8] text-[#254333] md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          data-testid="button-mobile-menu"
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[#dce2d8] bg-[#f4f3e9] px-5 py-5 md:hidden">
          <nav className="mx-auto flex max-w-lg flex-col gap-3" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <a key={item.label} className="py-2 text-sm font-semibold text-[#365440]" href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <div className="flex gap-3 border-t border-[#dce2d8] pt-4">
              <Link href={signedIn ? '/account' : '/login'} className="button-secondary flex-1 !min-h-11" onClick={() => setMenuOpen(false)} data-testid="link-mobile-login">
                {signedIn ? 'My account' : 'Log in'}
              </Link>
              <Link href={pickupHref} className="button-primary flex-1 !min-h-11" onClick={() => setMenuOpen(false)} data-testid="link-mobile-register">
                {signedIn ? 'Schedule a Pickup' : 'Get Started'}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
