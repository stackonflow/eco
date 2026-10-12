import { ArrowLeft, Leaf } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'wouter';

export function AuthFrame({ title, eyebrow, description, children }: { title: string; eyebrow: string; description: string; children: ReactNode }) {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute -left-36 top-[-100px] size-[460px] rounded-full bg-[#dce9d9]/55 blur-[95px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 size-[440px] rounded-full bg-[#e5ead6]/65 blur-[95px]" />
      <div className="relative w-full max-w-[480px]">
        <Link href="/" className="mb-8 inline-flex items-center gap-3" data-testid="link-auth-brand">
          <span className="grid size-10 place-items-center bg-[#214b34] text-[#f5f0dc]"><Leaf size={19} /></span>
          <span className="text-lg font-extrabold tracking-[-0.04em] text-[#20382b]">EcoCycle</span>
        </Link>
        <section className="glow-card rounded-lg p-6 sm:p-9">
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#20382b]">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-[#617267]">{description}</p>
          <div className="mt-7">{children}</div>
        </section>
        <Link href="/" className="mx-auto mt-6 flex w-fit items-center gap-2 text-xs text-[#68796d] transition hover:text-[#214b34]" data-testid="link-back-home"><ArrowLeft size={14} /> Back to EcoCycle</Link>
      </div>
    </main>
  );
}
