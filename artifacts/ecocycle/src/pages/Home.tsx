import { useHealthCheck } from '@workspace/api-client-react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Box,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Cpu,
  FileText,
  GlassWater,
  Leaf,
  PackageCheck,
  Recycle,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
  Workflow,
} from 'lucide-react';
import { Link } from 'wouter';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';

const materials = [
  { name: 'Plastic', detail: 'Bottles, tubs & clean packaging', icon: Recycle, hue: 'mint' },
  { name: 'Paper', detail: 'Paper, newspapers & magazines', icon: FileText, hue: 'blue' },
  { name: 'Cardboard', detail: 'Flattened boxes & cartons', icon: Box, hue: 'violet' },
  { name: 'Metal', detail: 'Aluminium & steel containers', icon: PackageCheck, hue: 'cyan' },
  { name: 'Glass', detail: 'Bottles & jars, sorted by type', icon: GlassWater, hue: 'blue' },
  { name: 'E-waste', detail: 'Small electronics & accessories', icon: Cpu, hue: 'violet' },
  { name: 'Organic waste', detail: 'Food scraps for suitable recovery', icon: Leaf, hue: 'mint' },
];

const steps = [
  { number: '01', title: 'Register', text: 'Users create an account on the platform.', icon: Users },
  { number: '02', title: 'Book a Pickup', text: 'Users select their waste category, estimated quantity, address, and preferred pickup time.', icon: Truck },
  { number: '03', title: 'Verify the Waste', text: 'Collectors verify actual weight and material quality.', icon: ClipboardCheck },
  { number: '04', title: 'Receive Payment', text: 'The final payable amount is calculated using verified weight and the approved rate.', icon: Wallet },
  { number: '05', title: 'Sort and Store', text: 'Collected materials are categorized and recorded in inventory.', icon: Box },
  { number: '06', title: 'Sell to Recyclers', text: 'EcoCycle matches sorted materials with suitable recycling companies.', icon: Workflow },
];

const benefits = [
  { icon: ShieldCheck, title: 'Know what happens next', text: 'A clear process keeps every handoff visible—from collection through verification and onward.' },
  { icon: CircleDollarSign, title: 'Value is made transparent', text: 'Verified weight and an approved rate determine the final payment, not a guess.' },
  { icon: Recycle, title: 'Materials stay in the loop', text: 'Sorted materials can find recycling partners equipped to give them another use.' },
];

export default function Home() {
  const health = useHealthCheck();
  const apiStatus = health.isLoading ? 'Checking platform connection' : health.isError ? 'Platform status unavailable' : 'Platform services connected';

  return (
    <div className="min-h-[100dvh] overflow-hidden">
      <SiteHeader />
      <main>
        <section className="relative">
          <div className="pointer-events-none absolute -right-40 top-10 h-[540px] w-[650px] rounded-full bg-cyan-400/[0.06] blur-[110px]" />
          <div className="site-shell relative grid min-h-[650px] items-center gap-12 pb-20 pt-16 lg:grid-cols-[1.03fr_0.97fr] lg:gap-8 lg:pb-28 lg:pt-20">
            <div className="fade-up relative z-10">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-100/[0.045] px-3.5 py-2">
                <span className="size-1.5 rounded-full bg-[#79e9db] shadow-[0_0_12px_rgba(121,233,219,.7)]" />
                <span className="font-mono text-[0.66rem] uppercase tracking-[0.13em] text-cyan-100/80">A smarter way to let go</span>
              </div>
              <h1 className="max-w-[700px] text-[clamp(3.1rem,7vw,6.4rem)] font-extrabold leading-[0.98] tracking-[-0.075em] text-[#f2f7fc]">
                Turn Your Waste <span className="block bg-gradient-to-r from-[#78ede0] via-[#8bd6ff] to-[#b8a2ff] bg-clip-text text-transparent">Into Wealth.</span>
              </h1>
              <p className="mt-7 max-w-[520px] text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                EcoCycle connects households with trusted collectors and recycling partners—so responsible disposal feels simple, visible, and worthwhile.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="button-primary" data-testid="link-schedule-pickup">Schedule a Pickup <ArrowUpRight size={16} /></Link>
                <a href="#how-it-works" className="button-secondary" data-testid="link-explore-process">Explore How It Works <ArrowDown size={15} /></a>
              </div>
              <div className="mt-10 flex items-center gap-3 text-[0.72rem] text-slate-500">
                <span className={`size-1.5 rounded-full ${health.isError ? 'bg-amber-300' : 'bg-[#78e2c4]'}`} />
                <span data-testid="status-platform-connection">{apiStatus}</span>
              </div>
            </div>

            <div className="fade-up delay-1 relative mx-auto w-full max-w-[530px]">
              <div className="absolute inset-8 rounded-full bg-[#3776b6]/[0.13] blur-[75px]" />
              <div className="relative aspect-[1.03]">
                <div className="absolute inset-[10%] rounded-full border border-cyan-100/[0.08]" />
                <div className="absolute inset-[19%] rounded-full border border-cyan-100/[0.08]" />
                <div className="absolute inset-[29%] rounded-full border border-violet-200/[0.12]" />
                <div className="absolute left-1/2 top-1/2 grid size-[46%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-100/20 bg-[radial-gradient(circle_at_35%_30%,rgba(99,217,219,.22),rgba(28,67,103,.22)_43%,rgba(12,22,41,.86)_75%)] shadow-[0_0_70px_rgba(51,163,200,.13),inset_0_0_40px_rgba(87,198,222,.12)]">
                  <div className="relative grid size-[58%] place-items-center rounded-full border border-cyan-100/20 bg-[#0b1b2a]/85">
                    <Recycle className="size-16 text-[#89eee2] sm:size-20" strokeWidth={1.2} />
                    <span className="absolute -bottom-3 rounded-full border border-cyan-100/20 bg-[#102535] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-cyan-100">in circulation</span>
                  </div>
                </div>
                <div className="absolute left-[4%] top-[25%] flex items-center gap-3 rounded-2xl border border-cyan-200/15 bg-[#101e31]/90 px-3.5 py-3 shadow-xl backdrop-blur">
                  <span className="grid size-9 place-items-center rounded-xl bg-cyan-100/[0.08] text-cyan-200"><Truck size={17} /></span>
                  <span><strong className="block text-xs text-slate-100">Local collection</strong><small className="text-[0.64rem] text-slate-500">A pickup that fits your day</small></span>
                </div>
                <div className="absolute right-[1%] top-[44%] flex items-center gap-3 rounded-2xl border border-violet-200/15 bg-[#151c35]/90 px-3.5 py-3 shadow-xl backdrop-blur">
                  <span className="grid size-9 place-items-center rounded-xl bg-violet-200/[0.08] text-violet-200"><Check size={17} /></span>
                  <span><strong className="block text-xs text-slate-100">Verified materials</strong><small className="text-[0.64rem] text-slate-500">Weight and quality confirmed</small></span>
                </div>
                <div className="absolute bottom-[17%] left-[11%] flex items-center gap-3 rounded-2xl border border-emerald-200/15 bg-[#102528]/90 px-3.5 py-3 shadow-xl backdrop-blur">
                  <span className="grid size-9 place-items-center rounded-xl bg-emerald-200/[0.08] text-emerald-200"><ArrowRight size={17} /></span>
                  <span><strong className="block text-xs text-slate-100">A useful next life</strong><small className="text-[0.64rem] text-slate-500">Matched with recovery partners</small></span>
                </div>
                <div className="absolute right-[16%] top-[12%] size-2 rounded-full bg-cyan-200 shadow-[0_0_18px_4px_rgba(110,239,232,.22)]" />
                <div className="absolute bottom-[22%] right-[13%] size-1.5 rounded-full bg-violet-200 shadow-[0_0_16px_4px_rgba(184,162,255,.26)]" />
              </div>
              <p className="mt-1 text-center font-mono text-[0.61rem] uppercase tracking-[0.17em] text-slate-600">One thoughtful handoff at a time</p>
            </div>
          </div>
        </section>

        <section id="materials" className="site-shell scroll-mt-24 pb-24 pt-10 lg:pb-32">
          <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-4">Materials with a next chapter</p>
              <h2 className="section-title">Start with what you have.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-400">Keep materials sorted where possible. Your collector can help confirm what is accepted when a pickup is arranged.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {materials.map((item, index) => {
              const Icon = item.icon;
              return (
                <article key={item.name} className={`glow-card group rounded-2xl p-4 transition duration-200 hover:-translate-y-1 hover:border-cyan-100/30 sm:p-5 ${index === 6 ? 'col-span-2 sm:col-span-1' : ''}`} data-testid={`card-material-${item.name.toLowerCase().replaceAll(' ', '-')}`}>
                  <span className={`mb-5 grid size-10 place-items-center rounded-xl border ${item.hue === 'violet' ? 'border-violet-200/15 bg-violet-200/[0.07] text-violet-200' : item.hue === 'mint' ? 'border-emerald-200/15 bg-emerald-200/[0.07] text-emerald-200' : 'border-cyan-200/15 bg-cyan-200/[0.07] text-cyan-200'}`}><Icon size={18} strokeWidth={1.7} /></span>
                  <h3 className="text-sm font-bold text-slate-100">{item.name}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">{item.detail}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 border-y border-white/[0.06] bg-[#0a1422]/75">
          <div className="site-shell py-20 lg:py-28">
            <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="eyebrow mb-4">A clear chain of custody</p>
                <h2 className="section-title">How EcoCycle Works</h2>
                <div className="mt-5 h-[2px] w-16 bg-gradient-to-r from-cyan-300 to-violet-300" />
              </div>
              <p className="max-w-md text-sm leading-6 text-slate-400">From a doorstep to a recycling partner, each step is designed to make the process easier to follow and trust.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.number} className="glow-card group relative flex min-h-[170px] gap-5 overflow-hidden rounded-[22px] p-5 transition duration-200 hover:border-cyan-200/30 hover:bg-[#183659]/80 sm:p-6" data-testid={`card-step-${step.number}`}>
                    <div className="absolute -right-10 -top-12 size-36 rounded-full bg-cyan-300/[0.035] blur-2xl transition group-hover:bg-cyan-300/[0.08]" />
                    <div className="relative flex shrink-0 flex-col items-center">
                      <span className="grid size-12 place-items-center rounded-full border border-cyan-200/30 bg-cyan-300/[0.07] text-cyan-100 shadow-[0_0_18px_rgba(80,215,222,.08)]"><Icon size={19} strokeWidth={1.6} /></span>
                      <span className="mt-3 font-mono text-[0.66rem] tracking-[0.14em] text-cyan-200/75">{step.number}</span>
                    </div>
                    <div className="relative pt-1">
                      <h3 className="text-lg font-bold tracking-[-0.03em] text-slate-100">{step.title}</h3>
                      <p className="mt-2 max-w-[410px] text-sm leading-6 text-slate-400">{step.text}</p>
                    </div>
                    <ChevronRight className="relative ml-auto hidden shrink-0 self-center text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-200 sm:block" size={18} />
                  </article>
                );
              })}
            </div>
            <div className="mt-8 rounded-2xl border border-cyan-200/15 bg-[linear-gradient(100deg,rgba(20,70,91,.35),rgba(58,44,91,.24))] px-5 py-6 text-center sm:px-8">
              <p className="mb-3 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-slate-500">The circular route</p>
              <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm font-semibold text-slate-200 sm:gap-x-3 sm:text-base" data-testid="text-process-summary">
                <span>User Waste</span><ArrowRight className="text-cyan-300" size={15} /><span>Collection</span><ArrowRight className="text-cyan-300" size={15} /><span>Verification</span><ArrowRight className="text-violet-300" size={15} /><span>Payment</span><ArrowRight className="text-violet-300" size={15} /><span>Resale</span>
              </p>
            </div>
          </div>
        </section>

        <section id="why-ecocycle" className="site-shell scroll-mt-24 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="eyebrow mb-4">Good systems make good habits</p>
              <h2 className="section-title">Worth doing.<br />Easy to trust.</h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-slate-400">Responsible disposal should not feel like a leap of faith. EcoCycle gives each material a clearer route and keeps the important details in view.</p>
              <Link href="/register" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-cyan-200 transition hover:gap-3" data-testid="link-benefits-register">Join the cycle <ArrowRight size={16} /></Link>
            </div>
            <div className="space-y-3">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <article key={benefit.title} className="flex gap-4 rounded-2xl border border-white/[0.07] bg-[#101b2b]/75 p-5 sm:gap-5 sm:p-6" data-testid={`card-benefit-${index + 1}`}>
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-cyan-100/15 bg-cyan-100/[0.06] text-cyan-200"><Icon size={19} /></span>
                    <div>
                      <h3 className="font-bold text-slate-100">{benefit.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{benefit.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-[#0a1422]/75">
          <div className="site-shell grid gap-8 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
            <div>
              <p className="eyebrow mb-4">Measured, not guessed</p>
              <h2 className="section-title">Impact starts with verified records.</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
                EcoCycle is in its first phase. Collection and recovery metrics
                will be shown when the platform has verified records to support
                them.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="glow-card rounded-2xl p-5">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.13em] text-slate-500">Verified collections</p>
                <p className="mt-4 text-sm font-semibold text-slate-200">Not available yet</p>
              </article>
              <article className="glow-card rounded-2xl p-5">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.13em] text-slate-500">Material recovered</p>
                <p className="mt-4 text-sm font-semibold text-slate-200">Not available yet</p>
              </article>
            </div>
          </div>
        </section>

        <section className="site-shell pb-20 lg:pb-28">
          <div className="relative overflow-hidden rounded-[28px] border border-cyan-100/15 bg-[linear-gradient(115deg,#11283c,#15233c_55%,#282344)] px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
            <div className="pointer-events-none absolute -right-12 -top-28 size-80 rounded-full border border-cyan-100/[0.09]" />
            <div className="pointer-events-none absolute -right-1 top-[-90px] size-60 rounded-full border border-violet-100/[0.09]" />
            <div className="relative max-w-[650px]">
              <p className="eyebrow mb-4">Your next step can be small</p>
              <h2 className="text-3xl font-extrabold leading-tight tracking-[-0.06em] text-slate-50 sm:text-5xl">Give useful materials somewhere to go.</h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">Create your EcoCycle account to get started with a pickup and keep the handoff transparent.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="button-primary" data-testid="link-final-register">Create your account <ArrowUpRight size={16} /></Link>
                <Link href="/login" className="button-secondary" data-testid="link-final-login">Already a member? Sign in</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
