// One place for the brand's public facts. Social links and registration numbers come from the deployment,
// so nothing is shown until VASS confirms the real handle or certificate.
const env = value => (value || '').trim()

export const SITE = {
  name: 'TempleAddress',
  legalName: 'VASS SYSTEMS LLP',
  tagline: 'A digital address for every temple.',
  supportEmail: 'help@templeaddress.com',
  infoEmail: 'info@templeaddress.com',
  whatsappNumber: '919495041196',
  whatsappDisplay: '+91 94950 41196',
  languages: 'English · മലയാളം',
  social: [
    ['facebook', 'Facebook', env(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK)],
    ['instagram', 'Instagram', env(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM)],
    ['youtube', 'YouTube', env(process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE)],
    ['x', 'X', env(process.env.NEXT_PUBLIC_SOCIAL_X)],
    ['linkedin', 'LinkedIn', env(process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN)],
  ].filter(([, , url]) => url.startsWith('https://')),
  registrations: [
    ['DPIIT recognition', env(process.env.NEXT_PUBLIC_DPIIT_NUMBER)],
    ['Udyam (MSME)', env(process.env.NEXT_PUBLIC_UDYAM_NUMBER)],
    ['GSTIN', env(process.env.NEXT_PUBLIC_GSTIN)],
  ].filter(([, value]) => value),
}

export const whatsappLink = (text = 'Hi, I need assistance.') => `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`
