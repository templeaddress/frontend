'use client'
import React, {useEffect, useMemo, useState} from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import {SShell} from './partners'
import {Table, Pill, Field, Input} from '@/components/ui'
import {temples} from '@/lib/data'

const people = [
  {id:'U10084',name:'Jinsha K',type:'Partner',code:'JIN-4471',mobile:'+91 ••••••1196',email:'jinsha@example.com',auth:'Mobile OTP',verification:'KYC verified',dealer:'DLR-KZN-014',balance:6840,joined:'18 Mar 2026'},
  {id:'U10085',name:'Sangeetha P',type:'Partner',code:'SAN-0932',mobile:'+91 ••••••0932',email:'sangeetha@example.com',auth:'Google',verification:'KYC verified',dealer:'DLR-KZN-014',balance:2210,joined:'04 Apr 2026'},
  {id:'U10086',name:'Arun K',type:'Partner',code:'ARU-2210',mobile:'+91 ••••••2210',email:'arun@example.com',auth:'Mobile OTP',verification:'Under review',dealer:'DLR-KZE-009',balance:1480,joined:'16 May 2026'},
  {id:'U10087',name:'Rahul K',type:'Dealer',code:'DLR-KZN-014',mobile:'+91 ••••••9902',email:'rahul@example.com',auth:'Mobile OTP',verification:'KYC verified',balance:18320,joined:'02 Feb 2026'},
  {id:'U10088',name:'Deepa K',type:'Dealer',code:'DLR-KZE-009',mobile:'+91 ••••••9910',email:'deepa@example.com',auth:'Google',verification:'KYC verified',balance:12140,joined:'12 Feb 2026'},
  {id:'U10089',name:'Nishanth K',type:'Vendor',code:'T1028',mobile:'+91 ••••••3312',email:'secretary@kottur.example',auth:'Mobile OTP',verification:'Listing + KYC verified',joined:'10 Jan 2026'},
  {id:'U10090',name:'Prasad Nambeesan',type:'Vendor',code:'S1047',mobile:'+91 ••••••2184',email:'prasad@example.com',auth:'Google',verification:'Listing verified · KYC pending',joined:'20 Jul 2026'},
  {id:'U10091',name:'Meera Devi',type:'Vendor',code:'F1022',mobile:'+91 ••••••6617',email:'convenor@attukal.example',auth:'Mobile OTP',verification:'Listing verified',joined:'02 Aug 2026'},
  {id:'U10418',name:'Suresh P',type:'User',code:'U10418',mobile:'+91 ••••••3312',email:'suresh@example.com',auth:'Google',verification:'Email verified',joined:'09 Sep 2026'},
  {id:'U10422',name:'Meera P',type:'User',code:'U10422',mobile:'+91 ••••••0411',email:'meera@example.com',auth:'Mobile OTP',verification:'Mobile verified',joined:'11 Sep 2026'}
]

const statuses=['Created','Payment pending','Payment confirmed','Scheduled','Canceled','Completed (Done)']
const transactionSeed = [
  ['TXN-260912-001','U10418','Booking','Payment confirmed',0,250,'Ganapathi Homam','Razorpay','pay_RP91301','UTIBRZP91301','BK-91301','Online payment captured','2026-09-12T09:42:00'],
  ['TXN-260912-002',null,'Donation','Payment confirmed',0,1000,'Annadanam donation','PayU','PAYU91302','HDFC-PYU-91302','DN-00231','Guest donor · 80G receipt issued','2026-09-12T10:18:00'],
  ['TXN-260912-003','U10422','Booking','Scheduled',1,500,'Rudrabhishekam','Razorpay','pay_RP91303','UTIBRZP91303','BK-91303','Pooja scheduled for 14 Sept','2026-09-12T10:51:00'],
  ['TXN-260912-004','U10418','Donation','Completed (Done)',2,750,'Bhagavathi Seva donation','Omniware','OMN91304','FED-OMN-91304','DN-00232','Receipt delivered by email','2026-09-12T11:07:00'],
  ['TXN-260912-005','U10084','Booking','Payment pending',3,150,'Pithru Tharpanam','PayU','PAYU91305','Pending','BK-91305','Gateway callback awaited','2026-09-12T11:32:00'],
  ['TXN-260912-006',null,'Booking','Created',0,120,'Palpayasam','Razorpay','Not created','Pending','BK-91306','Guest checkout · payment not started','2026-09-12T12:05:00'],
  ['TXN-260912-007','U10422','Booking','Canceled',0,1500,'Santhanagopala Pooja','Razorpay','pay_RP91307','UTIBRZP91307','BK-91307','Canceled by user · refund initiated','2026-09-12T12:44:00'],
  ['TXN-260912-008','U10085','Donation','Payment confirmed',1,2500,'Temple renovation donation','PayU','PAYU91308','HDFC-PYU-91308','DN-00233','PAN received · 80G receipt issued','2026-09-12T13:20:00'],
  ['TXN-260912-009','U10418','Booking','Completed (Done)',0,40,'Pushpanjali','Omniware','OMN91309','FED-OMN-91309','BK-91309','Included in chart CH-T1028-260912','2026-09-11T17:45:00'],
  ['TXN-260912-010','U10422','Donation','Payment pending',3,500,'General donation','Bank transfer','BANK91310','Pending','DN-00234','Bank reference requested from donor','2026-09-11T18:12:00']
]
const transactions=transactionSeed.map(([id,userId,type,status,templeIndex,amount,offering,gateway,gatewayId,bankId,bookingId,remarks,createdAt])=>({id,userId,type,status,listing:temples[templeIndex],amount,offering,gateway,gatewayId,bankId,bookingId,remarks,createdAt}))
const rewardKey='ta-special-rewards-v1'
const readRewards=()=>typeof window==='undefined'?[]:JSON.parse(window.localStorage.getItem(rewardKey)||'[]')
const money=n=>'₹'+Number(n).toLocaleString('en-IN',{maximumFractionDigits:2})
const personById=id=>people.find(person=>person.id===id)
const dateTime=value=>new Date(value).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})
const statusTone=status=>status.includes('confirmed')||status.includes('Completed')?'ok':status.includes('pending')||status==='Scheduled'?'warn':status==='Canceled'?'err':'info'

const bookingSeed = [
  {id:'BK-91301',devotee:'Suresh P',userId:'U10418',mobile:'+91 ••••••3312',listing:temples[0],offering:'Ganapathi Homam',bookingDate:'14 Sept 2026',slot:'6:00 AM – 6:45 AM',nakshatra:'Rohini',quantity:1,amount:250,status:'Scheduled',paymentStatus:'Paid',gateway:'Razorpay',paymentReference:'pay_RP91301',createdAt:'12 Sept 2026 · 09:42 AM',remarks:'Included in the next pooja chart.'},
  {id:'BK-91303',devotee:'Meera P',userId:'U10422',mobile:'+91 ••••••0411',listing:temples[2],offering:'Rudrabhishekam',bookingDate:'14 Sept 2026',slot:'6:00 AM – 7:00 AM',nakshatra:'Uthram',quantity:1,amount:500,status:'Scheduled',paymentStatus:'Paid',gateway:'Razorpay',paymentReference:'pay_RP91303',createdAt:'12 Sept 2026 · 10:51 AM',remarks:'Devotee details verified.'},
  {id:'BK-91305',devotee:'Jinsha K',userId:'U10084',mobile:'+91 ••••••1196',listing:temples[3],offering:'Pithru Tharpanam',bookingDate:'16 Sept 2026',slot:'6:00 AM – 8:00 AM',nakshatra:'Anizham',quantity:1,amount:150,status:'Payment pending',paymentStatus:'Awaiting gateway callback',gateway:'PayU',paymentReference:'PAYU91305',createdAt:'12 Sept 2026 · 11:32 AM',remarks:'Payment link remains available.'},
  {id:'BK-91306',devotee:'Guest devotee',userId:null,mobile:'Not provided',listing:temples[0],offering:'Palpayasam',bookingDate:'15 Sept 2026',slot:'8:00 AM – 8:30 AM',nakshatra:'Chothi',quantity:1,amount:120,status:'Created',paymentStatus:'Not started',gateway:'Razorpay',paymentReference:'Not created',createdAt:'12 Sept 2026 · 12:05 PM',remarks:'Guest checkout; payment has not started.'},
  {id:'BK-91309',devotee:'Suresh P',userId:'U10418',mobile:'+91 ••••••3312',listing:temples[0],offering:'Pushpanjali',bookingDate:'12 Sept 2026',slot:'7:00 AM – 9:00 AM',nakshatra:'Rohini',quantity:1,amount:40,status:'Completed (Done)',paymentStatus:'Paid',gateway:'Omniware',paymentReference:'OMN91309',createdAt:'11 Sept 2026 · 05:45 PM',remarks:'Included in chart CH-T1028-260912.'},
  {id:'BK-91307',devotee:'Meera P',userId:'U10422',mobile:'+91 ••••••0411',listing:temples[1],offering:'Santhanagopala Pooja',bookingDate:'20 Sept 2026',slot:'6:00 AM – 8:00 AM',nakshatra:'Bharani',quantity:1,amount:1500,status:'Canceled',paymentStatus:'Refund initiated',gateway:'Razorpay',paymentReference:'pay_RP91307',createdAt:'12 Sept 2026 · 12:44 PM',remarks:'Canceled by devotee; refund initiated.'}
]

function FilterChips({options,value,onChange,name}){
  return <fieldset className="flex flex-wrap gap-2"><legend className="sr-only">Filter records</legend>{options.map(option=><label key={option} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-semibold ${value===option?'border-brown-900 bg-brown-900 text-white':'border-brown-200 bg-white text-brown-700 hover:bg-brown-50'}`}><input className="sr-only" type="radio" name={name} checked={value===option} onChange={()=>onChange(option)}/>{option}</label>)}</fieldset>
}

function SortHeading({label,column,sort,setSort}){
  const active=sort.key===column
  return <button type="button" onClick={()=>setSort({key:column,direction:active&&sort.direction==='asc'?'desc':'asc'})} className="inline-flex items-center gap-1 text-left font-semibold" aria-label={`Sort by ${label}`}><span>{label}</span><span aria-hidden className={active?'text-saffron-600':'text-brown-300'}>{active?(sort.direction==='asc'?'↑':'↓'):'↕'}</span></button>
}

function DetailItem({label,children}){
  return <div><dt className="text-xs font-semibold uppercase tracking-wide text-brown-500">{label}</dt><dd className="mt-1 text-sm font-medium text-brown-900">{children||'—'}</dd></div>
}

function Modal({label,onClose,children,max='max-w-4xl'}){
  return <div role="dialog" aria-modal="true" aria-label={label} className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 md:p-8" onMouseDown={event=>event.target===event.currentTarget&&onClose()}><div className={`card mx-auto ${max} p-5 md:p-6`}><button className="btn-g float-right" onClick={onClose}>Close</button>{children}</div></div>
}

export function StaffDirectory(){
  const {kind}=useParams(); const sp = useSearchParams()
  const role=sp.get('role')||'moderator',isTx=kind==='transactions'
  const [search,setSearch]=useState(''),[filter,setFilter]=useState('All'),[typeFilter,setTypeFilter]=useState('All'),[page,setPage]=useState(1)
  const [sort,setSort]=useState(isTx?{key:'createdAt',direction:'desc'}:{key:'name',direction:'asc'})
  const [selectedTransaction,setSelectedTransaction]=useState(null),[profile,setProfile]=useState(null),[reward,setReward]=useState(false)
  const [amount,setAmount]=useState(''),[reason,setReason]=useState(''),[campaign,setCampaign]=useState(''),[listing,setListing]=useState('')
  const [error,setError]=useState(''),[records,setRecords]=useState(()=>{try{return readRewards()}catch{return []}})
  const title={users:'All users',transactions:'All transactions'}[kind]
  useEffect(()=>{setSearch('');setFilter('All');setTypeFilter('All');setPage(1);setSort(isTx?{key:'createdAt',direction:'desc'}:{key:'name',direction:'asc'});setSelectedTransaction(null);setProfile(null);setReward(false)},[kind,isTx])
  const balance=person=>(person.balance||0)+records.reduce((total,record)=>total+(record.partnerId===person.code?record.amount:record.dealerId===person.code?record.dealerAmount:0),0)
  const changeFilter=(setter,value)=>{setter(value);setPage(1)}
  const filtered=useMemo(()=>{
    const query=search.trim().toLowerCase(),source=isTx?transactions:people
    const result=source.filter(record=>{
      if(isTx&&filter!=='All'&&record.status!==filter)return false
      if(isTx&&typeFilter!=='All'&&record.type!==typeFilter)return false
      if(!isTx&&filter!=='All'&&record.type!==filter)return false
      const relatedUser=isTx?(personById(record.userId)?.name||'Guest'):''
      return !query||`${JSON.stringify(record)} ${relatedUser}`.toLowerCase().includes(query)
    })
    return [...result].sort((a,b)=>{
      let av=a[sort.key],bv=b[sort.key]
      if(sort.key==='user'){av=personById(a.userId)?.name||'Guest';bv=personById(b.userId)?.name||'Guest'}
      if(sort.key==='listing'){av=a.listing?.name||'';bv=b.listing?.name||''}
      if(sort.key==='profile'){av=a.code;bv=b.code}
      if(typeof av==='number'&&typeof bv==='number')return sort.direction==='asc'?av-bv:bv-av
      const compared=String(av??'').localeCompare(String(bv??''),undefined,{numeric:true,sensitivity:'base'})
      return sort.direction==='asc'?compared:-compared
    })
  },[isTx,search,filter,typeFilter,sort])
  const pageSize=5,pages=Math.max(1,Math.ceil(filtered.length/pageSize)),current=Math.min(page,pages),visible=filtered.slice((current-1)*pageSize,current*pageSize)
  const closeProfile=()=>{setProfile(null);setReward(false);setError('')}
  const openUser=user=>{setProfile(user);setReward(false);setSelectedTransaction(null)}
  const openTransaction=transaction=>{setSelectedTransaction(transaction);setProfile(null)}
  async function post(event){
    event.preventDefault()
    const code=campaign.trim().toUpperCase(),value=Number(amount)
    if(!code||!reason.trim()||!listing||!Number.isFinite(value)||value<=0||!/^\d+(\.\d{1,2})?$/.test(amount)){setError('Enter a positive amount (up to two decimals), reason, campaign ID and listing.');return}
    const save=()=>{const existing=readRewards();if(existing.some(record=>record.campaign===code))throw new Error('Campaign ID already used. Enter a new one-time code.');const now=new Date();const transactionId=`WLT-${now.toISOString().slice(2,10).replaceAll('-','')}-${now.getTime().toString().slice(-6)}`;const entry={id:crypto.randomUUID(),transactionId,date:now.toISOString(),staffName:'Anand',staffId:'STF-1001',staffRole:role,partnerId:profile.code,partnerUserId:profile.id,partnerName:profile.name,dealerId:profile.dealer,amount:value,dealerAmount:Math.round(value*10)/100,reason:reason.trim(),campaign:code,listing};const next=[entry,...existing];localStorage.setItem(rewardKey,JSON.stringify(next));setRecords(next)}
    try{if(navigator.locks)await navigator.locks.request(rewardKey,save);else save();setReward(false);setAmount('');setReason('');setCampaign('');setListing('');setError('')}catch(postError){setError(postError.message)}
  }
  if(!title||!['admin','moderator'].includes(role))return <SShell><p>This directory is available to moderators and portal admins.</p></SShell>
  const userColumns=[['User ID','id'],['Name','name'],['Profile ID','profile'],['Role','type'],['Authentication','auth'],['Verification','verification']]
  const txColumns=[['Transaction ID','id'],['Type','type'],['User / guest','user'],['Listing · ID','listing'],['Date & time','createdAt'],['Amount','amount'],['Status','status']]
  return <SShell><h1 className="text-2xl font-semibold">{title}</h1><p className="mb-5 text-sm text-brown-500">{isTx?'Search, filter and sort every booking and donation payment. Open a row for its complete transaction trail.':'Search, filter and sort all users, partners, dealers and vendors. Open a row for contact, verification, booking and transaction details.'}</p>
    <section className="card overflow-hidden" aria-label={title}><div className="space-y-3 border-b border-brown-100 p-4"><Input aria-label="Search directory" placeholder={isTx?'Search transaction, user, listing, booking ID or gateway':'Search name, user ID, profile ID, contact or verification'} value={search} onChange={event=>{setSearch(event.target.value);setPage(1)}}/><div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center"><FilterChips name="directory-filter" options={isTx?['All',...statuses]:['All','User','Partner','Dealer','Vendor']} value={filter} onChange={value=>changeFilter(setFilter,value)}/>{isTx&&<FilterChips name="transaction-type" options={['All','Booking','Donation']} value={typeFilter} onChange={value=>changeFilter(setTypeFilter,value)}/>}</div></div>
      <div className="overflow-x-auto"><table className="w-full border-separate border-spacing-0"><thead><tr>{(isTx?txColumns:userColumns).map(([label,column])=><th className="th" key={column}><SortHeading label={label} column={column} sort={sort} setSort={next=>{setSort(next);setPage(1)}}/></th>)}<th className="th">Action</th></tr></thead><tbody>{visible.map(record=>isTx?<tr key={record.id} className="cursor-pointer transition hover:bg-brown-50" onClick={()=>openTransaction(record)}>{[record.id,record.type,personById(record.userId)?.name||'Guest',`${record.listing.name} · ${record.listing.code}`,dateTime(record.createdAt),money(record.amount),<Pill tone={statusTone(record.status)}>{record.status}</Pill>,<button className="btn-g !px-3 !py-1.5" onClick={event=>{event.stopPropagation();openTransaction(record)}}>View details</button>].map((cell,index)=><td className="td" key={index}>{cell}</td>)}</tr>:<tr key={record.id} className="cursor-pointer transition hover:bg-brown-50" onClick={()=>openUser(record)}>{[record.id,record.name,record.code,record.type,record.auth,<Pill tone={record.verification.includes('pending')||record.verification==='Under review'?'warn':'ok'}>{record.verification}</Pill>,<button className="btn-g !px-3 !py-1.5" onClick={event=>{event.stopPropagation();openUser(record)}}>View details</button>].map((cell,index)=><td className="td" key={index}>{cell}</td>)}</tr>)}</tbody></table></div>
      {!filtered.length&&<p className="p-5 text-sm text-brown-500">No matching records.</p>}<div className="flex flex-col gap-3 border-t border-brown-100 px-4 py-3 text-sm text-brown-500 sm:flex-row sm:items-center sm:justify-between"><span>{filtered.length?`${(current-1)*pageSize+1}–${Math.min(current*pageSize,filtered.length)} of ${filtered.length}`:'0 records'}</span><div className="flex items-center gap-2"><button className="btn-g !px-3 !py-1.5" disabled={current===1} onClick={()=>setPage(value=>Math.max(1,value-1))}>Previous</button><span>Page {current} of {pages}</span><button className="btn-g !px-3 !py-1.5" disabled={current===pages} onClick={()=>setPage(value=>Math.min(pages,value+1))}>Next</button></div></div></section>
    {selectedTransaction&&<TransactionModal transaction={selectedTransaction} onClose={()=>setSelectedTransaction(null)} onOpenUser={openUser}/>}
    {profile&&<UserModal profile={profile} role={role} balance={balance(profile)} records={records} reward={reward} setReward={setReward} form={{amount,setAmount,reason,setReason,campaign,setCampaign,listing,setListing,error,post}} onClose={closeProfile} onOpenTransaction={openTransaction}/>}
  </SShell>
}

export function StaffBookingsDirectory(){
  const sp = useSearchParams(),role=sp.get('role')||'moderator'
  const [search,setSearch]=useState(''),[filter,setFilter]=useState('All')
  const filtered=bookingSeed.filter(booking=>{
    if(filter!=='All'&&booking.status!==filter)return false
    const query=search.trim().toLowerCase()
    return !query||JSON.stringify(booking).toLowerCase().includes(query)
  })
  if(!['admin','moderator'].includes(role))return <SShell><p>This directory is available to moderators and portal admins.</p></SShell>
  const statuses=['All',...new Set(bookingSeed.map(booking=>booking.status))]
  const rows=filtered.map(booking=>[
    <span className="font-semibold text-saffron-700">{booking.id}</span>,
    booking.devotee,
    `${booking.listing.name} · ${booking.listing.code}`,
    booking.offering,
    booking.bookingDate,
    money(booking.amount),
    <Pill tone={statusTone(booking.status)}>{booking.status}</Pill>,
    <button type="button" className="btn-g !px-3 !py-1.5">View details</button>
  ])
  return <SShell><h1 className="text-2xl font-semibold">Bookings</h1><p className="mb-5 text-sm text-brown-500">Search and review booking records. Open a booking to view its devotee, pooja, payment and schedule details.</p>
    <section className="card overflow-hidden" aria-label="Bookings directory"><div className="space-y-3 border-b border-brown-100 p-4"><Input aria-label="Search bookings" placeholder="Search booking, devotee, temple, pooja or payment reference" value={search} onChange={event=>setSearch(event.target.value)}/><FilterChips name="booking-status" options={statuses} value={filter} onChange={setFilter}/></div>
      <Table title="Booking details" head={['Booking ID','Devotee','Temple · ID','Pooja / service','Booking date','Amount','Status','Action']} rows={rows} rowDetails={filtered.map(booking=>({'Devotee':booking.devotee,'User ID':booking.userId||'Guest checkout','Mobile':booking.mobile,'Pooja slot':booking.slot,'Nakshatra':booking.nakshatra,'Quantity':booking.quantity,'Payment status':booking.paymentStatus,'Payment gateway':booking.gateway,'Payment reference':booking.paymentReference,'Created':booking.createdAt,'Remarks':booking.remarks}))}/>
      {!filtered.length&&<p className="p-5 text-sm text-brown-500">No matching bookings.</p>}
      <div className="border-t border-brown-100 px-4 py-3 text-sm text-brown-500">{filtered.length} of {bookingSeed.length} bookings</div>
    </section>
  </SShell>
}

function TransactionModal({transaction,onClose,onOpenUser}){
  const user=personById(transaction.userId)
  return <Modal label="Transaction details" onClose={onClose}><div className="pr-24"><p className="text-xs font-semibold uppercase tracking-wide text-saffron-600">Transaction details</p><h2 className="mt-1 text-xl font-semibold">{transaction.id}</h2><div className="mt-2 flex flex-wrap gap-2"><Pill tone={statusTone(transaction.status)}>{transaction.status}</Pill><Pill>{transaction.type}</Pill></div></div>
    <dl className="mt-6 grid gap-5 rounded-2xl bg-brown-50 p-5 sm:grid-cols-2 lg:grid-cols-3"><DetailItem label="User / guest">{user?<button className="font-semibold text-saffron-700 underline" onClick={()=>onOpenUser(user)}>{user.name} · {user.id}</button>:'Guest checkout'}</DetailItem><DetailItem label="Selected listing">{transaction.listing.name} · {transaction.listing.code}</DetailItem><DetailItem label={transaction.type==='Booking'?'Pooja / service':'Donation purpose'}>{transaction.offering}</DetailItem><DetailItem label="Payment amount">{money(transaction.amount)}</DetailItem><DetailItem label="Payment gateway">{transaction.gateway}</DetailItem><DetailItem label="Date & time">{dateTime(transaction.createdAt)}</DetailItem><DetailItem label="Transaction ID">{transaction.id}</DetailItem><DetailItem label="Gateway payment ID">{transaction.gatewayId}</DetailItem><DetailItem label="Gateway / bank ID">{transaction.bankId}</DetailItem><DetailItem label="Booking / donation ID">{transaction.bookingId}</DetailItem><DetailItem label="Payment status"><Pill tone={statusTone(transaction.status)}>{transaction.status}</Pill></DetailItem><DetailItem label="Remarks">{transaction.remarks}</DetailItem></dl>
  </Modal>
}

function UserModal({profile,role,balance,records,reward,setReward,form,onClose,onOpenTransaction}){
  const activity=transactions.filter(transaction=>transaction.userId===profile.id),bookings=activity.filter(transaction=>transaction.type==='Booking')
  return <Modal label="User details" onClose={onClose}><div className="pr-24"><p className="text-xs font-semibold uppercase tracking-wide text-saffron-600">User details</p><h2 className="mt-1 text-xl font-semibold">{profile.name} · {profile.code}</h2><div className="mt-2 flex flex-wrap gap-2"><Pill>{profile.type}</Pill><Pill tone={profile.verification.includes('pending')||profile.verification==='Under review'?'warn':'ok'}>{profile.verification}</Pill></div></div>
    <h3 className="mt-6 font-semibold">Basic contact & verification</h3><dl className="mt-3 grid gap-5 rounded-2xl bg-brown-50 p-5 sm:grid-cols-2 lg:grid-cols-3"><DetailItem label="User ID">{profile.id}</DetailItem><DetailItem label="Profile / listing ID">{profile.code}</DetailItem><DetailItem label="Joined">{profile.joined}</DetailItem><DetailItem label="Mobile">{profile.mobile}<span className="block text-xs text-brown-500">{profile.auth==='Mobile OTP'?'OTP verified':'Not OTP verified'}</span></DetailItem><DetailItem label="Email">{profile.email}<span className="block text-xs text-brown-500">{profile.auth==='Google'?'Google authenticated':'Email not independently verified'}</span></DetailItem><DetailItem label="Verification status">{profile.verification}</DetailItem>{profile.dealer&&<DetailItem label="Linked dealer">{people.find(person=>person.code===profile.dealer)?.name} · {profile.dealer}</DetailItem>}{profile.balance!==undefined&&<DetailItem label="Wallet balance">{money(balance)}</DetailItem>}</dl>
    {profile.type==='Partner'&&<button className="btn-p mt-4" onClick={()=>setReward(true)}>Provide special reward points</button>}
    {reward&&<form onSubmit={form.post} className="mt-4 space-y-3 rounded-xl bg-brown-50 p-4"><h3 className="font-semibold">Special reward · 1 point = ₹1</h3><p className="text-xs">Staff: Anand · STF-1001 · {role}. Partner: {profile.name} · {profile.code}. Timestamp recorded when posted.</p><Field label="Reward point amount"><Input required type="number" min="0.01" step="0.01" value={form.amount} onChange={event=>form.setAmount(event.target.value)}/></Field><Field label="Reason"><Input required value={form.reason} onChange={event=>form.setReason(event.target.value)}/></Field><Field label="Campaign ID · one-time code"><Input required value={form.campaign} onChange={event=>form.setCampaign(event.target.value)}/></Field><Field label="Related listing"><select required className="input" value={form.listing} onChange={event=>form.setListing(event.target.value)}><option value="">Choose listing</option>{temples.map(temple=><option key={temple.code} value={temple.code}>{temple.name} · {temple.code}</option>)}</select></Field><p className="text-sm">Dealer receives an additional 10%: {money(Math.round((Number(form.amount)||0)*10)/100)}.</p>{form.error&&<p role="alert" className="text-red-700">{form.error}</p>}<button className="btn-p" type="submit">Post reward</button><button className="btn-g ml-2" type="button" onClick={()=>setReward(false)}>Cancel</button></form>}
    <div className="mt-6 grid gap-5 lg:grid-cols-2"><section><h3 className="mb-3 font-semibold">Bookings ({bookings.length})</h3>{bookings.length?<Table head={['Booking ID','Pooja','Amount','Status']} rows={bookings.map(transaction=>[<button key={transaction.bookingId} className="font-semibold text-saffron-700 underline" onClick={()=>onOpenTransaction(transaction)}>{transaction.bookingId}</button>,transaction.offering,money(transaction.amount),<Pill tone={statusTone(transaction.status)}>{transaction.status}</Pill>])}/>:<p className="rounded-xl bg-brown-50 p-4 text-sm text-brown-500">No bookings found.</p>}</section><section><h3 className="mb-3 font-semibold">Transactions ({activity.length})</h3>{activity.length?<Table head={['Transaction','Type','Amount','Status']} rows={activity.map(transaction=>[<button key={transaction.id} className="font-semibold text-saffron-700 underline" onClick={()=>onOpenTransaction(transaction)}>{transaction.id}</button>,transaction.type,money(transaction.amount),<Pill tone={statusTone(transaction.status)}>{transaction.status}</Pill>])}/>:<p className="rounded-xl bg-brown-50 p-4 text-sm text-brown-500">No transactions found.</p>}</section></div>
    {profile.balance!==undefined&&<section className="mt-6"><h3 className="font-semibold">Reward history</h3>{records.filter(record=>record.partnerId===profile.code||record.dealerId===profile.code).map(record=><div key={record.id} className="mt-3 border-t p-3 text-sm"><b>{record.campaign} · {money(record.partnerId===profile.code?record.amount:record.dealerAmount)}</b><p>Transaction ID: <b>{record.transactionId||`WLT-${String(record.id).slice(0,8).toUpperCase()}`}</b></p><p>{record.reason} · Listing {record.listing}</p><p>{new Date(record.date).toLocaleString()} · {record.staffName} · {record.staffId}</p></div>)}{!records.some(record=>record.partnerId===profile.code||record.dealerId===profile.code)&&<p className="mt-2 text-sm text-brown-500">No reward transactions recorded.</p>}</section>}
  </Modal>
}
