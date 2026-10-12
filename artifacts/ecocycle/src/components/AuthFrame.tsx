import { ArrowLeft, Leaf } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'wouter';

export function AuthFrame({ title, eyebrow, description, children }: { title: string; eyebrow: string; description: string; children: ReactNode }) {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute -left-36 top-[-100px] size-[460px] rounded-full bg-cyan-400/[0.07] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 size-[440px] rounded-full bg-violet-400/[0.07] blur-[100px]" />
      <div className="relative w-full max-w-[480px]">
        <Link href="/" className="mb-8 inline-flex items-center gap-3" data-testid="link-auth-brand">
          <span className="grid size-10 place-items-center rounded-xl border border-cyan-200/20 bg-cyan-200/[0.08] text-[#82eee5]"><Leaf size={19} /></span>
          <span className="text-lg font-extrabold tracking-[-0.04em] text-slate-100">EcoCycle</span>
        </Link>
        <section className="glow-card rounded-[26px] p-6 shadow-2xl shadow-black/20 sm:p-9">
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.06em] text-slate-50">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
          <div className="mt-7">{children}</div>
        </section>
        <Link href="/" className="mx-auto mt-6 flex w-fit items-center gap-2 text-xs text-slate-500 transition hover:text-cyan-200" data-testid="link-back-home"><ArrowLeft size={14} /> Back to EcoCycle</Link>
      </div>
    </main>
  );
}
