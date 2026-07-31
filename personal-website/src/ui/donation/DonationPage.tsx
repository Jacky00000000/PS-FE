import { useState } from 'react'
import styles from './DonationPage.module.css'

const QR_CODE_SRC = '/QRcode.jpeg'

export function DonationPage() {
  const [qrLoaded, setQrLoaded] = useState(false)
  const [qrFailed, setQrFailed] = useState(false)

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.content}>
          <h1 className={styles.title}>支持我</h1>
          <p className={styles.description}>
            多謝晒！掃描下面嘅 QR 碼就可以啦～
          </p>
          <div className={styles.qrWrapper}>
            {!qrLoaded && !qrFailed && (
              <div className={styles.qrPlaceholder} aria-hidden="true">
                <span className={styles.qrPlaceholderText}>QR code</span>
              </div>
            )}
            {qrFailed && (
              <div className={styles.qrPlaceholder}>
                <span className={styles.qrPlaceholderText}>QR code coming soon</span>
              </div>
            )}
            <img
              src={QR_CODE_SRC}
              alt="Donation QR code"
              className={`${styles.qrImage} ${qrLoaded ? styles.qrImageVisible : ''}`}
              onLoad={() => setQrLoaded(true)}
              onError={() => setQrFailed(true)}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
