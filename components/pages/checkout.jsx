'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf, Star, Monitor, Check, X, Plus, Trash2, Upload, MapPin, UserRound, Building2, Landmark, QrCode, Lock, ShieldCheck, Download, Copy, ArrowRight, Search, Info, PenLine, Sparkles } from 'lucide-react'
import { checkoutTemples, checkoutPlans, checkoutPartner, checkoutCommission, onlineGateways, manualMethods } from '@/lib/data'
import { PublicShell, Photo, Pill, Field, Input, Select, Toggle, Steps, useToast } from '@/components/ui'

/* =============================================================================
   PARTNER CHECKOUT — simplified business model prototype (Sept 2026)
   Listing → Plan → Sponsor → Payment → Review, all client-side mock state, no API.
   Reuses the existing design system (PublicShell, card/btn/Pill/Field styles, brown ·
   saffron · gold palette) rather than a bespoke look — see Steps for the stepper.
   ========================================================================== */

const stepLabels = ['Listing','Plan','Sponsor','Payment','Review']
const rs = n => `₹${Number(n).toLocaleString('en-IN')}`
const planIcon = { Leaf, Star, Monitor }
const round = n => Math.round(n)

const Wrap = ({ children, className='' }) => <div className={`mx-auto max-w-4xl px-4 ${className}`}>{children}</div>

/* ---------- small reusable pieces ---------- */
export const FileField = ({ label, hint, required, accept='.png,.jpg,.jpeg,.pdf' }) => {
  const [file,setFile] = useState(null)
  return <Field label={<>{label}{required && <span className="text-red-600"> *</span>}</>}>
    {!file ? <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-brown-200 bg-brown-50/50 px-3 py-2.5 text-sm text-saffron-600 hover:bg-brown-50">
        <Upload size={16}/><span>Choose file <span className="text-brown-400">or tap to upload</span></span>
        <input type="file" accept={accept} className="sr-only" onChange={e=>{const f=e.target.files?.[0]; if(f) setFile(f.name)}}/></label>
      : <div className="flex items-center gap-2 rounded-xl border border-brown-200 bg-white px-3 py-2.5 text-sm"><span className="flex-1 truncate">{file}</span><span className="text-xs text-brown-400">{hint}</span><button onClick={()=>setFile(null)} className="text-brown-400 hover:text-red-600"><X size={16}/></button></div>}
    {hint && !file && <span className="mt-1 block text-xs text-brown-500">{hint}</span>}
  </Field>
}

const TempleSummaryCard = ({ temple, planPill }) => (
  <div className="card p-5"><div className="flex flex-wrap items-start gap-4">
    <Photo hue={temple.hue} className="h-16 w-24 shrink-0 rounded-xl"/>
    <div className="min-w-0 flex-1"><h2 className="text-lg font-semibold">{temple.name}</h2>
      <div className="mt-0.5 flex items-center gap-1 text-sm text-brown-500"><MapPin size={13}/>{temple.place}, {temple.district}</div>
      <div className="mt-1 text-sm text-brown-600">Temple Code: <b className="text-brown-900">{temple.code}</b></div></div>
    {planPill && <Pill tone="ok">{planPill}</Pill>}
  </div>
    <div className="mt-4 flex flex-wrap gap-6 border-t border-brown-100 pt-4 text-sm">
      <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-brown-100 text-brown-600"><UserRound size={16}/></span><div><div className="text-xs text-brown-500">Assigned Partner</div><b>{checkoutPartner.id}</b></div></div>
      <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-brown-100 text-brown-600"><Building2 size={16}/></span><div><div className="text-xs text-brown-500">Dealer / Partner</div><b>{checkoutPartner.dealerId}</b></div></div>
    </div></div>
)

const OrderSummary = ({ lines, total, ctaLabel, onCta, ctaDisabled, note }) => (
  <div className="card p-5"><div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Order Summary</h3></div>
    <div className="mt-3 divide-y divide-brown-100 text-sm">{lines.map(([l,v],i)=><div key={i} className="flex items-center justify-between py-2"><span className="flex items-center gap-1 text-brown-600">{l}</span><span className="font-medium">{typeof v==='number'?rs(v):v}</span></div>)}</div>
    <div className="mt-2 flex items-center justify-between border-t-2 border-brown-900 pt-3 text-lg font-bold"><span>Total Payable</span><span>{rs(total)}</span></div>
    {note && <p className="mt-2 text-xs text-emerald-700">{note}</p>}
    <button disabled={ctaDisabled} onClick={onCta} className="btn-p mt-4 w-full !py-3 disabled:opacity-40">{ctaLabel}<ArrowRight size={16}/></button>
    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-brown-500"><ShieldCheck size={14} className="text-emerald-600"/>100% Secure Payments · Powered by trusted partners</div>
  </div>
)

const CommissionPreview = ({ base, status }) => {
  const partner = round(base*checkoutCommission.partnerPct/100), dealer = round(base*checkoutCommission.dealerPct/100)
  const available = status==='approved'
  return <div className="grid gap-3 sm:grid-cols-2">
    <div className={`rounded-xl p-4 ${available?'bg-emerald-50':'bg-saffron-50'}`}><div className="text-xs font-semibold uppercase text-brown-500">Partner commission · {checkoutCommission.partnerPct}%</div><div className={`mt-1 text-2xl font-bold ${available?'text-emerald-700':'text-saffron-700'}`}>{rs(partner)}</div><Pill tone={available?'ok':'warn'}>{available?'Available':'Pending'}</Pill></div>
    <div className={`rounded-xl p-4 ${available?'bg-emerald-50':'bg-saffron-50'}`}><div className="text-xs font-semibold uppercase text-brown-500">Dealer commission · {checkoutCommission.dealerPct}%</div><div className={`mt-1 text-2xl font-bold ${available?'text-emerald-700':'text-saffron-700'}`}>{rs(dealer)}</div><Pill tone={available?'ok':'warn'}>{available?'Available':'Pending'}</Pill></div>
  </div>
}

/* ================================================================= */
export function PartnerCheckout() {
  const router = useRouter(); const nav = (path, opts) => router.push(path, opts); const [toast,el] = useToast()
  const [step,setStep] = useState(0)
  const [temple,setTemple] = useState(null)
  const [product,setProduct] = useState('premium')
  const [sponsorship,setSponsorship] = useState(false)
  const [sponsor,setSponsor] = useState({ name:'', org:'', contact:'', mobile:'', email:'', address:'', gst:'', category:'Financial Institution', website:'', tagline:'' })
  const [sponsored,setSponsored] = useState([]) // [{temple, product}]
  const [addingTemple,setAddingTemple] = useState(false)
  const [payMethod,setPayMethod] = useState('razorpay')
  const [manual,setManual] = useState({ date:'2026-09-13', app:'Google Pay', txn:'', ref:'', remarks:'', chequeNo:'', bankName:'', branch:'' })
  const [status,setStatus] = useState('idle') // idle | received | submitted | approved | rejected
  const setSponsorField = (k,v) => setSponsor(s=>({...s,[k]:v}))

  const isOnline = payMethod==='omniware' || payMethod==='razorpay'
  const billingOnly = product==='billing'
  const items = sponsorship ? sponsored : (temple ? [{temple, product}] : [])
  const subtotal = items.reduce((s,i)=>s+checkoutPlans[i.product].price,0)
  const gst = round(subtotal*0.18)
  const total = subtotal+gst

  const chooseTemple = t => { setTemple(t); setSponsored([{temple:t, product}]); setStep(1) }
  const continueFromPlan = () => { if(!billingOnly && sponsorship){ setSponsored(sp=>sp.length?sp.map(s=>({...s,product})):[{temple,product}]); setStep(2) } else setStep(3) }
  const addSponsoredTemple = t => { setSponsored(sp=>[...sp,{temple:t, product:'basic'}]); setAddingTemple(false); toast(`${t.name} added to sponsorship`) }
  const removeSponsoredTemple = i => setSponsored(sp=>sp.filter((_,j)=>j!==i))
  const submitPayment = () => { setStatus(isOnline?'received':'submitted'); setStep(4); toast(isOnline?'Payment received — verification pending':'Payment submitted for verification') }
  const simulate = s => { setStatus(s); toast(s==='approved'?'Approved by accounts team — subscription active':'Marked rejected — the partner can retry payment') }

  return (<PublicShell hideChatbot><Wrap className="py-6 sm:py-8">{el}
    <div className="mb-1 flex items-center gap-2"><Sparkles size={18} className="text-saffron-500"/><h1 className="text-2xl font-semibold sm:text-3xl">Temple Checkout</h1></div>
    <p className="mb-5 text-sm text-brown-500">List · Grow · Support — a stronger temple community</p>
    <Steps items={stepLabels} at={step}/>

    {/* ---------------- STEP 0 · LISTING ---------------- */}
    {step===0 && <div className="card p-5"><h2 className="text-lg font-semibold">Choose a temple listing</h2><p className="text-sm text-brown-500">Search a temple to sell a plan, sponsorship or the Billing App.</p>
      <div className="relative mt-3"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400"/><input placeholder="Search by name, place or code…" className="input !pl-9"/></div>
      <div className="mt-4 space-y-2">{checkoutTemples.map(t=><button key={t.slug} onClick={()=>chooseTemple(t)} className="flex w-full items-center gap-3 rounded-xl border border-brown-100 p-3 text-left transition hover:border-saffron-300 hover:bg-saffron-50/40">
        <Photo hue={t.hue} className="h-12 w-16 shrink-0 rounded-lg"/>
        <div className="min-w-0 flex-1"><b>{t.name}</b><div className="flex items-center gap-1 text-xs text-brown-500"><MapPin size={11}/>{t.place}, {t.district} · {t.code}</div></div>
        <Pill tone={t.currentPlan==='Free'?'n':'ok'}>{t.currentPlan} Plan</Pill><ArrowRight size={16} className="text-brown-300"/></button>)}</div></div>}

    {/* ---------------- STEP 1 · PLAN ---------------- */}
    {step===1 && temple && <>
      <TempleSummaryCard temple={temple} planPill={`${temple.currentPlan} Plan`}/>
      <section className="mt-6"><h2 className="text-xl font-semibold">Select Plan</h2><p className="text-sm text-brown-500">Choose the plan that best fits your temple's needs.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">{Object.values(checkoutPlans).map(p=>{ const Icon=planIcon[p.icon]; const sel=product===p.key
          return <button key={p.key} onClick={()=>setProduct(p.key)} className={`relative rounded-2xl border-2 p-5 text-left transition ${sel?'border-saffron-500 bg-saffron-50/60 shadow-soft':'border-brown-100 bg-white hover:border-brown-200'}`}>
            <div className="flex items-start justify-between"><Icon size={22} className={sel?'text-saffron-600':'text-brown-400'}/><span className={`h-5 w-5 rounded-full border-2 ${sel?'border-saffron-500 bg-saffron-500':'border-brown-300'}`}>{sel&&<Check size={13} className="text-white"/>}</span></div>
            {p.badge && <Pill tone="gold" >{p.badge}</Pill>}
            <h3 className="mt-2 font-display text-lg font-semibold">{p.name}</h3>
            <div className="mt-1"><span className="text-2xl font-bold text-brown-900">{rs(p.price)}</span><span className="text-sm text-brown-500"> / {p.cycle==='One Time'?'one time':'year'}</span></div>
            <Pill tone="info">{p.cycle}</Pill>
            <ul className="mt-3 space-y-1.5 text-sm">{p.features.map(f=><li key={f} className="flex items-center gap-1.5"><span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-saffron-500 text-white"><Check size={11}/></span>{f}</li>)}</ul>
          </button>})}</div></section>

      {!billingOnly && <div className="card mt-5 flex flex-wrap items-center justify-between gap-3 p-4"><div><b>Enable Sponsorship</b><p className="text-sm text-brown-500">Allow a sponsor to support this listing.</p></div>
        <div className="flex items-center gap-3"><Toggle defaultChecked={sponsorship} onChange={setSponsorship}/><span className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800"><Info size={13}/>Sponsors help temples grow. You can enable this later.</span></div></div>}

      <div className="card mt-5 p-4"><span className="label">Partner ID</span><div className="flex items-center justify-between rounded-xl bg-brown-50 px-3 py-2.5"><b>{checkoutPartner.id}</b><span className="flex items-center gap-1 text-xs text-brown-500"><Lock size={12}/>Auto-filled (Partner is logged in)</span></div></div>

      <div className="mt-6"><h3 className="text-lg font-semibold">Choose Payment Method</h3><p className="text-sm text-brown-500">Select your preferred payment option.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">{[['omniware','Omniware',Landmark],['razorpay','Razorpay',Landmark],['upi','UPI / QR',QrCode],['bank','Bank Transfer',Landmark],['cheque','Cheque',PenLine]].map(([k,l,Icon])=>
          <button key={k} onClick={()=>setPayMethod(k)} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center text-sm font-semibold transition ${payMethod===k?'border-saffron-500 bg-saffron-50':'border-brown-100 bg-white hover:border-brown-200'}`}><Icon size={22} className={payMethod===k?'text-saffron-600':'text-brown-400'}/>{l}</button>)}</div></div>

      <div className="mt-5 flex items-start gap-2 rounded-xl bg-gold-300/25 p-3 text-sm text-brown-700"><Info size={16} className="mt-0.5 shrink-0 text-saffron-600"/>Partner/Dealer commission will be processed internally after payment approval. You don't need to pay any additional amount for commission.</div>

      <div className="mt-5"><OrderSummary lines={[[checkoutPlans[product].name+(checkoutPlans[product].cycle==='One Time'?'':' (Annual)'), checkoutPlans[product].price],['GST (18%)', round(checkoutPlans[product].price*0.18)],['Convenience Fee', 0]]} total={round(checkoutPlans[product].price*1.18)} ctaLabel="Continue to Payment" onCta={continueFromPlan}/></div>
    </>}

    {/* ---------------- STEP 2 · SPONSOR ---------------- */}
    {step===2 && temple && <>
      <TempleSummaryCard temple={temple} planPill={`${checkoutPlans[product].name}`}/>
      <div className="card mt-5 flex flex-wrap items-center justify-between gap-3 p-4"><div><b>Enable Sponsorship</b><p className="text-sm text-brown-500">Support temples and showcase your organization.</p></div>
        <div className="flex items-center gap-3"><Toggle defaultChecked={sponsorship} onChange={setSponsorship}/><span className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800"><Info size={13}/>Sponsors help temples grow. You can enable this later.</span></div></div>

      <section className="mt-6"><h2 className="text-xl font-semibold">Sponsor Details</h2><p className="text-sm text-brown-500">Tell us about your organization. This information will be used for your sponsor profile.</p>
        <div className="card mt-3 grid gap-4 p-5 sm:grid-cols-2">
          <Field label={<>Sponsor Name<span className="text-red-600"> *</span></>}><Input value={sponsor.name} onChange={e=>setSponsorField('name',e.target.value)} placeholder="e.g. Resurge India Foundation"/></Field>
          <Field label="Organization Name"><Input value={sponsor.org} onChange={e=>setSponsorField('org',e.target.value)}/></Field>
          <Field label={<>Contact Person<span className="text-red-600"> *</span></>}><Input value={sponsor.contact} onChange={e=>setSponsorField('contact',e.target.value)}/></Field>
          <Field label={<>Mobile Number<span className="text-red-600"> *</span></>}><Input value={sponsor.mobile} onChange={e=>setSponsorField('mobile',e.target.value)} placeholder="+91"/></Field>
          <Field label={<>Email<span className="text-red-600"> *</span></>}><Input type="email" value={sponsor.email} onChange={e=>setSponsorField('email',e.target.value)}/></Field>
          <Field label={<>Address<span className="text-red-600"> *</span></>}><textarea className="input" rows={2} value={sponsor.address} onChange={e=>setSponsorField('address',e.target.value)}/></Field>
          <Field label="GST Number"><Input value={sponsor.gst} onChange={e=>setSponsorField('gst',e.target.value)}/></Field>
          <Field label={<>Sponsor Category<span className="text-red-600"> *</span></>}><Select options={['Financial Institution','Corporate / Business','NRI Foundation','Individual devotee','Other']} value={sponsor.category} onChange={e=>setSponsorField('category',e.target.value)}/></Field>
          <Field label="Website / Sponsor Link"><Input value={sponsor.website} onChange={e=>setSponsorField('website',e.target.value)} placeholder="https://…"/></Field>
          <Field label={<>Sponsor Branding Text<span className="text-red-600"> *</span></>}><Input value={sponsor.tagline} onChange={e=>setSponsorField('tagline',e.target.value)} placeholder="e.g. Building stronger communities together"/></Field>
          <FileField label="Organization Logo" required hint="PNG, JPG (Max 2MB)" accept="image/*"/>
          <FileField label="Horizontal Banner (Optional)" hint="PNG, JPG (Max 5MB)" accept="image/*"/>
        </div></section>

      <section className="mt-6"><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Sponsored Temples</h2><p className="text-sm text-brown-500">Select temples you want to sponsor under this organization.</p></div>
        <button onClick={()=>setAddingTemple(true)} className="btn-g"><Plus size={16}/>Add Temple</button></div>
        {addingTemple && <div className="card mt-3 p-4"><h4 className="mb-2 text-sm font-semibold">Choose another temple to sponsor</h4>
          <div className="space-y-2">{checkoutTemples.filter(t=>!sponsored.some(s=>s.temple.slug===t.slug)).map(t=><button key={t.slug} onClick={()=>addSponsoredTemple(t)} className="flex w-full items-center gap-3 rounded-xl border border-brown-100 p-2.5 text-left hover:bg-brown-50"><Photo hue={t.hue} className="h-9 w-12 shrink-0 rounded-lg"/><div className="flex-1"><b className="text-sm">{t.name}</b><div className="text-xs text-brown-500">{t.place}, {t.district}</div></div><Plus size={15} className="text-saffron-600"/></button>)}</div>
          <button onClick={()=>setAddingTemple(false)} className="btn-g mt-3 !py-1.5 text-xs">Cancel</button></div>}
        <div className="mt-3 space-y-2">{sponsored.map((s,i)=><div key={s.temple.slug} className="flex items-center gap-3 rounded-xl border border-brown-100 p-3">
          <Photo hue={s.temple.hue} className="h-12 w-16 shrink-0 rounded-lg"/>
          <div className="min-w-0 flex-1"><b className="block truncate">{s.temple.name}</b><div className="flex items-center gap-1 text-xs text-brown-500"><MapPin size={11}/>{s.temple.place}, {s.temple.district}</div></div>
          <div className="w-32 shrink-0"><Select options={['basic','premium']} value={s.product} onChange={e=>setSponsored(sp=>sp.map((x,j)=>j===i?{...x,product:e.target.value}:x))}/></div>
          <div className="w-24 shrink-0 text-right"><b>{rs(checkoutPlans[s.product].price)}</b><div className="text-[11px] text-brown-400">/ year</div></div>
          <button onClick={()=>removeSponsoredTemple(i)} className="shrink-0 rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"><Trash2 size={15}/></button></div>)}</div></section>

      <div className="card mt-5 flex flex-wrap items-center justify-between gap-3 p-4"><div><h3 className="font-semibold">Sponsorship Summary</h3><p className="text-sm text-brown-500">{sponsored.length} temple{sponsored.length!==1&&'s'} selected under this sponsor.</p></div>
        <div className="text-right"><div className="font-display text-2xl font-bold text-brown-900">{rs(subtotal)}<span className="text-sm font-normal text-brown-500"> / year</span></div><Pill tone="ok">{sponsored.length} Temple{sponsored.length!==1&&'s'}</Pill></div></div>

      <div className="mt-5"><OrderSummary lines={[[`Subtotal (${sponsored.length} temples)`, subtotal],['GST (18%)', gst]]} total={total} ctaLabel="Continue to Payment" onCta={()=>setStep(3)} ctaDisabled={!sponsored.length}/></div>
    </>}

    {/* ---------------- STEP 3 · PAYMENT ---------------- */}
    {step===3 && temple && (isOnline ? <>
      <TempleSummaryCard temple={temple} planPill={checkoutPlans[product].name}/>
      <section className="mt-6"><h2 className="text-xl font-semibold">Choose Online Payment Gateway</h2><p className="text-sm text-brown-500">Select your preferred secure payment gateway.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">{onlineGateways.map(g=><button key={g.key} onClick={()=>setPayMethod(g.key)} className={`flex items-center justify-between rounded-2xl border-2 p-5 text-left transition ${payMethod===g.key?'border-saffron-500 bg-saffron-50/60':'border-brown-100 bg-white'}`}>
          <div><div className="flex items-center gap-2"><Landmark size={22} className="text-brown-700"/><b className="font-display text-lg">{g.name}</b></div>{g.bank && <div className="text-xs font-semibold text-brown-500">{g.bank}</div>}<p className="mt-1 text-sm text-brown-500">{g.note}</p></div>
          <span className={`h-5 w-5 shrink-0 rounded-full border-2 ${payMethod===g.key?'border-saffron-500 bg-saffron-500':'border-brown-300'}`}>{payMethod===g.key&&<Check size={13} className="text-white"/>}</span></button>)}</div></section>
      <div className="card mt-5 p-5"><h3 className="font-semibold">Payment Summary</h3><p className="text-sm text-brown-500">Review your order details before making the payment.</p>
        <div className="mt-3 divide-y divide-brown-100 text-sm">
          <div className="flex justify-between py-2"><span>Plan Selected</span><b>{sponsorship?`Sponsorship (${sponsored.length} temples)`:checkoutPlans[product].name}</b></div>
          <div className="flex justify-between py-2"><span>Base Amount</span><span>{rs(subtotal)}</span></div>
          <div className="flex justify-between py-2"><span>GST (18%)</span><span>{rs(gst)}</span></div>
          <div className="flex justify-between py-2"><span className="flex items-center gap-1">Convenience / Gateway Fee <Info size={13} className="text-brown-400"/></span><span className="text-emerald-700">₹0.00 · No additional charges on {onlineGateways.find(g=>g.key===payMethod)?.name}</span></div></div>
        <div className="mt-2 flex justify-between border-t-2 border-brown-900 pt-3 text-lg font-bold"><span>Total Payable</span><span>{rs(total)}</span></div>
        <button onClick={submitPayment} className="btn-p mt-4 w-full !py-3"><Lock size={16}/>Pay Securely</button>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-brown-500"><ShieldCheck size={13} className="text-emerald-600"/>Powered by {onlineGateways.find(g=>g.key===payMethod)?.name} · 100% Secure Payments</div></div>
      <div className="card mt-5 p-4 text-sm"><b className="flex items-center gap-1.5"><Info size={15} className="text-blue-600"/>What happens next?</b><p className="mt-1 text-brown-600">After successful gateway payment, order status becomes <b>Payment Received</b> and moves to <b>Verification Pending</b> until accountant/admin approval.</p></div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-brown-500"><div><ShieldCheck size={18} className="mx-auto mb-1 text-emerald-600"/>Secure Payments<div>Bank-grade security</div></div><div><Lock size={18} className="mx-auto mb-1 text-emerald-600"/>Encrypted Gateway<div>Your data is safe</div></div><div><Download size={18} className="mx-auto mb-1 text-emerald-600"/>Invoice Generated<div>After approval</div></div></div>
    </> : <>
      <TempleSummaryCard temple={temple} planPill={checkoutPlans[product].name}/>
      <div className="card mt-5 p-5"><h3 className="font-semibold">Order Summary</h3><div className="mt-2 divide-y divide-brown-100 text-sm">
        <div className="flex justify-between py-2"><span>{sponsorship?`Sponsorship (${sponsored.length} temples)`:checkoutPlans[product].name}</span><span>{rs(subtotal)}</span></div>
        <div className="flex justify-between py-2"><span>GST (18%)</span><span>{rs(gst)}</span></div>
        <div className="flex justify-between py-2"><span>Convenience Fee</span><span>₹0.00</span></div></div>
        <div className="mt-2 flex justify-between border-t-2 border-brown-900 pt-3 text-lg font-bold"><span>Total Payable</span><span>{rs(total)}</span></div></div>

      <h2 className="mt-6 text-xl font-semibold">Select Payment Method</h2><p className="text-sm text-brown-500">Choose how you want to make the payment.</p>
      <div className="mt-3 grid grid-cols-3 gap-3">{manualMethods.map(m=><button key={m.key} onClick={()=>setPayMethod(m.key)} className={`rounded-xl border-2 p-3 text-center text-sm font-semibold ${payMethod===m.key?'border-saffron-500 bg-saffron-50':'border-brown-100 bg-white'}`}>{m.name}</button>)}</div>

      {payMethod==='upi' && <div className="card mt-4 p-5"><div className="flex items-center gap-2"><QrCode size={20} className="text-saffron-600"/><h3 className="font-semibold">UPI / QR Payment Details</h3></div><p className="text-sm text-brown-500">Scan the QR code or pay to the UPI ID and enter the transaction details below.</p>
        <div className="mt-4 grid gap-5 md:grid-cols-[200px_1fr]">
          <div className="rounded-xl bg-brown-50 p-4 text-center"><div className="mx-auto grid h-32 w-32 place-items-center rounded-lg border border-brown-200 bg-white"><QrCode size={80} className="text-brown-800"/></div><div className="mt-2 text-xs text-brown-500">UPI ID</div><b className="text-sm">{manualMethods[0].upiId}</b><p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-saffron-700"><Info size={12}/>Scan using any UPI app</p></div>
          <div className="grid gap-3 sm:grid-cols-2"><Field label={<>Payment Date<span className="text-red-600"> *</span></>}><Input type="date" value={manual.date} onChange={e=>setManual(m=>({...m,date:e.target.value}))}/></Field>
            <Field label={<>Payment App / Bank<span className="text-red-600"> *</span></>}><Select options={['Google Pay','PhonePe','Paytm','Other']} value={manual.app} onChange={e=>setManual(m=>({...m,app:e.target.value}))}/></Field>
            <Field label={<>Transaction ID / UTR<span className="text-red-600"> *</span></>}><Input value={manual.txn} onChange={e=>setManual(m=>({...m,txn:e.target.value}))} placeholder="e.g. 432189765321"/></Field>
            <Field label="Bank / Journal Reference" hint="Optional"><Input value={manual.ref} onChange={e=>setManual(m=>({...m,ref:e.target.value}))}/></Field>
            <Field label="Amount (₹)"><Input value={total} disabled/></Field>
            <FileField label="Upload Payment Proof" required hint="PDF, JPG, PNG (Max 5MB)"/>
            <Field label="Remarks (Optional)" className="sm:col-span-2"><textarea className="input" rows={2} maxLength={250} value={manual.remarks} onChange={e=>setManual(m=>({...m,remarks:e.target.value}))}/><span className="mt-1 block text-right text-[11px] text-brown-400">{manual.remarks.length}/250</span></Field></div></div></div>}

      {payMethod==='bank' && <div className="card mt-4 p-5"><div className="flex items-center gap-2"><Landmark size={20} className="text-saffron-600"/><h3 className="font-semibold">Bank Transfer Details</h3></div>
        <div className="mt-3 rounded-xl bg-brown-50 p-3 text-sm"><b>{manualMethods[1].bank}</b><div className="text-brown-600">A/c {manualMethods[1].account} · IFSC {manualMethods[1].ifsc}</div></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label={<>Payment Date<span className="text-red-600"> *</span></>}><Input type="date" value={manual.date} onChange={e=>setManual(m=>({...m,date:e.target.value}))}/></Field>
          <Field label="Bank"><Input placeholder="Sender's bank"/></Field>
          <Field label={<>UTR / Transaction ID<span className="text-red-600"> *</span></>}><Input value={manual.txn} onChange={e=>setManual(m=>({...m,txn:e.target.value}))}/></Field>
          <Field label="Amount (₹)"><Input value={total} disabled/></Field>
          <FileField label="Upload Payment Proof" required hint="PDF, JPG, PNG (Max 5MB)"/>
          <Field label="Remarks (Optional)"><textarea className="input" rows={2} value={manual.remarks} onChange={e=>setManual(m=>({...m,remarks:e.target.value}))}/></Field></div></div>}

      {payMethod==='cheque' && <div className="card mt-4 p-5"><div className="flex items-center gap-2"><PenLine size={20} className="text-saffron-600"/><h3 className="font-semibold">Cheque Payment Details</h3></div><p className="text-sm text-brown-500">Payable to <b>{manualMethods[2].payee}</b>.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label={<>Cheque Date<span className="text-red-600"> *</span></>}><Input type="date" value={manual.date} onChange={e=>setManual(m=>({...m,date:e.target.value}))}/></Field>
          <Field label={<>Cheque Number<span className="text-red-600"> *</span></>}><Input value={manual.chequeNo} onChange={e=>setManual(m=>({...m,chequeNo:e.target.value}))}/></Field>
          <Field label={<>Bank Name<span className="text-red-600"> *</span></>}><Input value={manual.bankName} onChange={e=>setManual(m=>({...m,bankName:e.target.value}))}/></Field>
          <Field label="Branch"><Input value={manual.branch} onChange={e=>setManual(m=>({...m,branch:e.target.value}))}/></Field>
          <Field label="Amount (₹)"><Input value={total} disabled/></Field>
          <FileField label="Upload Payment Proof" required hint="PDF, JPG, PNG (Max 5MB)"/></div></div>}

      <div className="mt-4 space-y-2"><div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-sm text-blue-900"><Info size={16} className="mt-0.5 shrink-0"/><span><b>Payment submitted successfully after verification only.</b> Your subscription / sponsorship will be activated and commission will be released after our accounts team verifies the payment details and proof.</span></div>
        <div className="flex items-start gap-2 rounded-xl bg-gold-300/25 p-3 text-sm text-brown-700"><UserRound size={16} className="mt-0.5 shrink-0 text-saffron-600"/><span><b>Internal approval required.</b> Payment details will be reviewed by our accountant/admin team. You'll be notified via email and in-app once the payment is verified.</span></div></div>
      <button onClick={submitPayment} className="btn-p mt-4 w-full !py-3">Submit for Verification <ArrowRight size={16}/></button>
    </>)}

    {/* ---------------- STEP 4 · REVIEW / RESULT ---------------- */}
    {step===4 && temple && <>
      {status==='approved' && billingOnly ? <>
        <div className="flex items-center justify-between"><div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-emerald-800"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-white"><Check size={20}/></span><div><b>Billing App Activated</b><p className="text-sm">Your payment is successful and the Billing App is now activated.</p></div></div></div>
        <div className="mt-5"><TempleSummaryCard temple={temple}/></div>
        <div className="card mt-5 p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Monitor size={20} className="text-saffron-600"/><b>TempleAddress Mini Billing App</b></div><Pill tone="gold">One Time</Pill></div>
          <dl className="mt-3 divide-y divide-brown-100 text-sm">
            <div className="flex justify-between py-2"><dt className="text-brown-500">Product</dt><dd>TempleAddress Mini Billing App</dd></div>
            <div className="flex justify-between py-2"><dt className="text-brown-500">License Type</dt><dd>One-Time (Lifetime License)</dd></div>
            <div className="flex justify-between py-2"><dt className="text-brown-500">Linked Temple Code</dt><dd className="font-semibold">{temple.code}</dd></div>
            <div className="flex justify-between gap-3 py-2"><dt className="shrink-0 text-brown-500">Linked Temple UUID</dt><dd className="truncate font-mono text-xs">{temple.uuid}</dd></div>
            <div className="flex items-center justify-between py-2"><dt className="text-brown-500">Activation Status</dt><dd><Pill tone="ok"><Check size={12}/>Active</Pill></dd></div></dl>
          <div className="mt-4 flex flex-wrap gap-2"><button onClick={()=>toast('Download started (prototype — no real file)')} className="btn-p"><Download size={16}/>Download Billing App</button><button onClick={()=>toast('Activation details copied')} className="btn-g"><Copy size={16}/>Copy Activation Details</button></div>
          <p className="mt-2 text-xs text-brown-500">Use the download link and activation details above to activate the offline software on your temple computer. One system per licence.</p></div>
        <div className="card mt-5 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Order Summary</h3><div className="mt-1 text-sm text-brown-600">Billing App (One-Time) {rs(subtotal)} + GST {rs(gst)}</div><div className="text-lg font-bold">Total Paid {rs(total)}</div></div><Pill tone="ok"><Check size={12}/>Payment Successful</Pill></div></div>
        <button onClick={()=>nav('/partner')} className="btn-p mt-5 w-full !py-3">Go to Dashboard <ArrowRight size={16}/></button>
      </> : <>
        <div className={`flex items-center gap-3 rounded-2xl p-4 ${status==='approved'?'bg-emerald-50 text-emerald-800':status==='rejected'?'bg-red-50 text-red-800':'bg-saffron-50 text-saffron-800'}`}>
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-white ${status==='approved'?'bg-emerald-500':status==='rejected'?'bg-red-500':'bg-saffron-500'}`}>{status==='approved'?<Check size={20}/>:status==='rejected'?<X size={20}/>:<Info size={20}/>}</span>
          <div><b>{status==='received'?'Payment Received':status==='submitted'?'Payment Submitted':status==='approved'?'Subscription Active':'Payment Rejected'}</b>
            <p className="text-sm">{status==='approved'?`${sponsorship?'Sponsorship':checkoutPlans[product].name} is now active for ${sponsorship?sponsored.length+' temple(s)':temple.name}.`:status==='rejected'?'The payment could not be verified. The partner can retry from the Payment step.':'Verification Pending — our accounts team will confirm shortly.'}</p></div></div>

        <div className="mt-5"><TempleSummaryCard temple={temple} planPill={checkoutPlans[product].name}/></div>
        <div className="card mt-5 p-5"><h3 className="font-semibold">Commission</h3><p className="text-sm text-brown-500">Calculated on the base amount of {rs(subtotal)}, released only after payment approval.</p><div className="mt-3"><CommissionPreview base={subtotal} status={status}/></div></div>
        <div className="card mt-5 p-5"><h3 className="font-semibold">Order Summary</h3><div className="mt-2 divide-y divide-brown-100 text-sm">
          <div className="flex justify-between py-2"><span>{sponsorship?`Sponsorship (${sponsored.length} temples)`:checkoutPlans[product].name}</span><span>{rs(subtotal)}</span></div>
          <div className="flex justify-between py-2"><span>GST (18%)</span><span>{rs(gst)}</span></div></div>
          <div className="mt-2 flex justify-between border-t-2 border-brown-900 pt-3 text-lg font-bold"><span>Total Paid</span><span>{rs(total)}</span></div></div>

        {(status==='received'||status==='submitted') && <div className="card mt-5 p-5"><h3 className="font-semibold">Prototype: simulate accounts-team action</h3><p className="text-sm text-brown-500">In production, staff approve this from Accountant view. Here you can simulate either outcome.</p>
          <div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>simulate('approved')} className="btn-p"><Check size={16}/>Simulate Approval</button><button onClick={()=>simulate('rejected')} className="btn-g">Simulate Rejection</button></div></div>}
        {status==='rejected' && <button onClick={()=>setStep(3)} className="btn-p mt-5 w-full !py-3">Retry Payment</button>}
        {status==='approved' && <button onClick={()=>nav('/partner')} className="btn-p mt-5 w-full !py-3">Go to Dashboard <ArrowRight size={16}/></button>}
      </>}
    </>}
  </Wrap></PublicShell>)
}
