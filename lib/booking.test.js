import test from 'node:test'
import assert from 'node:assert/strict'
import { bookingCartIssue, bookingReceiptRows, unavailable, upsertBookingItem } from './booking.js'
import { temples } from './data.js'
const temple = {code:'T1',bookable:true,cutoff:'8:00 PM'}
const pooja = {code:'P1',name:'Dhara',bookable:true,bookingType:'Online',startTime:'7:00 AM',endTime:'9:00 AM',live:true,dailyLimit:2}
const now = new Date('2026-09-20T08:00:00+05:30')
test('live slot open until end, not after end', () => {
  assert.equal(unavailable(temple,pooja,'2026-09-20',1,[],now),'')
  assert.match(unavailable(temple,pooja,'2026-09-20',1,[],new Date('2026-09-20T09:00:00+05:30')),/ended/)
})
test('past, offline and invalid quantities blocked', () => {
  assert.match(unavailable(temple,pooja,'2026-09-19',1,[],now),/future/)
  assert.match(unavailable(temple,{...pooja,bookingType:'Offline'},'2026-09-21',1,[],now),/unavailable/)
  assert.match(unavailable(temple,pooja,'2026-09-21',0,[],now),/Quantity/)
})
test('non-live advance deadline and capacity enforced', () => {
  assert.match(unavailable(temple,{...pooja,live:false,minBookingTime:'2 days ahead'},'2026-09-21',1,[],now),/2 calendar days/)
  assert.equal(unavailable(temple,{...pooja,live:false,minBookingTime:'2 days ahead'},'2026-09-23',1,[],now),'')
  const records = [{status:'paid',templeCode:'T1',poojaCode:'P1',dates:['2026-09-21'],quantity:2}]
  assert.match(unavailable(temple,pooja,'2026-09-21',1,records,now),/0 places/)
})

test('same-day booking has no implicit 24-hour lock; explicit cutoffs still apply', () => {
  const beforeStart = new Date('2026-09-20T06:30:00+05:30')
  const dayBefore = new Date('2026-09-20T22:00:00+05:30')
  assert.equal(unavailable(temple,{...pooja,live:false,minBookingTime:'Same day, before chart closes'},'2026-09-20',1,[],beforeStart),'')
  assert.equal(unavailable(temple,{...pooja,live:false,minBookingTime:'1 day ahead'},'2026-09-21',1,[],dayBefore),'')
  assert.match(unavailable(temple,{...pooja,live:false,cutoffHours:24},'2026-09-21',1,[],dayBefore),/24 hours/)
})
test('blocked dates and weekday restrictions enforced', () => {
  assert.match(unavailable(temple,{...pooja,unavailableDates:['2026-09-21']},'2026-09-21',1,[],now),/unavailable/)
  assert.match(unavailable(temple,{...pooja,availableWeekdays:[5]},'2026-09-21',1,[],now),/weekday/)
})

test('capacity counts all line items in a paid booking without double counting its legacy fields', () => {
  const secondPooja = {...pooja,code:'P2',dailyLimit:1}
  const record = {status:'paid',templeCode:'T1',poojaCode:'P1',dates:['2026-09-21'],quantity:1,items:[
    {code:'P1',dates:['2026-09-21'],quantity:1},
    {code:'P2',dates:['2026-09-21'],quantity:1},
  ]}
  assert.equal(unavailable(temple,pooja,'2026-09-21',1,[record],now),'')
  assert.match(unavailable(temple,secondPooja,'2026-09-21',1,[record],now),/0 places/)
})

test('cart availability accounts for another devotee booking the same pooja', () => {
  const cartTemple = {...temple,poojas:[pooja]}
  const items = [
    {id:'first',code:'P1',name:'Devotee A',date:'2026-09-21',dates:['2026-09-21'],quantity:1},
    {id:'second',code:'P1',name:'Devotee B',date:'2026-09-21',dates:['2026-09-21'],quantity:2},
  ]
  assert.deepEqual(bookingCartIssue(cartTemple,items,[],now),{id:'first',reason:'Dhara: Only 0 places remain for this date.'})
  assert.equal(bookingCartIssue(cartTemple,[{...items[0],quantity:1},{...items[1],quantity:1}],[],now),null)
  assert.equal(bookingCartIssue({...cartTemple,poojas:[pooja,{...pooja,code:'P2',name:'Rudrabhishekam'}]},[items[0],{...items[1],code:'P2',quantity:1}],[],now),null)
})

test('two Bilathikulam poojas retain separate devotees on the receipt', () => {
  const bilathikulam = temples.find(item => item.code === 'T1044')
  const selections = [
    {id:'dhara',code:'T1044-P1',name:'Achu',kind:'Nakshatra',ritual:'Chothi',date:'2026-10-04',dates:['2026-10-04'],quantity:1,prasadCollection:'Collect at Counter'},
    {id:'koovalamala',code:'T1044-P3',name:'Ravi',kind:'Rashi',ritual:'Mesha',date:'2026-10-13',dates:['2026-10-13'],quantity:1,prasadCollection:'Collect at Counter'},
  ]
  assert.equal(bookingCartIssue(bilathikulam,selections,[],new Date('2026-10-03T12:00:00+05:30')),null)
  const items = selections.map(item => {
    const selectedPooja = bilathikulam.poojas.find(p => p.code === item.code)
    return {...item,pooja:selectedPooja.name,unitPrice:selectedPooja.price,slot:`${selectedPooja.startTime} - ${selectedPooja.endTime} IST`}
  })
  const rows = bookingReceiptRows({items})
  assert.equal(rows.length,2)
  assert.deepEqual(rows.map(row => [row.pooja,row.devoteeName,row.ritual,row.amount]),[
    ['Dhara','Achu','Nakshatra: Chothi',40],
    ['Koovalamala','Ravi','Rashi: Mesha',30],
  ])
  assert.equal(rows.reduce((sum,row) => sum + row.amount,0),70)
})

test('adding a second pooja appends it; editing one preserves the other devotee', () => {
  const first = {id:'dhara',code:'T1044-P1',name:'Achu'}
  const second = {id:'koovalamala',code:'T1044-P3',name:'Ravi'}
  const selected = upsertBookingItem(upsertBookingItem([],first),second)
  assert.deepEqual(selected,[first,second])
  assert.deepEqual(upsertBookingItem(selected,{...second,name:'Ravikumar'},second.id),[first,{...second,name:'Ravikumar'}])
})

test('older single-pooja receipts still render one row', () => {
  const rows = bookingReceiptRows({poojaCode:'P1',pooja:'Dhara',name:'Achu',kind:'Nakshatra',ritual:'Chothi',dates:['2026-10-04'],slot:'5:30 AM - 6:00 AM IST',quantity:1,unitPrice:40})
  assert.equal(rows.length,1)
  assert.equal(rows[0].devoteeName,'Achu')
  assert.equal(rows[0].amount,40)
})

test('earliest pooja date respects the 7:30 PM lock and lead time', async () => {
  const { earliestDate } = await import('./booking-dates.js')
  const at = iso => new Date(iso)
  assert.equal(earliestDate({ lead_time_hours: 8 }, at('2026-10-30T06:00:00+05:30')), '2026-10-31')
  assert.equal(earliestDate({ lead_time_hours: 8 }, at('2026-10-30T19:45:00+05:30')), '2026-11-01')
  assert.equal(earliestDate({ lead_time_hours: 72 }, at('2026-10-30T06:00:00+05:30')), '2026-11-02')
  assert.equal(earliestDate({ is_live: true }, at('2026-10-30T21:00:00+05:30')), '2026-10-30')
  assert.equal(earliestDate({ lead_time_hours: 24, start_time: '06:00:00' }, at('2026-10-30T06:00:00+05:30')), '2026-11-01')
  assert.equal(earliestDate({ lead_time_hours: 24, start_time: '06:00:00' }, at('2026-10-30T05:00:00+05:30')), '2026-10-31')
})
