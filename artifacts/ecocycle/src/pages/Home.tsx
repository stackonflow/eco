import { useHealthCheck } from '@workspace/api-client-react';
import { ArrowDown, ArrowRight, ArrowUpRight, Box, Check, ClipboardCheck, Cpu, FileText, GlassWater, Leaf, PackageCheck, Recycle, ShieldCheck, Truck, Users, Wallet, Workflow } from 'lucide-react';
import { Link } from 'wouter';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';

const materials = [
  { name: 'Plastic', detail: 'Bottles, tubs and clean packaging', icon: Recycle },
  { name: 'Paper', detail: 'Paper, newspapers and magazines', icon: FileText },
  { name: 'Cardboard', detail: 'Flattened boxes and cartons', icon: Box },
  { name: 'Metal', detail: 'Aluminium and steel containers', icon: PackageCheck },
  { name: 'Glass', detail: 'Bottles and jars, sorted by type', icon: GlassWater },
  { name: 'E-waste', detail: 'Small electronics and accessories', icon: Cpu },
  { name: 'Organic waste', detail: 'Food scraps for suitable recovery', icon: Leaf },
];
const steps = [
  { number: '01', title: 'Create an account', text: 'Set up your household profile and add the details that make collection straightforward.', icon: Users },
  { number: '02', title: 'Book a pickup', text: 'Choose a material, estimate its weight, and tell us where and when to collect.', icon: Truck },
  { number: '03', title: 'Verify the material', text: 'At collection, the team confirms actual weight and material quality.', icon: ClipboardCheck },
  { number: '04', title: 'Confirm its value', text: 'The final payable amount is based on verified weight and the approved rate.', icon: Wallet },
  { number: '05', title: 'Sort and record', text: 'Collected materials are categorized and logged for the next handoff.', icon: Box },
  { number: '06', title: 'Connect to recovery', text: 'Sorted materials can move onward to suitable recycling partners.', icon: Workflow },
];
const benefits = [
  { icon: ShieldCheck, title: 'Know what happens next', text: 'Follow a clearer handoff from collection through material verification and onward.' },
  { icon: Wallet, title: 'A transparent estimate', text: 'An approved rate gives an estimate. Verified weight and quality determine final value.' },
  { icon: Recycle, title: 'Keep materials in circulation', text: 'Thoughtful sorting gives recoverable material a better chance at a useful next life.' },
];

export default function Home() {
  const health = useHealthCheck();
  const status = health.isLoading ? 'Checking platform connection' : health.isError ? 'Service status unavailable' : 'Platform services connected';
  return <div className="min-h-[100dvh] overflow-hidden"><SiteHeader /><main>
    <section className="relative border-b border-[#e1e5dc]">
      <div className="site-shell grid min-h-[640px] items-center gap-6 py-12 md:grid-cols-[1.04fr_.96fr] md:py-16 lg:min-h-[690px] lg:gap-3">
        <div className="relative z-10 max-w-[620px] fade-up">
          <p className="eyebrow mb-6 flex items-center gap-2"><span className="size-2 rounded-full bg-[#6d9875]" /> A more considered way to recycle</p>
          <h1 className="max-w-[620px] text-[clamp(3.25rem,7.2vw,6.2rem)] font-semibold leading-[.97] tracking-[-.072em] text-[#20382b]">Turn Your Waste <span className="block font-serif font-medium tracking-[-.065em] text-[#4e8159]">Into Wealth.</span></h1>
          <p className="mt-7 max-w-[505px] text-[1rem] leading-7 text-[#53685a] sm:text-lg sm:leading-8">EcoCycle connects households with local collectors and recycling partners—making responsible disposal easier to arrange and easier to follow.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/submit-waste" className="button-primary" data-testid="link-schedule-pickup">Schedule a Pickup <ArrowUpRight size={16} /></Link>
            <a href="#how-it-works" className="button-secondary" data-testid="link-explore-process">Explore How It Works <ArrowDown size={15} /></a>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-[#637568]" data-testid="status-platform-connection"><span className={`size-2 rounded-full ${health.isError ? 'bg-[#c08b55]' : 'bg-[#6c9674]'}`} />{status}</div>
        </div>
        <div className="fade-up delay-1 relative mx-auto w-full max-w-[510px]">
          <div className="relative aspect-square max-h-[520px]">
            <div className="absolute inset-[7%] rounded-full border border-[#d9e3d6]" />
            <div className="absolute inset-[18%] rounded-full border border-[#d1dfd0]" />
            <div className="absolute inset-[29%] rounded-full border border-[#bfd2bf]" />
            <div className="absolute left-1/2 top-1/2 grid size-[46%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#e5ede1]">
              <div className="grid size-[72%] place-items-center rounded-full border border-[#b9cfb9] bg-[#f4f5eb] text-[#477956]">
                <Recycle className="size-[52%]" strokeWidth={1.15} />
              </div>
            </div>
            <div className="absolute left-[1%] top-[25%] flex items-center gap-3 border border-[#d9e2d6] bg-[#fbfaf5] px-3 py-3 shadow-[0_8px_26px_rgba(40,66,45,.08)]">
              <span className="grid size-9 place-items-center bg-[#e8f0e5] text-[#477956]"><Truck size={17} /></span><span><strong className="block text-xs text-[#243b2c]">Local collection</strong><small className="text-[.64rem] text-[#708075]">At a time that works</small></span>
            </div>
            <div className="absolute right-[-1%] top-[47%] flex items-center gap-3 border border-[#d9e2d6] bg-[#fbfaf5] px-3 py-3 shadow-[0_8px_26px_rgba(40,66,45,.08)]">
              <span className="grid size-9 place-items-center bg-[#edf0e3] text-[#647c4a]"><Check size={17} /></span><span><strong className="block text-xs text-[#243b2c]">Verified materials</strong><small className="text-[.64rem] text-[#708075]">Weight and quality checked</small></span>
            </div>
            <div className="absolute bottom-[14%] left-[8%] flex items-center gap-3 border border-[#d9e2d6] bg-[#fbfaf5] px-3 py-3 shadow-[0_8px_26px_rgba(40,66,45,.08)]">
              <span className="grid size-9 place-items-center bg-[#e8f0e5] text-[#477956]"><ArrowRight size={17} /></span><span><strong className="block text-xs text-[#243b2c]">A useful next life</strong><small className="text-[.64rem] text-[#708075]">Matched for recovery</small></span>
            </div>
            <span className="absolute right-[20%] top-[12%] size-2 rounded-full bg-[#88a789]" />
            <span className="absolute bottom-[20%] right-[13%] size-1.5 rounded-full bg-[#b3c5a5]" />
          </div>
          <p className="mt-0 text-center font-mono text-[.62rem] uppercase tracking-[.16em] text-[#78897b]">One thoughtful handoff at a time</p>
        </div>
      </div>
    </section>

    <section id="materials" className="site-shell scroll-mt-24 py-20 lg:py-24">
      <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow mb-3">Materials with a next chapter</p><h2 className="section-title">Start with what you have.</h2></div><p className="max-w-sm text-sm leading-6 text-[#617267]">Keep materials sorted where possible. A collector can help confirm what is accepted when your pickup is arranged.</p></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{materials.map(({ name, detail, icon: Icon }, index) => <article key={name} className={`glow-card p-5 transition-colors hover:border-[#aac2a8] ${index === 6 ? 'col-span-2 sm:col-span-1' : ''}`} data-testid={`card-material-${name.toLowerCase().replaceAll(' ', '-')}`}><span className="mb-5 grid size-10 place-items-center bg-[#e9f0e6] text-[#477956]"><Icon size={18} strokeWidth={1.7} /></span><h3 className="text-sm font-bold text-[#243b2c]">{name}</h3><p className="mt-1.5 text-xs leading-5 text-[#6a7b6e]">{detail}</p></article>)}</div>
    </section>

    <section id="how-it-works" className="scroll-mt-20 border-y border-[#dbe3d8] bg-[#edf1e8]">
      <div className="site-shell py-20 lg:py-24"><div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="eyebrow mb-3">A clear chain of custody</p><h2 className="section-title">How EcoCycle works</h2><div className="mt-5 h-[2px] w-14 bg-[#6f9570]" /></div><p className="max-w-md text-sm leading-6 text-[#617267]">From a doorstep to a recycling partner, each step is designed to make the process easier to follow and trust.</p></div>
        <div className="grid gap-3 md:grid-cols-2">{steps.map(({ number, title, text, icon: Icon }) => <article key={number} className="group flex min-h-[150px] gap-5 border border-[#d9e2d6] bg-[#fbfaf5] p-5 sm:p-6" data-testid={`card-step-${number}`}><div className="flex shrink-0 flex-col items-center"><span className="grid size-11 place-items-center bg-[#e9f0e6] text-[#477956]"><Icon size={18} strokeWidth={1.6} /></span><span className="mt-3 font-mono text-[.65rem] tracking-[.13em] text-[#739077]">{number}</span></div><div className="pt-1"><h3 className="text-lg font-semibold tracking-[-.03em] text-[#243b2c]">{title}</h3><p className="mt-2 max-w-[410px] text-sm leading-6 text-[#617267]">{text}</p></div><ChevronDecor /></article>)}</div>
        <div className="mt-5 border border-[#cfddce] bg-[#e3ebe0] px-5 py-6 text-center sm:px-8"><p className="mb-3 font-mono text-[.62rem] uppercase tracking-[.16em] text-[#718373]">The circular route</p><p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm font-semibold text-[#365440] sm:gap-x-3 sm:text-base"><span>Household</span><ArrowRight size={15} /><span>Collection</span><ArrowRight size={15} /><span>Verification</span><ArrowRight size={15} /><span>Recovery</span></p></div>
      </div>
    </section>

    <section id="why-ecocycle" className="site-shell scroll-mt-24 py-20 lg:py-24"><div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-20"><div><p className="eyebrow mb-3">Good systems make good habits</p><h2 className="section-title">Worth doing.<br />Easy to trust.</h2><p className="mt-5 max-w-md text-sm leading-7 text-[#617267]">Responsible disposal should not feel like a leap of faith. EcoCycle gives each material a clearer route and keeps the important details in view.</p><Link href="/register" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#31583c] transition hover:gap-3" data-testid="link-benefits-register">Join the cycle <ArrowRight size={16} /></Link></div><div className="space-y-3">{benefits.map(({ icon: Icon, title, text }, i) => <article key={title} className="flex gap-4 border border-[#dbe3d8] bg-[#fbfaf5] p-5 sm:gap-5 sm:p-6" data-testid={`card-benefit-${i + 1}`}><span className="grid size-11 shrink-0 place-items-center bg-[#e9f0e6] text-[#477956]"><Icon size={19} /></span><div><h3 className="font-bold text-[#243b2c]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#617267]">{text}</p></div></article>)}</div></div></section>

    <section className="border-y border-[#dbe3d8] bg-[#edf1e8]"><div className="site-shell grid gap-7 py-16 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="eyebrow mb-3">Measured, not guessed</p><h2 className="section-title">Impact starts with verified records.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-[#617267]">EcoCycle is in its first phase. Collection and recovery metrics will be shown when the platform has verified records to support them.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:w-[410px]"><article className="border border-[#d4dfd2] bg-[#fbfaf5] p-5"><p className="font-mono text-[.63rem] uppercase tracking-[.13em] text-[#718373]">Verified collections</p><p className="mt-4 text-sm font-semibold text-[#41594a]">Not available yet</p></article><article className="border border-[#d4dfd2] bg-[#fbfaf5] p-5"><p className="font-mono text-[.63rem] uppercase tracking-[.13em] text-[#718373]">Material recovered</p><p className="mt-4 text-sm font-semibold text-[#41594a]">Not available yet</p></article></div></div></section>

    <section className="site-shell py-20 lg:py-24"><div className="relative overflow-hidden border border-[#294e35] bg-[#214b34] px-6 py-12 sm:px-10 sm:py-16 lg:px-16"><div className="pointer-events-none absolute -right-10 -top-32 size-80 rounded-full border border-[#a9c4a5]/25" /><div className="pointer-events-none absolute -right-3 top-[-90px] size-60 rounded-full border border-[#a9c4a5]/20" /><div className="relative max-w-[650px]"><p className="mb-3 font-mono text-[.68rem] uppercase tracking-[.16em] text-[#c2d4bd]">Your next step can be small</p><h2 className="text-3xl font-semibold leading-tight tracking-[-.055em] text-[#f6f4e9] sm:text-5xl">Give useful materials somewhere to go.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-[#d6e0d2]">Create an account to get started with a pickup and keep the handoff visible.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/submit-waste" className="button-primary !border-[#f5f3eb] !bg-[#f5f3eb] !text-[#214b34] hover:!bg-[#e7eee3]" data-testid="link-final-register">Schedule a Pickup <ArrowUpRight size={16} /></Link><Link href="/login" className="button-secondary !border-[#aec5ab] !text-[#f4f3e9] hover:!bg-[#315c3d]" data-testid="link-final-login">Already a member? Sign in</Link></div></div></div></section>
  </main><SiteFooter /></div>;
}
function ChevronDecor() { return <span aria-hidden="true" className="ml-auto hidden self-center text-[#91a492] transition-transform group-hover:translate-x-1 sm:block"><ArrowRight size={17} /></span>; }
