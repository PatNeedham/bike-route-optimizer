import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Bike Route Optimizer</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Bike Route Optimizer
        </h1>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://needham.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Pat
        </a>
      </footer>
    </div>
  )
}
