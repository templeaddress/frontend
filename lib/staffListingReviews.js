import { services, temples } from './data.js'

const astrologer = services.find(service => service.id === 'sv1')
const artist = services.find(service => service.id === 'sv4')
const serviceSections = service => [
  { title: 'Professional background', rows: [['Experience', `${service.exp} years`], ['History / training', service.history], ['Languages', 'Malayalam, English']] },
  { title: 'Services and pricing', head: ['Service', 'Price', 'Mode / inclusions'], rows: service.offerings.map(([name, price, mode]) => [name, `₹${price.toLocaleString('en-IN')}`, mode]) },
  { title: 'Availability and instructions', rows: [['Timings', service.timings], ['Available days', service.availabilityDays], ['Appointment slots', service.slots.join(' · ')], ['Devotee instructions', service.remarks]] },
]

// Submitted prototype records are shared by the queue, detail screen and preview.
// Keep their review codes separate from public listing IDs until publication.
export const listingSubmissions = [
  { code: 'T1284', name: 'Sree Neelakeshi Mudippura Temple', type: 'Temple', created: '12 Sept 2026, 09:42', creator: 'Jinsha · JIN-4471', status: 'Pending', slug: 'sree-neelakeshi-mudippura-temple', contact: 'Secretary · +91 98••• ••3312' },
  {
    code: 'S1047', name: 'Prasad Nambeesan', type: 'Service', created: '11 Sept 2026, 17:05', creator: 'Prasad · Self', status: 'Revised', slug: 'prasad-nambeesan',
    fields: [['Profession', astrologer.type], ['Location / service area', `${astrologer.place}, ${astrologer.district}`], ['Contact', 'Prasad · +91 98••• ••1047'], ['Consultation mode', 'In person / phone']],
    about: astrologer.about, sections: serviceSections(astrologer),
    checks: ['Confirm consultation fees and duration', 'Check experience and professional information', 'Confirm appointment timings and contact'],
  },
  {
    code: 'F1022', name: 'Attukal Pongala 2027', type: 'Festival', created: '11 Sept 2026, 13:18', creator: 'Meera · JIN-4112', status: 'Pending', slug: 'attukal-pongala-2027',
    fields: [['Festival category', 'Temple festival · Pongala'], ['Venue', 'Attukal Bhagavathy Temple, Thiruvananthapuram'], ['Organising committee', 'Attukal Pongala organising committee'], ['Festival dates', '2027 edition · exact dates awaiting committee confirmation'], ['Contact', 'Festival office · +91 98••• ••1022']],
    about: 'Annual Pongala festival submission with venue information, devotee arrangements and a proposed programme for committee verification.',
    sections: [
      { title: 'Festival programme', head: ['Programme', 'Date / time', 'In charge'], rows: [['Opening rituals', 'To be confirmed', 'Temple priest'], ['Pongala preparation and offering', 'To be confirmed', 'Festival committee'], ['Closing rituals', 'To be confirmed', 'Temple priest']] },
      { title: 'Visitor arrangements and offerings', rows: [['Participation', 'Public participation · follow committee instructions'], ['Offerings', 'Pongala offering · booking and charges not yet submitted'], ['Facilities', 'Drinking water, first aid and volunteer help desks proposed'], ['Travel / parking', 'Use designated public transport stops; parking plan pending'], ['Sponsorship', 'Available · packages awaiting committee confirmation']] },
    ],
    checks: ['Obtain confirmed festival dates and programme', 'Verify committee authority and venue', 'Review visitor arrangements and offering terms'],
  },
  {
    code: 'E1018', name: 'Thiruvullakkavu Temple Festival', type: 'Event', created: '10 Sept 2026, 16:30', creator: 'Rahul · Vendor', status: 'Changes sent', slug: 'thiruvullakkavu-festival',
    fields: [['Event category', 'Temple cultural programme'], ['Venue', 'Thiruvullakkavu Temple grounds, Thrissur'], ['Organiser', 'Thiruvullakkavu festival committee'], ['Event date', 'Awaiting revised submission'], ['Contact', 'Rahul · +91 98••• ••1018']],
    about: 'A temple festival event submission covering the cultural programme, performers and visitor arrangements. Staff has requested the final date and performer confirmations.',
    sections: [
      { title: 'Event schedule', head: ['Programme', 'Proposed time (IST)', 'Confirmation'], rows: [['Welcome and lamp lighting', '5:30 PM', 'Date pending'], ['Temple percussion performance', '6:00 PM', 'Artist confirmation pending'], ['Cultural programme', '7:30 PM', 'Final programme pending']] },
      { title: 'Attendance and arrangements', rows: [['Entry', 'Free entry · no online ticket sales'], ['Audience area', 'Temple grounds · capacity to be confirmed'], ['Facilities', 'Parking and volunteer assistance proposed'], ['Requested changes', 'Submit the exact event date, performer consent and crowd-management arrangements']] },
    ],
    checks: ['Confirm exact event date and times', 'Verify organiser and performer consent', 'Review capacity and entry conditions'],
  },
  { code: 'T1281', name: 'Pazhur Perumthrikkovil', type: 'Temple', created: '10 Sept 2026, 10:12', creator: 'Arun · ARU-2210', status: 'Pending', slug: 'pazhur-perumthrikkovil', address: 'Pazhoor, Piravom, Ernakulam', deity: 'Lord Shiva', about: 'Shiva temple listing submitted with its location and primary deity. Further history, timings and committee contact details are awaiting verification.' },
  {
    code: 'S1046', name: 'Guruji Madhavan Namboothiri', type: 'Service', created: '9 Sept 2026, 14:48', creator: 'Madhavan · Self', status: 'Revised', slug: 'guruji-madhavan',
    fields: [['Profession', 'Vedic priest / Poojari'], ['Location / service area', 'Thrissur · home and temple visits'], ['Contact', 'Madhavan · +91 98••• ••1046'], ['Consultation mode', 'At home / temple · advance appointment']],
    about: 'Vedic priest offering family rituals, homams and temple poojas by prior appointment. Travel, samagri and the ritual schedule are agreed before confirmation.',
    sections: [
      { title: 'Professional background', rows: [['Experience', '18 years · submitted'], ['Qualifications', 'Traditional Vedic and ritual training · certificate verification pending'], ['Languages', 'Malayalam, Sanskrit']] },
      { title: 'Services and pricing', head: ['Service', 'Price', 'Inclusions'], rows: [['Ganapathi Homam', '₹3,500', 'Samagri included; travel extra'], ['Griha Pravesham', '₹7,500', 'Ritual and samagri; venue confirmed separately']] },
      { title: 'Availability and instructions', rows: [['Timings', 'Monday–Saturday · 6:00 AM–11:00 AM'], ['Advance notice', 'At least 3 days'], ['Devotee instructions', 'Provide venue, preferred date, devotee names and nakshatras'], ['Revised details', 'Travel charges and samagri inclusions added for review']] },
    ],
    checks: ['Verify ritual training and experience', 'Confirm pricing, samagri and travel charges', 'Check appointment notice and service area'],
  },
  {
    code: 'F1021', name: 'Mannarasala Ayilyam', type: 'Festival', created: '9 Sept 2026, 09:10', creator: 'Temple committee', status: 'Pending', slug: 'mannarasala-ayilyam',
    fields: [['Festival category', 'Temple festival · Ayilyam'], ['Venue', 'Mannarasala Sree Nagaraja Temple, Haripad, Alappuzha'], ['Organising committee', 'Mannarasala temple committee'], ['Festival dates', 'Ayilyam festival · exact date awaiting committee confirmation'], ['Contact', 'Temple committee · +91 98••• ••1021']],
    about: 'Ayilyam festival submission with special worship, procession and visitor information for staff verification.',
    sections: [
      { title: 'Festival programme', head: ['Programme', 'Date / time', 'In charge'], rows: [['Morning worship', 'To be confirmed', 'Temple priest'], ['Ayilyam procession', 'To be confirmed', 'Temple committee'], ['Special offerings', 'To be confirmed', 'Temple office']] },
      { title: 'Visitor arrangements and offerings', rows: [['Offerings', 'Special Ayilyam offerings · prices awaiting confirmation'], ['Visitor guidelines', 'Follow queue arrangements and temple dress guidelines'], ['Facilities', 'Drinking water and volunteer assistance proposed'], ['Travel / parking', 'Haripad approach roads · final parking plan pending']] },
    ],
    checks: ['Confirm Ayilyam date and programme', 'Verify temple committee contacts', 'Review offering prices and visitor arrangements'],
  },
  {
    code: artist.code, name: artist.name, type: 'Service professional', created: '8 Sept 2026, 15:20', creator: 'Anil · Self', status: 'Pending', slug: artist.id,
    fields: [['Profession', artist.type], ['Location / service area', `${artist.place}, ${artist.district} · Kerala temple events`], ['Contact', 'Anil · +91 98••• ••1004'], ['Engagement type', 'Temple festivals and cultural events']],
    about: artist.about, sections: serviceSections(artist),
    checks: ['Verify training and performance experience', 'Confirm team size, pricing and travel terms', 'Check event-date availability'],
  },
  {
    code: 'SP1042', name: 'Ashta Dravya Maha Ganapathi Homam', type: 'Special pooja', created: '8 Sept 2026, 11:30', creator: 'Kottur temple committee', status: 'Pending', slug: 'sp1',
    fields: [['Host temple / provider', 'Kottur Sree Mahavishnu Temple · T1028'], ['Location', 'Ulliyeri, Kozhikode'], ['Date and time (IST)', '14 Sept 2026 · 6:30 AM'], ['Contact', 'Temple office · +91 94••• ••1196']],
    about: 'Ganapathi Homam with eight dravyas, performed by the temple melshanthi. Devotee names, nakshatras and sankalpam are included in the ritual.',
    sections: [
      { title: 'Booking and capacity', rows: [['Price per booking', '₹1,500'], ['Maximum bookings', '40'], ['Booked / remaining', '22 / 18'], ['Booking closes', '13 Sept 2026 · 8:00 PM'], ['Required devotee details', 'Name, nakshatra and sankalpam']] },
      { title: 'Proof, prasadam and fulfilment', rows: [['Proof provided', 'Photo + video on WhatsApp the same day'], ['Prasadam delivery', 'Temple collection or India Post within 5 days'], ['Devotee instructions', 'Confirm the devotee details and delivery address before booking'], ['Cancellation / refund terms', 'Committee confirmation required before publication']] },
    ],
    checks: ['Verify host temple confirmation', 'Check price, capacity and booking window', 'Confirm proof, prasadam and refund terms'],
  },
]

export function listingPreviewPath(code) {
  const temple = temples.find(listing => listing.code === code)
  return temple ? `/t/${temple.slug}` : `/preview/listing/${encodeURIComponent(code)}`
}

export function getListingReview(code) {
  const submission = listingSubmissions.find(listing => listing.code === code)
  const temple = temples.find(listing => listing.code === code)
  if (!submission && !temple) return null
  if (submission && submission.type !== 'Temple') return { ...submission, preview: listingPreviewPath(code) }
  const record = { ...temple, ...submission }
  return {
    ...record, type: 'Temple', publicTemple: temple, preview: listingPreviewPath(code),
    created: submission?.created || 'Not recorded', creator: submission?.creator || 'Not recorded', status: submission?.status || 'Published',
    fields: [['Location', record.address], ['Primary deity', record.deity], ['Contact', record.publicPhone || record.contact || 'Not submitted']],
    sections: [],
  }
}
