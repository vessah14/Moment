// Mesure sur « téléphone lent » : processeur ralenti ×4 et réseau 3G (1,6 Mb/s, 300 ms),
// comme un Android d'entrée de gamme à Douala. Affiche FCP, LCP, CLS et le poids transféré.
//
//   npm i -D puppeteer-core            (une fois ; utilise le Chrome déjà installé)
//   node scripts/slow-device.mjs https://tbfmoment.com/ https://tbfmoment.com/tarifs
//
// CHROME_PATH pour un autre emplacement de Chrome. Objectifs Google (mobile) :
// LCP < 2,5 s, CLS < 0,1.
import puppeteer from 'puppeteer-core'

const urls = process.argv.slice(2)
if (!urls.length) {
  console.error('Usage : node scripts/slow-device.mjs <url> [url…]')
  process.exit(1)
}

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
for (const url of urls) {
  const page = await browser.newPage()
  await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 })
  const cdp = await page.createCDPSession()
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 300, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  let bytes = 0
  cdp.on('Network.loadingFinished', (e) => (bytes += e.encodedDataLength))
  await page.evaluateOnNewDocument(() => {
    window.__lcp = 0
    window.__cls = 0
    new PerformanceObserver((l) => { const e = l.getEntries().at(-1); if (e) window.__lcp = e.startTime }).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 180_000 })
  const m = await page.evaluate(() => ({ fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0, lcp: window.__lcp, cls: window.__cls }))
  console.log(`${url}\n  FCP ${(m.fcp / 1000).toFixed(1)} s · LCP ${(m.lcp / 1000).toFixed(1)} s · CLS ${m.cls.toFixed(3)} · ${Math.round(bytes / 1024)} Ko transférés`)
  await page.close()
}
await browser.close()
