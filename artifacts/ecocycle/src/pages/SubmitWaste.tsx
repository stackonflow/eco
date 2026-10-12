import { getListMyWasteRequestsQueryKey, getListActiveWasteRatesQueryKey, useCreateWasteRequest, useGetCurrentUser, useListActiveWasteRates, type PickupRequestInput, type WasteCategory } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, CheckCircle2, Leaf, LoaderCircle, RefreshCw } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';

const categories: WasteCategory[] = ['Plastic', 'Paper', 'Cardboard', 'Metal', 'Glass', 'E-waste', 'Organic waste'];
const errorText = (e: unknown) => e instanceof Error ? e.message : 'Please check the information and try again.';

export default function SubmitWaste() {
  const account = useGetCurrentUser();
  const rates = useListActiveWasteRates();
  const create = useCreateWasteRequest();
  const client = useQueryClient();
  const [, setLocation] = useLocation();
  const [category, setCategory] = useState<WasteCategory>('Plastic');
  const [quantity, setQuantity] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const profile = account.data?.user;
  const rate = rates.data?.find((r) => r.category === category && r.active);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const input: PickupRequestInput = { category, estimatedQuantityKg: Number(quantity), pickupAddress: address.trim(), preferredPickupAt: new Date(date).toISOString(), description: description.trim() || undefined };
    create.mutate({ data: input }, {
      onSuccess: async () => {
        await client.invalidateQueries({ queryKey: getListMyWasteRequestsQueryKey() });
        setSuccess(true);
      },
      onError: (e) => setError(errorText(e)),
    });
  }

  return <div className="min-h-[100dvh]"><SiteHeader /><main className="site-shell py-12 sm:py-16">
    {account.isLoading ? <div className="surface animate-pulse rounded-lg p-8"><div className="h-6 w-40 rounded bg-[#dfe7dc]" /><div className="mt-6 h-40 rounded bg-[#e9eee5]" /></div> : account.isError || !profile ? <section className="surface mx-auto max-w-xl rounded-lg p-8 text-center">
      <Leaf className="mx-auto text-[#477956]" size={30} /><h1 className="mt-4 text-3xl font-semibold text-[#20382b]">Sign in to arrange a pickup</h1>
      <p className="mt-3 text-sm leading-6 text-[#617267]">Pickup requests are saved to your account so you can follow their progress.</p>
      <div className="mt-6 flex justify-center gap-3"><Link href="/login" className="button-primary">Sign in <ArrowRight size={15} /></Link><Link href="/register" className="button-secondary">Create account</Link></div>
    </section> : <div className="mx-auto max-w-3xl">
      <p className="eyebrow mb-3">Household collection</p><h1 className="text-4xl font-semibold tracking-[-.05em] text-[#20382b] sm:text-5xl">Schedule a pickup.</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#617267]">Tell us what you have and when collection works. The final value is confirmed after material weight and quality are verified.</p>
      {success ? <section className="surface mt-8 rounded-lg p-7 sm:p-9" role="status"><CheckCircle2 size={30} className="text-[#477956]" /><h2 className="mt-4 text-2xl font-semibold text-[#20382b]">Request received</h2><p className="mt-2 text-sm text-[#617267]">Your request has been saved. You can follow its status in your requests.</p><div className="mt-6 flex gap-3"><Link href="/my-requests" className="button-primary">View my requests <ArrowRight size={15} /></Link><button className="button-secondary" onClick={() => { setSuccess(false); setQuantity(''); setDescription(''); }}>Submit another</button></div></section> :
      <form onSubmit={submit} className="surface mt-8 grid gap-x-6 gap-y-5 rounded-lg p-5 sm:grid-cols-2 sm:p-8">
        {error && <div role="alert" className="sm:col-span-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
        {rates.isError && <div role="alert" className="sm:col-span-2 flex items-center justify-between rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">Rates could not be loaded. <button type="button" className="inline-flex items-center gap-2 underline" onClick={() => void rates.refetch()}><RefreshCw size={14} /> Retry</button></div>}
        <label><span className="field-label">Material category</span><select className="field" value={category} onChange={(e) => setCategory(e.target.value as WasteCategory)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span className="field-label">Estimated quantity (kg)</span><input className="field" type="number" min="0.1" max="1000" step="0.1" required value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="For example, 4.5" /></label>
        <div className="sm:col-span-2 rounded border border-[#dce4d8] bg-[#f1f4ed] px-4 py-3 text-sm text-[#4c6453]">{rates.isLoading ? 'Loading current rate…' : rate ? <><strong>${Number(rate.ratePerKg).toFixed(2)} / kg</strong> current rate · estimate updates after verified weighing.</> : 'No active rate is currently available for this category.'}</div>
        <label className="sm:col-span-2"><span className="field-label">Pickup address</span><textarea className="field min-h-24 resize-y" required minLength={5} maxLength={500} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address and any useful access details" /></label>
        <label><span className="field-label">Preferred pickup date and time</span><span className="relative block"><CalendarDays className="pointer-events-none absolute right-3 top-3 text-[#708477]" size={17} /><input className="field pr-10" type="datetime-local" required min={new Date().toISOString().slice(0, 16)} value={date} onChange={(e) => setDate(e.target.value)} /></span></label>
        <label><span className="field-label">Additional notes <span className="font-normal text-[#78877b]">Optional</span></span><input className="field" maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Anything the collector should know" /></label>
        <div className="flex flex-col gap-3 pt-1 sm:col-span-2 sm:flex-row sm:items-center"><button className="button-primary disabled:opacity-60" disabled={create.isPending || rates.isLoading || !rate}>{create.isPending ? <LoaderCircle className="animate-spin" size={16} /> : null}Send pickup request <ArrowRight size={15} /></button><span className="text-xs text-[#718075]">Signed in as {profile.name}</span></div>
      </form>}
    </div>}
  </main><SiteFooter /></div>;
}
