import { getGetInventoryBatchByQrQueryKey, getGetInventoryBatchQueryKey, getListInventoryBatchesQueryKey, useGetCurrentUser, useGetInventoryBatch, useGetInventoryBatchByQr, useListInventoryBatches, useUpdateInventoryProcessing, InventoryProcessingStatus, type InventoryBatch, type InventoryProcessingStatus as Processing } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Boxes, Check, Clipboard, QrCode, RefreshCw, Search, ShieldAlert } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';

const processing: Processing[] = [InventoryProcessingStatus.collected, InventoryProcessingStatus.sorted, InventoryProcessingStatus.stored, InventoryProcessingStatus.sent_for_processing, InventoryProcessingStatus.processed];
const label = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
export default function Inventory() {
  const account = useGetCurrentUser();
  const admin = account.data?.user?.role === 'admin';
  const batches = useListInventoryBatches({ query: { enabled: admin, queryKey: getListInventoryBatchesQueryKey() } });
  const [selected, setSelected] = useState('');
  const detail = useGetInventoryBatch(selected, { query: { enabled: Boolean(selected), queryKey: getGetInventoryBatchQueryKey(selected) } });
  const [tokenInput, setTokenInput] = useState('');
  const [token, setToken] = useState('');
  const lookup = useGetInventoryBatchByQr(token, { query: { enabled: Boolean(token), queryKey: getGetInventoryBatchByQrQueryKey(token) } });
  const update = useUpdateInventoryProcessing();
  const client = useQueryClient();
  const [nextStatus, setNextStatus] = useState<Processing>(InventoryProcessingStatus.sorted);
  const [location, setLocation] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const refresh = async (batch?: InventoryBatch) => Promise.all([
    client.invalidateQueries({ queryKey: getListInventoryBatchesQueryKey() }),
    batch ? client.invalidateQueries({ queryKey: getGetInventoryBatchQueryKey(batch.id) }) : Promise.resolve(),
  ]);
  const processBatch = (event: FormEvent<HTMLFormElement>, batch: InventoryBatch) => {
    event.preventDefault(); setNotice(''); setError('');
    update.mutate({ batchId: batch.id, data: { processingStatus: nextStatus, storageLocation: location.trim() || null } }, {
      onSuccess: async (saved) => { await refresh(saved); setNotice(`Batch ${saved.batchCode} updated.`); },
      onError: (reason) => setError(reason instanceof Error ? reason.message : 'Batch update failed.'),
    });
  };
  const doLookup = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setToken(tokenInput.trim()); };
  return <div className="min-h-[100dvh]"><SiteHeader /><main className="site-shell min-h-[70vh] py-12 sm:py-16">
    {account.isLoading ? <Loading /> : account.isError || !account.data?.user ? <Gate title="Sign in to view inventory" text="Inventory records are available to EcoCycle operations accounts." /> : !admin ? <Gate title="Inventory management is restricted" text="Batch records are available to administrators. Use QR lookup to find a batch record." back /> : <>
      <header className="mb-8"><p className="eyebrow mb-3">Verified material records</p><h1 className="text-4xl font-semibold tracking-[-.05em] text-[#20382b] sm:text-5xl">Inventory</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#617267]">Review verified batches, their reserved and available quantity, and maintain processing stage and storage location.</p></header>
      {notice && <p role="status" className="mb-4 flex items-center gap-2 border border-[#c9ddc9] bg-[#edf5eb] px-4 py-3 text-sm text-[#31583c]"><Check size={16} />{notice}</p>}{error && <p role="alert" className="mb-4 border border-[#e1c7bd] bg-[#f9eeea] px-4 py-3 text-sm text-[#8b4637]">{error}</p>}
      <section className="mb-9"><div className="mb-4 flex items-center gap-3"><span className="grid size-10 place-items-center bg-[#e7eee3] text-[#477956]"><QrCode size={18} /></span><div><h2 className="text-xl font-semibold text-[#20382b]">Find a batch by QR token</h2><p className="text-sm text-[#617267]">Enter the token printed on a batch label.</p></div></div>
        <form onSubmit={doLookup} className="flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="qr-token">QR token</label><input id="qr-token" className="field" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} placeholder="Enter QR token" /><button className="button-secondary"><Search size={15} /> Look up</button></form>
        {token && (lookup.isLoading ? <p className="mt-3 text-sm text-[#617267]">Looking up batch…</p> : lookup.isError ? <p role="alert" className="mt-3 text-sm text-[#8b4637]">No batch was found for that QR token.</p> : lookup.data && <BatchSummary batch={lookup.data} />)}
      </section>
      <section><div className="mb-4 flex items-center gap-3"><span className="grid size-10 place-items-center bg-[#e7eee3] text-[#477956]"><Boxes size={18} /></span><div><h2 className="text-xl font-semibold text-[#20382b]">Material batches</h2><p className="text-sm text-[#617267]">Batches are created by collection verification.</p></div></div>
        {batches.isLoading ? <Loading /> : batches.isError ? <div role="alert" className="surface rounded-lg p-6"><p>Inventory could not be loaded.</p><button className="button-secondary mt-3" onClick={() => void batches.refetch()}><RefreshCw size={14} /> Retry</button></div> : !batches.data?.length ? <div className="surface rounded-lg p-8 text-center text-sm text-[#617267]">No verified inventory batches are available yet.</div> : <div className="grid gap-3 lg:grid-cols-2">{batches.data.map((batch) => <button key={batch.id} className={`surface rounded-lg p-5 text-left transition-colors hover:border-[#9eb89e] ${selected === batch.id ? 'border-[#477956]' : ''}`} onClick={() => { setSelected(batch.id); setNextStatus(batch.processingStatus); setLocation(batch.storageLocation ?? ''); }} data-testid={`batch-${batch.id}`}><div className="flex justify-between gap-3"><div><p className="font-mono text-xs tracking-[.1em] text-[#718373]">{batch.batchCode}</p><h3 className="mt-1 font-semibold text-[#20382b]">{batch.category}</h3></div><span className="status-pill">{label(batch.processingStatus)}</span></div><p className="mt-4 text-sm text-[#617267]">{batch.verifiedQuantityKg} kg verified · {batch.availableQuantityKg} kg available · {batch.reservedQuantityKg} kg reserved</p><p className="mt-2 text-xs text-[#718075]">{batch.quality} quality · {batch.storageLocation || 'Location not set'}</p></button>)}</div>}
      </section>
      {selected && <section className="surface mt-6 rounded-lg p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow mb-2">Selected batch</p><h2 className="text-2xl font-semibold text-[#20382b]">{detail.data?.batchCode ?? 'Batch details'}</h2></div>{detail.data && <div className="border border-[#dce4d8] bg-white p-3"><QRCodeSVG value={detail.data.qrUrl} size={112} aria-label={`QR code for ${detail.data.batchCode}`} /><p className="mt-2 max-w-28 break-all font-mono text-[.62rem] text-[#718075]">{detail.data.qrToken}</p></div>}</div>
        {detail.isLoading ? <p className="mt-4 text-sm text-[#617267]">Loading batch detail…</p> : detail.isError ? <p role="alert" className="mt-4 text-sm text-[#8b4637]">Batch detail could not be loaded.</p> : detail.data && <><BatchSummary batch={detail.data} /><form className="mt-5 grid gap-4 border-t border-[#e0e5dc] pt-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={(event) => processBatch(event, detail.data!)}><label><span className="field-label">Processing stage</span><select className="field" value={nextStatus} onChange={(e) => setNextStatus(e.target.value as Processing)}>{processing.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></label><label><span className="field-label">Storage location</span><input className="field" maxLength={300} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Facility or storage area" /></label><button className="button-primary" disabled={update.isPending}><Clipboard size={15} /> Save record</button></form><div className="mt-5 border-t border-[#e0e5dc] pt-4"><h3 className="text-sm font-semibold text-[#20382b]">Record history</h3><ol className="mt-3 space-y-2">{detail.data.statusHistory.map((entry, i) => <li key={`${entry.createdAt}-${i}`} className="flex flex-wrap justify-between gap-2 text-xs text-[#617267]"><span>{label(entry.status)}{entry.actorName ? ` · ${entry.actorName}` : ''}</span><time>{new Date(entry.createdAt).toLocaleString()}</time></li>)}</ol></div></>}
      </section>}
    </>}
  </main><SiteFooter /></div>;
}
function BatchSummary({ batch }: { batch: InventoryBatch }) { return <div className="mt-4 grid gap-3 border border-[#dce4d8] bg-[#f1f4ed] p-4 sm:grid-cols-4"><Value label="Category" value={batch.category} /><Value label="Verified" value={`${batch.verifiedQuantityKg} kg`} /><Value label="Available" value={`${batch.availableQuantityKg} kg`} /><Value label="Quality / source" value={`${batch.quality} · ${batch.pickupRequestId}`} /></div>; }
function Value({ label, value }: { label: string; value: string }) { return <div><p className="text-[.65rem] uppercase tracking-[.1em] text-[#738276]">{label}</p><p className="mt-1 break-words text-sm font-semibold text-[#334d3b]">{value}</p></div>; }
function Loading() { return <div className="surface animate-pulse rounded-lg p-7"><div className="h-6 w-44 rounded bg-[#dfe7dc]" /><div className="mt-5 h-28 rounded bg-[#e9eee5]" /></div>; }
function Gate({ title, text, back = false }: { title: string; text: string; back?: boolean }) { return <section className="surface mx-auto max-w-xl rounded-lg p-8 text-center"><ShieldAlert className="mx-auto text-[#52745a]" size={30} /><h1 className="mt-4 text-3xl font-semibold text-[#20382b]">{title}</h1><p className="mt-3 text-sm leading-6 text-[#617267]">{text}</p><div className="mt-6 flex justify-center gap-3"><Link href={back ? '/account' : '/login'} className="button-primary">{back ? 'Back to account' : 'Sign in'}</Link>{back && <Link href="/inventory" className="button-secondary">QR lookup</Link>}</div></section>; }
