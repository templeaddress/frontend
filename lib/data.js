// ---------- INDIVIDUAL POOJA / OFFERING ITEM ----------
// Shared shape used by both a temple's poojas and a festival's offerings — the same
// "pooja item" concept, just sold in two different contexts.
//   Basic: code (unique per listing), name, category, price, bookingType, live
//   Advanced: purpose, startTime/endTime, minBookingTime, deity
// `live` is the "Live Booking" switch: when on, a devotee can book this item instantly at
// any time — even if the day's chart is already prepared or booking has otherwise closed for
// that date. The vendor gets an immediate email / SMS / WhatsApp notification, but the booking
// itself is only picked up in the temple/festival's NEXT chart for settlement — it never
// re-opens or edits a chart that has already been locked.
export const poojaCategories = ['Homam','Abhishekam','Archana','Pushpanjali','Seva','Neivedyam','Vazhipadu','Sponsorship','Festival ritual']
export const deityMasterData = [
  {name:'Lord Vishnu',ml:'വിഷ്ണു',active:true},
  {name:'Lord Shiva',ml:'ശിവൻ',active:true},
  {name:'Bhagavathi',ml:'ഭഗവതി',active:true},
  {name:'Lord Ganesh',ml:'ഗണപതി',active:true},
  {name:'Lord Krishna',ml:'കൃഷ്ണൻ',active:true},
  {name:'Sastha (Ayyappan)',ml:'ശാസ്താവ്',active:true},
  {name:'Naga',ml:'നാഗം',active:true},
  {name:'Subrahmanya',ml:'സുബ്രഹ്മണ്യൻ',active:true},
]
export const bookingTypeOptions = ['Online','Offline','Online & Offline']
const P = (code,name,ml,category,price,dailyLimit,opts={}) => ({
  code, name, ml, category, price, dailyLimit,
  bookingType: opts.bookingType || 'Online & Offline',
  live: !!opts.live, bookable: opts.bookable!==false,
  purpose: opts.purpose || '', startTime: opts.startTime || '', endTime: opts.endTime || '',
  minBookingTime: opts.minBookingTime || 'Same day, before chart closes', deity: opts.deity || '',
})

export const temples = [
  { slug:'kottur-sree-mahavishnu-temple', code:'T1028', name:'Kottur Sree Mahavishnu Temple', ml:'കൊട്ടൂർ ശ്രീ മഹാവിഷ്ണു ക്ഷേത്രം', district:'Kozhikode', place:'Ulliyeri', deity:'Lord Vishnu', others:['Lord Krishna','Lord Ganesh','Naga'],
    gateway:'razorpay', g80:true, plan:'Pro', sponsor:'Resurge India Foundation', bookable:true, cutoff:'8:00 PM', hue:'#7A5238', rating:4.8, reviews:212,
    category:'Hindu Temple', chiefPriest:'Krishnan Namboothiri (Melshanthi)', publicPhone:'+91 90123 45422', publicEmail:'office@kottursreemahavishnu.org', upiId:'kottursreemahavishnu@oksbi',
    timings:'5:30–9:30 AM · 5:30–7:30 PM', address:'Ulliyeri, Kottur (PO), Naduvannur (via), Kozhikode – 673614',
    about:'This temple stands in Kottur–Ulliyeri village near Naduvannur, Kozhikode. Mahavishnu is worshipped here as Santhanagopala Moorthy — the giver of children — and families from across Malabar come for Santhanagopala pooja.',
    story:'Legend says a Namboothiri of the Ulliyeri illam found a swayambhu idol while ploughing; the field is still called “Vishnu paadam”.',
    history:'About 2,000 years old and once the family temple of eight illams. In the social reform era, Pulliyilottu Narayanan Nambishan led a Pulaya youth into the temple pond in defiance of untouchability — an event remembered every year.',
    speciality:'Santhanagopala pooja for childless couples · Vedapatasala every Sunday · Ashtami Rohini festival',
    guidelines:'Traditional dress inside the nalambalam. Mobile phones on silent. No photography of the sanctum. Prasadam counter closes 15 min after each pooja.',
    remarks:'Ilaneer abhishekam is the most booked vazhipadu; book Udayasthamana pooja 7 days ahead.',
    nearby:['Thusharagiri waterfalls (28 km)','Kakkayam dam (34 km)','Lokanarkavu temple (22 km)'],
    poojas:[
      P('T1028-P1','Ganapathi Homam','ഗണപതി ഹോമം','Homam',250,20,{live:true,purpose:'Removes obstacles before any new undertaking',startTime:'6:00 AM',endTime:'6:45 AM',minBookingTime:'Instant · live booking',deity:'Lord Ganesh'}),
      P('T1028-P2','Ilaneer Abhishekam','ഇളനീർ അഭിഷേകം','Abhishekam',50,0,{purpose:'Tender-coconut bathing of the deity for peace and prosperity',startTime:'7:00 AM',endTime:'7:20 AM',deity:'Lord Vishnu'}),
      P('T1028-P3','Naalikeram Udaykkal','നാളികേരം ഉടയ്ക്കൽ','Vazhipadu',10,0,{purpose:'Breaking of coconuts to ward off obstacles',startTime:'7:30 AM',endTime:'7:40 AM',deity:'Lord Ganesh'}),
      P('T1028-P4','Pushpanjali','പുഷ്പാഞ്ജലി','Archana',20,0,{live:true,purpose:'Flower offering with name & nakshatra archana',startTime:'7:00 AM',endTime:'9:00 AM',minBookingTime:'Instant · live booking',deity:'Lord Vishnu'}),
      P('T1028-P5','Bhagyasooktha Pushpanjali','ഭാഗ്യസൂക്ത പുഷ്പാഞ്ജലി','Archana',30,0,{purpose:'For good fortune and removal of obstacles to prosperity',startTime:'7:00 AM',endTime:'9:00 AM',deity:'Lord Vishnu'}),
      P('T1028-P6','Neyvilakku','നെയ്‌വിളക്ക്','Seva',15,0,{live:true,purpose:'Ghee-lamp offering for clarity and wellbeing',startTime:'5:30 PM',endTime:'7:00 PM',minBookingTime:'Instant · live booking',deity:'Lord Vishnu'}),
      P('T1028-P7','Palpayasam (1 kg)','പാൽപായസം','Neivedyam',120,10,{purpose:'Milk payasam offering, distributed as prasadam',startTime:'8:00 AM',endTime:'8:30 AM',minBookingTime:'1 day ahead',deity:'Lord Vishnu'}),
      P('T1028-P8','Santhanagopala Pooja','സന്താനഗോപാല പൂജ','Vazhipadu',1500,3,{bookingType:'Online',purpose:'For couples seeking a child — the temple\'s speciality',startTime:'6:00 AM',endTime:'8:00 AM',minBookingTime:'2 days ahead',deity:'Lord Vishnu (Santhanagopala Moorthy)'}),
      P('T1028-P9','Udayasthamana Pooja','ഉദയാസ്തമന പൂജ','Vazhipadu',7500,1,{bookingType:'Offline',purpose:'Dawn-to-dusk pooja performed for the entire day',startTime:'5:30 AM',endTime:'7:30 PM',minBookingTime:'7 days ahead',deity:'Lord Vishnu'}),
    ] },
  { slug:'bilathikulam-sree-shiva-temple', code:'T1044', name:'Bilathikulam Sree Shiva Temple', ml:'ബിലാത്തികുളം ശ്രീ ശിവ ക്ഷേത്രം', district:'Kozhikode', place:'Bilathikulam', deity:'Lord Shiva', others:['Parvathi','Ganapathi'],
    gateway:'omniware', g80:false, plan:'Basic', sponsor:null, bookable:true, cutoff:'7:00 PM', hue:'#3F4E5C', rating:4.6, reviews:88,
    category:'Hindu Temple', chiefPriest:'Vasudevan Namboothiri (Melshanthi)', publicPhone:'+91 90123 55044', publicEmail:'office@bilathikulamshiva.org', upiId:'bilathikulamshiva@oksbi',
    timings:'5:00–10:00 AM · 5:00–8:00 PM', address:'Bilathikulam, Kozhikode – 673006', about:'A serene Shiva temple by the old town pond, known for its Monday Dhara.', story:'', history:'Rebuilt in 1932 after the great flood.', speciality:'Rudrabhishekam on Pradosham days', guidelines:'Dress code applies.', remarks:'', nearby:['Kozhikode beach (3 km)','Mananchira (2 km)'],
    poojas:[
      P('T1044-P1','Dhara','ധാര','Abhishekam',40,0,{live:true,purpose:'Continuous water/oil stream over the shivalinga for peace',startTime:'5:30 AM',endTime:'6:00 AM',minBookingTime:'Instant · live booking',deity:'Lord Shiva'}),
      P('T1044-P2','Rudrabhishekam','രുദ്രാഭിഷേകം','Abhishekam',500,5,{purpose:'Elaborate abhishekam with Rudra chanting, for health and protection',startTime:'6:00 AM',endTime:'7:00 AM',minBookingTime:'1 day ahead',deity:'Lord Shiva'}),
      P('T1044-P3','Koovalamala','കൂവളമാല','Vazhipadu',30,0,{purpose:'Bilva-leaf garland offering, dear to Lord Shiva',startTime:'7:00 AM',endTime:'7:15 AM',deity:'Lord Shiva'}),
      P('T1044-P4','Mrithyunjaya Homam','മൃത്യുഞ്ജയ ഹോമം','Homam',1500,2,{bookingType:'Offline',purpose:'For health, longevity and overcoming serious illness',startTime:'6:30 AM',endTime:'8:00 AM',minBookingTime:'3 days ahead',deity:'Lord Shiva'}),
    ] },
  { slug:'vengamala-bhagavathi-temple', code:'T1221', name:'Vengamala Bhagavathi Temple', ml:'വേങ്ങമല ഭഗവതി ക്ഷേത്രം', district:'Thiruvananthapuram', place:'Marudhumoola', deity:'Bhagavathi', others:['Ganapathi','Yakshi'],
    gateway:'bank', g80:false, plan:'Free', sponsor:null, bookable:true, cutoff:'8:00 PM', hue:'#8A3A1F', rating:4.7, reviews:41,
    category:'Hindu Temple', chiefPriest:'Raman Namboothiri (Melshanthi)', publicPhone:'+91 90123 12210', publicEmail:'office@vengamalabhagavathi.org', upiId:'vengamalabhagavathi@oksbi',
    timings:'6:00–9:00 AM · 5:30–7:00 PM', address:'Vengamala Temple Road, Marudhumoola, Thiruvananthapuram', about:'Hill-top Bhagavathi temple with a famous Meena Bharani festival.', story:'', history:'', speciality:'Bhagavathi Seva every Friday', guidelines:'', remarks:'', nearby:['Ponmudi (40 km)'],
    poojas:[
      P('T1221-P1','Pushpanjali','പുഷ്പാഞ്ജലി','Archana',20,0,{live:true,purpose:'Flower offering with name & nakshatra archana',startTime:'6:00 AM',endTime:'9:00 AM',minBookingTime:'Instant · live booking',deity:'Bhagavathi'}),
      P('T1221-P2','Bhagavathi Seva','ഭഗവതി സേവ','Seva',750,6,{purpose:'Evening seva with family sankalpam, offered every Friday',startTime:'5:30 PM',endTime:'6:30 PM',minBookingTime:'1 day ahead',deity:'Bhagavathi'}),
      P('T1221-P3','Kalasam','കലശം','Vazhipadu',300,0,{bookingType:'Offline',purpose:'Sacred-pot ritual for purification and blessings',startTime:'6:00 AM',endTime:'6:45 AM',deity:'Bhagavathi'}),
    ] },
  { slug:'thrikapaleshwaram-temple', code:'T1097', name:'Thrikapaleshwaram Temple', ml:'തൃക്കപാലേശ്വരം ക്ഷേത്രം', district:'Pathanamthitta', place:'Thiruvalla', deity:'Lord Shiva', others:['Sastha'],
    gateway:'razorpay', g80:true, plan:'Basic', sponsor:null, bookable:true, cutoff:'8:00 PM', hue:'#2F5F4E', rating:4.9, reviews:130,
    category:'Hindu Temple', chiefPriest:'Sankaran Namboothiri (Melshanthi)', publicPhone:'+91 90123 10970', publicEmail:'office@thrikapaleshwaram.org', upiId:'thrikapaleshwaram@oksbi',
    timings:'5:00–10:30 AM · 5:00–8:00 PM', address:'Thrikapaleshwaram, Thiruvalla – 689101', about:'One of the 108 Shiva temples of Kerala, on the banks of the Manimala river.', story:'', history:'', speciality:'Pithru tharpanam on Karkidaka Vavu', guidelines:'', remarks:'', nearby:['Aranmula (12 km)'],
    poojas:[
      P('T1097-P1','Dhara','ധാര','Abhishekam',40,0,{live:true,purpose:'Continuous stream offering for peace of mind',startTime:'5:00 AM',endTime:'5:30 AM',minBookingTime:'Instant · live booking',deity:'Lord Shiva'}),
      P('T1097-P2','Pithru Tharpanam','പിതൃതർപ്പണം','Vazhipadu',150,0,{purpose:'Offerings to departed ancestors, especially on Karkidaka Vavu',startTime:'6:00 AM',endTime:'8:00 AM',minBookingTime:'1 day ahead',deity:'Lord Shiva'}),
      P('T1097-P3','Sahasranama Archana','സഹസ്രനാമ അർച്ചന','Archana',60,0,{purpose:'Chanting of the 1,000 names with flower offering',startTime:'7:00 AM',endTime:'8:00 AM',deity:'Lord Shiva'}),
    ] },
  // Sample public destination for the existing T1284 staff review; bookings stay disabled.
  { slug:'sree-neelakeshi-mudippura-temple', code:'T1284', name:'Sree Neelakeshi Mudippura Temple', ml:'ശ്രീ നീലകേശി മുടിപ്പുര ക്ഷേത്രം', district:'Thiruvananthapuram', place:'Vellanad', deity:'Bhagavathi (Neelakeshi)', others:['Lord Ganesh','Naga'],
    gateway:'bank', g80:false, plan:'Free', sponsor:null, bookable:false, cutoff:'8:00 PM', hue:'#7A5238', rating:0, reviews:0,
    category:'Hindu Temple', chiefPriest:'', publicPhone:'', publicEmail:'', upiId:'',
    timings:'To be confirmed', address:'Mudippura, Vellanad PO, Thiruvananthapuram – 695543',
    about:'Village Bhagavathi temple in Vellanad known for its annual Mudippura festival.', story:'', history:'', speciality:'Mudippura festival',
    guidelines:'Contact the temple committee for current visiting guidelines.', remarks:'Sample temple page. Bookings and direct UPI payments are not configured.', nearby:[], poojas:[],
  },
]
export const bySlug = s => temples.find(t=>t.slug===s)

// Public listing IDs come from one MasterData sequence per listing type. Route IDs/slugs
// remain internal; these codes are the stable references shown across the portal.
export const listingIdPrefixes = {
  temple:'T', service:'S', festival:'F', event:'E', holyplace:'H',
}

export const templeCharts = [
  {
    id:'CH-T1028-260913', listingId:'T1028', date:'13 Sept 2026', dateKey:'2026-09-13', status:'Prepared', bookingCount:14,
    payoutStatus:'Pending', payoutRef:'Next payout · 15 Sept', bookingTotal:3420, donationTotal:1000,
    bookings:[
      ['BK-260913-001','Ganapathi Homam','Anand','Rohini',1,250,'Paid'],
      ['BK-260913-002','Ganapathi Homam','Sreeja S','Uthram',1,250,'Paid'],
      ['BK-260913-003','Ilaneer Abhishekam','Rajesh','Chothi',2,100,'Paid'],
      ['BK-260913-004','Pushpanjali','Devi','Makayiram',1,20,'Paid'],
      ['BK-260913-005','Palpayasam','Vinod','Anizham',1,120,'Paid'],
      ['BK-260913-006','Santhanagopala Pooja','Meera','Thiruvonam',1,1500,'Paid'],
      ['BK-260913-007','Neyvilakku','Hari','Pooram',2,30,'Paid'],
      ['BK-260913-008','Bhagyasooktha Pushpanjali','Lekha','Ayilyam',2,60,'Paid'],
      ['BK-260913-009','Ilaneer Abhishekam','Arun','Aswathi',2,100,'Paid'],
      ['BK-260913-010','Naalikeram Udaykkal','Nisha','Bharani',4,40,'Paid'],
      ['BK-260913-011','Pushpanjali','Maya','Pooyam',1,20,'Paid'],
      ['BK-260913-012','Palpayasam','Rajan','Revathi',2,240,'Paid'],
      ['BK-260913-013','Neyvilakku','Asha','Chithira',4,60,'Paid'],
      ['BK-260913-014','Udayasthamana Pooja · advance','Kiran','Moolam',1,630,'Part-paid'],
    ],
    donations:[['DN-000231','Anand K','Annadanam',1000,'Receipt issued']],
    // Live bookings: made instantly through a "Live" pooja after today's chart was already
    // prepared/locked. Not part of the chart above — the vendor was notified immediately,
    // and these roll into TOMORROW's chart (14 Sept) for payout.
    liveBookings:[
      ['LB-260913-101','Ganapathi Homam','Rakesh P','Anizham',1,250,'6:42 PM','Email + SMS + WhatsApp sent'],
      ['LB-260913-102','Pushpanjali','Meera N','Pooyam',2,40,'7:15 PM','Email + SMS + WhatsApp sent'],
      ['LB-260913-103','Neyvilakku','Suresh Babu','Chothi',1,15,'7:51 PM','WhatsApp sent · email queued'],
    ],
  },
  {
    id:'CH-T1028-260912', listingId:'T1028', date:'12 Sept 2026', dateKey:'2026-09-12', status:'Completed', bookingCount:11,
    payoutStatus:'Pending', payoutRef:'Next payout · 15 Sept', bookingTotal:2760, donationTotal:500,
    bookings:[['BK-260912-001','Ganapathi Homam','Suresh','Rohini',2,500,'Paid'],['BK-260912-002','Santhanagopala Pooja','Anjali','Uthram',1,1500,'Paid'],['BK-260912-003','Other bookings (9)','—','—',9,760,'Paid']],
    donations:[['DN-000230','Anonymous','General',500,'Receipt issued']],
  },
  {
    id:'CH-T1028-260911', listingId:'T1028', date:'11 Sept 2026', dateKey:'2026-09-11', status:'Completed', bookingCount:9,
    payoutStatus:'Pending', payoutRef:'Next payout · 15 Sept', bookingTotal:1940, donationTotal:2500,
    bookings:[['BK-260911-001','Ganapathi Homam','Sreeja S','Uthram',1,250,'Paid'],['BK-260911-002','Other bookings (8)','—','—',8,1690,'Paid']],
    donations:[['DN-000229','Sreeja S','Renovation',2500,'Receipt issued']],
  },
  {
    id:'CH-T1028-260910', listingId:'T1028', date:'10 Sept 2026', dateKey:'2026-09-10', status:'Completed', bookingCount:17,
    payoutStatus:'Pending', payoutRef:'Next payout · 15 Sept', bookingTotal:4120, donationTotal:0,
    bookings:[['BK-260910-001','Udayasthamana Pooja · advance','Madhavan','Chothi',1,3500,'Part-paid'],['BK-260910-002','Other bookings (16)','—','—',16,620,'Paid']],
    donations:[],
  },
  {
    id:'CH-T1028-260907', listingId:'T1028', date:'7 Sept 2026', dateKey:'2026-09-07', status:'Completed', bookingCount:12,
    payoutStatus:'Paid', payoutRef:'FDRLN26251000431 · 8 Sept', bookingTotal:3200, donationTotal:800,
    bookings:[['BK-260907-001','Bookings (12)','—','—',12,3200,'Paid']], donations:[['DN-000225','Devika','Annadanam',800,'Receipt issued']],
  },
  {
    id:'CH-T1028-260906', listingId:'T1028', date:'6 Sept 2026', dateKey:'2026-09-06', status:'Completed', bookingCount:10,
    payoutStatus:'Paid', payoutRef:'FDRLN26251000431 · 8 Sept', bookingTotal:2340, donationTotal:1000,
    bookings:[['BK-260906-001','Bookings (10)','—','—',10,2340,'Paid']], donations:[['DN-000224','Anonymous','General',1000,'Receipt issued']],
  },
]
export const chartById = id => templeCharts.find(c=>c.id===id) || templeCharts[0]

export const specials = [
  { id:'sp1', title:'Ashta Dravya Maha Ganapathi Homam', ml:'അഷ്ടദ്രവ്യ മഹാഗണപതി ഹോമം', date:'Sat 14 Sept · Vinayaka Chathurthi', temple:temples[0], price:1500, seats:40, left:18, tag:'Obstacles', proof:'Photo + video', hue:'#B8804F',
    desc:'Performed by the temple melshanthi with eight dravyas. Your name, nakshatra and sankalpam are read at the homam. Proof on WhatsApp the same day; prasadam by India Post within 5 days.' },
  { id:'sp2', title:'Pithru Tharpanam & Bali', ml:'പിതൃതർപ്പണം', date:'Sat 26 Sept · Purnima', temple:temples[3], price:2100, seats:60, left:9, tag:'Ancestors', proof:'Video', hue:'#2F5F4E', desc:'Tharpanam for departed ancestors on the Manimala riverbank.' },
  { id:'sp3', title:'Bhagavathi Seva', ml:'ഭഗവതി സേവ', date:'Every Friday', temple:temples[2], price:750, seats:40, left:31, tag:'Family', proof:'Photo', hue:'#8A3A1F', desc:'Evening seva with family sankalpam.' },
  { id:'sp4', title:'Sudarsana Homam', ml:'സുദർശന ഹോമം', date:'Fri 2 Oct', temple:temples[0], price:3000, seats:12, left:6, tag:'Protection', proof:'Photo + video', hue:'#7A5238', desc:'For protection from enemies and negativity.' },
  { id:'sp5', title:'Mrithyunjaya Homam (group)', ml:'മൃത്യുഞ്ജയ ഹോമം', date:'Every Monday', temple:temples[1], price:350, seats:25, left:11, tag:'Health', proof:'Photo', hue:'#3F4E5C', desc:'Group homam for health and longevity.' },
  { id:'sp6', title:'Navarathri Saraswathi Pooja', ml:'സരസ്വതി പൂജ', date:'19–21 Oct', temple:temples[2], price:500, seats:120, left:97, tag:'Festival', proof:'Photo', hue:'#8A3A1F', desc:'Vidyarambham and Saraswathi pooja.' },
]
export const services = [
  { id:'sv1', code:'S1001', name:'Prasad Nambeesan', ml:'പ്രസാദ് നമ്പീശൻ', type:'Astrologer', district:'Kozhikode', place:'Koottur, Naduvannur', from:300, exp:22, hue:'#5B3E2B', rating:4.8, reviewCount:63, defaultPhoto:1,
    timings:'Monday–Saturday · 1:00 PM–5:00 PM', availabilityDays:'Mon, Tue, Wed, Thu, Fri, Sat', slots:['1:00 PM','1:30 PM','2:00 PM','3:30 PM','4:00 PM','4:30 PM'],
    about:'Traditional Kerala astrologer practising Prasna Marga, horoscope consultation and muhoortham for families and temples across Malabar.',
    history:'Practising since 2004 after training in the Kanippayyur parampara. Has assisted temple committees with Devaprasnam and renovation muhoortham for more than two decades.',
    remarks:'Birth date, exact birth time and place are recommended for horoscope consultations. Phone appointments are available for muhoortham and follow-up questions.',
    offerings:[['Jathakam consultation · 30 min',500,'In person / phone'],['Prasnam · 1 hr',1500,'In person'],['Muhoortham',300,'Phone']],
    specials:[['Ganapathi Homam at devotee home','20 Sept · 7:00 AM',3500],['Navagraha Pooja','28 Sept · 9:00 AM',2500]],
    feedback:[['Meera S',5,'Knowledgeable','The explanation was calm, clear and practical.'],['Achuth P',4,'Accurate','The appointment started on time and the guidance was detailed.']] },
  { id:'sv2', code:'S1002', name:'Shiju Krishnan Potty', ml:'ഷിജു കൃഷ്ണൻ പോറ്റി', type:'Poojari / Pandit', district:'Thiruvananthapuram', place:'Vattiyoorkavu', from:1500, exp:14, hue:'#7A5238', rating:4.7, reviewCount:38, defaultPhoto:1, timings:'Monday–Saturday · 6:00 AM–11:00 AM', availabilityDays:'Mon–Sat', slots:['6:00 AM','7:30 AM','9:00 AM'], about:'Vedic priest available for home and temple rituals.', history:'Fourteen years of ritual practice and family ceremonies.', remarks:'Travel and samagri are confirmed before booking.', offerings:[['Ganapathi Homam at home',3500,'Samagri included'],['Griha Pravesham',7500,'Samagri included']], specials:[['Maha Ganapathi Homam','22 Sept · 6:30 AM',3500]], feedback:[['Anjana R',5,'Punctual','Arrived on time and explained every step.']] },
  { id:'sv3', code:'S1003', name:'P.V. Sasidharan', ml:'പി.വി. ശശിധരൻ', type:'Astrologer', district:'Perinthalmanna', place:'Perinthalmanna town', from:300, exp:30, hue:'#3F4E5C', rating:4.9, reviewCount:91, defaultPhoto:1, timings:'Tuesday–Sunday · 9:00 AM–1:00 PM', availabilityDays:'Tue–Sun', slots:['9:00 AM','10:00 AM','11:30 AM'], about:'Horoscope reader specialising in family consultations.', history:'Thirty years of traditional practice.', remarks:'Phone appointments require horoscope details in advance.', offerings:[['Horoscope reading',300,'Phone']], specials:[], feedback:[['Hari M',5,'Accurate','Very clear reading and helpful suggestions.']] },
  { id:'sv4', code:'S1004', name:'Kalamandalam Anil', ml:'കലാമണ്ഡലം അനിൽ', type:'Artist', district:'Thrissur', place:'Cheruthuruthy', from:15000, exp:18, hue:'#8A3A1F', rating:4.8, reviewCount:27, defaultPhoto:1, timings:'By event schedule', availabilityDays:'Festival and event dates', slots:['Request a date'], about:'Temple percussion artist and Thayambaka team lead.', history:'Kalamandalam-trained performer with eighteen years on temple stages.', remarks:'Final team size and travel are confirmed after enquiry.', offerings:[['Thayambaka (festival)',15000,'Team of 5']], specials:[], feedback:[['Kottur Committee',5,'Professional','A disciplined team and an excellent performance.']] },
  { id:'sv5', code:'S1005', name:'Madhavan Kazhakam', ml:'മാധവൻ കഴകം', type:'Kazhakam', district:'Kozhikode', place:'Balussery', from:800, exp:16, hue:'#6B513C', rating:4.6, reviewCount:19, defaultPhoto:1, timings:'Monday–Saturday · 5:00 AM–10:00 AM', availabilityDays:'Mon–Sat', slots:['5:00 AM','7:00 AM','9:00 AM'], about:'Experienced Kazhakam support for temple rituals and festival days.', history:'Serving temples in Kozhikode district for sixteen years.', remarks:'Available for full-day festival duty on advance request.', offerings:[['Temple ritual assistance',800,'At temple'],['Festival day duty',2500,'Full day']], specials:[], feedback:[['Temple Secretary',5,'Reliable','Reliable and familiar with temple procedures.']] },
]
/* ---------- VENDOR TYPE 2 · FESTIVAL COMMITTEE ----------
   A festival listing is time-bound (a few days a year), sells sponsorships and day-limited
   offerings, hires artists, and settles once the utsavam is over — no daily pooja chart. */
export const festival = {
  code:'F1016', name:'Kottur Temple Annual Festival 2026', ml:'കൊട്ടൂർ ഉത്സവം 2026',
  temple:'Kottur Sree Mahavishnu Temple', place:'Ulliyeri, Kozhikode', committee:'Kottur Utsava Committee',
  convenor:'Rajeev M', from:'3 Dec 2026', to:'8 Dec 2026', daysToGo:83, status:'Bookings open',
  budget:1250000, collected:684500, committed:412000, inHand:272500, sponsorTarget:600000, sponsorGot:395000,
  days:['3 Dec','4 Dec','5 Dec','6 Dec','7 Dec','8 Dec'],
  /* day, event, time, kind, performer / in-charge, status */
  programme:[
    ['3 Dec','Kodiyettam (flag hoisting)','6:00 AM','Ritual','Melshanthi Krishnan Namboothiri','Confirmed'],
    ['3 Dec','Ezhunnallippu · 3 elephants','7:00 PM','Procession','Kottur Gajamela','Confirmed'],
    ['4 Dec','Thayambaka','7:30 PM','Cultural','Kalamandalam Anil & team','Confirmed'],
    ['4 Dec','Kathakali — Duryodhana Vadham','9:30 PM','Cultural','Sadanam troupe','Advance paid'],
    ['5 Dec','Annadanam','12:30 PM','Seva','Committee kitchen','Confirmed'],
    ['5 Dec','Ottanthullal','7:00 PM','Cultural','Not assigned','Needs artist'],
    ['6 Dec','Kalamezhuthu Pattu','8:00 PM','Ritual','Kurup team, Perambra','Awaiting confirmation'],
    ['7 Dec','Sopana Sangeetham','6:30 PM','Cultural','Sreejith Marar','Confirmed'],
    ['8 Dec','Aarattu & Pallivetta','5:00 AM','Ritual','Melshanthi','Confirmed'],
  ],
  // Offerings use the same shared "pooja item" shape as a temple's poojas (P helper above),
  // with `dailyLimit` read as a PER-FESTIVAL-DAY limit and `sold` tracking cumulative bookings.
  offerings:[
    { ...P('F1016-O1','Utsava Bali sponsorship','ഉത്സവബലി','Sponsorship',2500,6,{live:true,purpose:'Sponsor the daily bali ritual — name announced at the ritual',startTime:'6:00 AM',endTime:'6:30 AM',minBookingTime:'Instant · live booking',deity:'Lord Vishnu'}), sold:19 },
    { ...P('F1016-O2','Annadanam (100 devotees)','അന്നദാനം','Seva',5000,2,{purpose:'Sponsor a meal seva for 100 devotees on a chosen festival day',startTime:'12:30 PM',endTime:'2:00 PM',minBookingTime:'2 days ahead'}), sold:9 },
    { ...P('F1016-O3','Ezhunnallippu sponsorship','എഴുന്നള്ളിപ്പ്','Sponsorship',7500,1,{bookingType:'Offline',purpose:'Sponsor the elephant procession for one evening',startTime:'7:00 PM',endTime:'8:30 PM',minBookingTime:'7 days ahead'}), sold:4 },
    { ...P('F1016-O4','Deepam (festival week)','ദീപം','Vazhipadu',100,0,{live:true,purpose:'Lamp offering through the festival week',startTime:'5:30 PM',endTime:'7:00 PM',minBookingTime:'Instant · live booking'}), sold:212 },
    { ...P('F1016-O5','Kalasam','കലശം','Vazhipadu',300,0,{purpose:'Sacred-pot ritual performed once during the festival',startTime:'6:00 AM',endTime:'6:45 AM'}), sold:64 },
  ],
  /* sponsor, package, amount, status, note */
  sponsors:[
    ['Malabar Gold Traders','Title sponsor · arch + stage banner',100000,'Paid','GST invoice INV-0431'],
    ['Resurge India Foundation','Annadanam — all 6 days',60000,'Paid','INV-0428'],
    ['Ulliyeri Service Co-op Bank','Ezhunnallippu · day 1',35000,'Advance ₹15,000','Balance ₹20,000 due 1 Dec'],
    ['NRI Forum · Dubai chapter','Kathakali night',25000,'Pledged','Awaiting transfer'],
  ],
  /* day sheet rows: offering, devotee, nakshatra, qty, amount */
  sheet:[
    ['Utsava Bali sponsorship','Anand K','Rohini',1,2500],
    ['Annadanam (100 devotees)','Sreeja S · Dubai','Uthram',1,5000],
    ['Deepam','Rajesh Iyer','Chothi',5,500],
    ['Kalasam','Devi M','Makayiram',1,300],
    ['Deepam','Vinod K','Anizham',2,200],
  ],
}

// Public festival directory; committee and review records remain separate.
export const festivals = [festival]

/* ---------- VENDOR TYPE 3 · SERVICE PROVIDER ----------
   A person or team (priest, astrologer, performer) selling time-slot appointments,
   optionally also listing Special poojas. No daily chart — reviews and slots matter. */
export const provider = {
  code:'S1001', name:'Prasad Nambeesan', ml:'പ്രസാദ് നമ്പീശൻ', kind:'Astrologer',
  place:'Koottur, Naduvannur, Kozhikode', exp:22, rating:4.8, reviews:63, languages:'Malayalam · English',
  travelKm:25, slotMins:30, hours:'1:00 PM – 5:00 PM', listingEnabled:true,
  // MVP stage: TempleAddress does not collect payment for appointments or process any payout —
  // the devotee pays the professional directly. What the professional pays FOR is the listing
  // itself, via a subscription (LinkedIn-Premium style), which controls visibility and features.
  subscription:{ plan:'Service Premium', price:2999, cycle:'per year', status:'Active', renews:'4 Oct 2026',
    features:['Verified badge on your public page','Unlimited appointment slots','Enquiries inbox with quick replies','List Special poojas','Priority placement in search','Monthly performance summary'] },
  expertise:['Horoscope','Rashi','Swarna Prasnam','Devaprasnam','Thamboolaprashnam','Muhoortham'],
  week:[['Mon',true],['Tue',true],['Wed',true],['Thu',true],['Fri',true],['Sat',true],['Sun',false]],
  /* time, devotee, service, mode, phone, status */
  today:[
    ['1:00 PM','Sreeja S','Jathakam consultation','In person','+91 94••• ••812','Confirmed'],
    ['1:30 PM','Anand K','Muhoortham','Phone','+91 94••• ••256','Confirmed'],
    ['2:00 PM','—','Open slot','—','—','Open'],
    ['2:30 PM','Rajesh Iyer','Prasnam (1 hr)','In person','+91 98••• ••441','Confirmed'],
    ['3:30 PM','Devi M','Horoscope reading','Phone','+91 97••• ••118','Rescheduled'],
    ['4:00 PM','Hari Menon','Muhoortham','Phone','+91 90••• ••402','Confirmed'],
    ['4:30 PM','—','Open slot','—','—','Open'],
  ],
  /* date, devotee, service, mode, amount, status */
  upcoming:[
    ['Sun 14 Sept · 1:00 PM','Lakshmi R','Jathakam consultation','In person',500,'Confirmed'],
    ['Mon 15 Sept · 2:30 PM','Vinod K','Prasnam (1 hr)','In person',1500,'Confirmed'],
    ['Wed 17 Sept · 10:00 AM','Kunnathumadom Devaswom','Devaprasnam','At temple',15000,'Advance paid'],
    ['Fri 19 Sept · 3:00 PM','Achuth P','Muhoortham','Phone',300,'Confirmed'],
  ],
  past:[
    ['10 Sept','Achuth P','Jathakam consultation',500,'Completed','4 ★'],
    ['9 Sept','Meera S','Muhoortham',300,'Completed','5 ★'],
    ['8 Sept','Vengamala Committee','Devaprasnam',15000,'Completed','—'],
    ['7 Sept','Rahul V','Prasnam (1 hr)',1500,'No-show','—'],
  ],
  /* name, ml, price, minutes, mode */
  services:[
    ['Jathakam consultation','ജാതക പരിശോധന',500,30,'In person / phone'],
    ['Prasnam','പ്രശ്നം',1500,60,'In person'],
    ['Swarna Prasnam','സ്വർണ പ്രശ്നം',5000,180,'At temple'],
    ['Muhoortham','മുഹൂർത്തം',300,15,'Phone'],
    ['Devaprasnam','ദേവപ്രശ്നം',15000,480,'At temple'],
  ],
  /* title, date, price, seats, booked, fulfilment */
  specials:[
    ['Ganapathi Homam at devotee\'s home','Sat 20 Sept',3500,4,3,'Proof pending for 2'],
    ['Navagraha Pooja','Sun 28 Sept',2500,6,2,'Upcoming'],
  ],
  /* date, name, phone, message, status */
  enquiries:[
    ['11 Sept','Vinod K','+91 96••• ••330','Swarna Prasnam for our family temple — are you free in October?','New'],
    ['11 Sept','Anjali T','+91 94••• ••905','Do you do online jathakam consultation for NRIs?','New'],
    ['10 Sept','Lakshmi R','+91 94••• ••771','Muhoortham for griha pravesham on 2 Nov','Replied'],
    ['9 Sept','Hari Menon','+91 90••• ••402','Devaprasnam cost for a small kavu near Perambra','Replied'],
  ],
  /* devotee, stars, tag, text, reply */
  feedback:[
    ['Achuth P',4,'Calm demeanor','Explained the jathakam patiently and did not rush the session.','Replied'],
    ['Sreeja S',5,'Accurate','The muhoortham he gave worked out perfectly for our family.','—'],
    ['Rajesh Iyer',5,'Knowledgeable','Deep knowledge of prasnam. Worth the wait for an appointment.','—'],
    ['Meera S',3,'—','Session started 20 minutes late, but the reading was good.','Needs reply'],
  ],
}

export const gateways = {
  razorpay:{ name:'Razorpay', note:'TempleAddress collects · weekly payout to your bank', kind:'ta' },
  payu:{ name:'PayU', note:'TempleAddress collects · weekly payout', kind:'ta' },
  stripe:{ name:'Stripe', note:'International cards (NRI devotees) · TempleAddress collects', kind:'ta' },
  omniware:{ name:'Omniware · Federal Bank', note:'Temple\'s own merchant account · no TempleAddress payout', kind:'own' },
  bank:{ name:'No gateway — bank account only', note:'Devotees pay TempleAddress; accountant pays the temple manually by NEFT', kind:'manual' },
}
export const analytics = {
  traffic:[['Mar',12.4,3.1],['Apr',15.2,3.9],['May',18.9,4.8],['Jun',22.1,6.2],['Jul',31.4,8.9],['Aug',38.7,11.3],['Sep',44.2,13.8]],
  bookings:[['Mon',142],['Tue',118],['Wed',131],['Thu',97],['Fri',168],['Sat',214],['Sun',188]],
  channels:[{name:'Website',value:46},{name:'WhatsApp',value:31},{name:'Mobile app',value:18},{name:'QR board',value:5}],
}

/* ==================================================================
   PARTNER CHECKOUT — simplified business model (Sept 2026)
   TempleAddress earns through exactly three things: Temple Subscription
   Plans (Free/Basic/Premium), Sponsored Temple Plans (a sponsor pays a
   temple's plan), and the one-time Mini Billing App. Partner commission is
   a flat 10% of the base plan amount, Dealer commission a flat 5% — no
   points, coins or referral rewards; both wallets are plain ₹.
   ================================================================== */
export const checkoutPartner = { id:'TA-AG-00124', name:'Partner (You)', dealerId:'TA-DE-0008', dealerName:'Kozhikode Partners Pvt Ltd' }
export const checkoutCommission = { partnerPct:10, dealerPct:5 }
// Prospect / freshly-listed temples a partner can sell a plan or sponsorship to. A separate,
// lighter-weight list from the full `temples[]` catalogue — these use their own TEM-xxx-#### code.
export const checkoutTemples = [
  { slug:'sree-mahadeva-temple-kkd', name:'Sree Mahadeva Temple', place:'Kozhikode', district:'Kerala', code:'TEM-KKD-1024', hue:'#7A5238', currentPlan:'Free', uuid:'8f4b2c19-72d3-4f91-9a10-3ca1918c0a77' },
  { slug:'devi-temple-tsr', name:'Devi Temple', place:'Thrissur', district:'Kerala', code:'TEM-TSR-1032', hue:'#8A3A1F', currentPlan:'Free', uuid:'c3f0a2e4-51b6-4dd0-9a2f-77e1b6f4d8a2' },
  { slug:'sree-bhagavathi-temple-mlp', name:'Sree Bhagavathi Temple', place:'Malappuram', district:'Kerala', code:'TEM-MLP-1041', hue:'#2F5F4E', currentPlan:'Basic', uuid:'1a9d6b3e-84f2-4c7a-b1e0-9f3c2d5a7e61' },
  { slug:'sree-durga-temple-wnd', name:'Sree Durga Temple', place:'Wayanad', district:'Kerala', code:'TEM-WND-1058', hue:'#3F4E5C', currentPlan:'Free', uuid:'6d2e9c41-38a5-4b0e-8f61-2c9a1d4e7b30' },
]
export const checkoutPlans = {
  basic:{ key:'basic', name:'Basic Plan', price:4000, cycle:'Annual Plan', icon:'Leaf', features:['Temple Listing','Basic Information','Photo Gallery','Standard Support'] },
  premium:{ key:'premium', name:'Premium Plan', price:10000, cycle:'Annual Plan', badge:'Most Popular', icon:'Star', features:['All Basic Features','Priority Listing','DM Support','Priority Support'] },
  billing:{ key:'billing', name:'Billing App', price:5000, cycle:'One Time', icon:'Monitor', features:['Offline Desktop App','Temple Billing Software','Member Management','One-time Payment'] },
}
export const onlineGateways = [
  { key:'omniware', name:'Omniware', bank:'Federal Bank', note:'Trusted by millions. Secure & reliable banking gateway.' },
  { key:'razorpay', name:'Razorpay', note:'Fast. Secure. Trusted by businesses across India.' },
]
export const manualMethods = [
  { key:'upi', name:'UPI / QR', upiId:'templeaddress@oksbi' },
  { key:'bank', name:'Bank Transfer', bank:'Federal Bank · TempleAddress Technologies Pvt Ltd', account:'XXXXXXXX7710', ifsc:'FDRL0001234' },
  { key:'cheque', name:'Cheque', payee:'TempleAddress Technologies Pvt Ltd' },
]
