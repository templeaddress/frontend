import { Apple, Download, MapPin, Smartphone, Sparkles } from 'lucide-react'
import { PublicShell, TempleMark } from '@/components/ui'
import { appDownloads } from '@/lib/app-downloads'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Download the TempleAddress app',
  description: 'Discover temples, explore festivals and keep your pooja bookings close with the TempleAddress mobile app.',
  alternates: { canonical: '/download-app' },
}

function DownloadOption({ available, platform, icon: Icon, label, title }) {
  const content = <>
    <span className={styles.platformIcon}><Icon size={28} aria-hidden="true" /></span>
    <span><small>{label}</small><strong>{title}</strong>{!available && <span className={styles.comingSoon}>Coming soon</span>}</span>
    <Download className={styles.downloadIcon} size={23} aria-hidden="true" />
  </>
  const className = `${styles.downloadOption} ${platform === 'android' ? styles.android : styles.ios}`
  return available
    ? <a className={className} href={platform === 'android' ? '/download-app/android' : '/download-ios'} download={platform === 'android' ? 'TempleaddressApp.apk' : undefined}>{content}</a>
    : <button className={className} type="button" disabled>{content}</button>
}

export default function DownloadAppPage() {
  const downloads = appDownloads()
  return <PublicShell>
    <section className={styles.page} aria-labelledby="download-title">
      <div className={styles.layout}>
        <div className={styles.intro}>
          <p className={styles.badge}><Download size={18} aria-hidden="true" />TempleAddress mobile app</p>
          <h1 id="download-title">Your spiritual journey, <span>wherever you go.</span></h1>
          <p className={styles.lead}>Discover temples, explore festivals, and connect with sacred experiences through the TempleAddress app.</p>
          <div className={styles.features}>
            <article><MapPin size={28} aria-hidden="true" /><h2>Discover sacred places</h2><p>Find temples, festivals, and spiritual experiences wherever you are.</p></article>
            <article><Sparkles size={28} aria-hidden="true" /><h2>Stay connected</h2><p>Keep meaningful temple services and pooja bookings within easy reach.</p></article>
          </div>
        </div>
        <div>
          <div className={styles.card}>
            <div className={styles.cardHero}>
              <span className={styles.arch} aria-hidden="true" />
              <span className={styles.appIcon}><TempleMark size={60} /></span>
              <p>TEMPLEADDRESS</p>
              <h2>Take the experience with you</h2>
            </div>
            <div className={styles.options}>
              <DownloadOption available={Boolean(downloads.android)} platform="android" icon={Smartphone} label="FOR ANDROID" title="Download APK for Android" />
              <DownloadOption available={Boolean(downloads.ios)} platform="ios" icon={Apple} label="FOR IPHONE & IPAD" title="Download for iOS" />
              {!downloads.android && <p className={styles.availability}>The Android download will be available here soon. You can continue using TempleAddress on the web.</p>}
              {downloads.android && <p className={styles.availability}>Download the Android APK, then open the downloaded file to install TempleAddress.</p>}
            </div>
          </div>
          <p className={styles.caption}>Simple tools for a more connected spiritual journey.</p>
        </div>
      </div>
    </section>
  </PublicShell>
}
