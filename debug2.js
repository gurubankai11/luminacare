import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:5173/doctors', { waitUntil: 'networkidle0' });

  // Also capture console logs to see what's throwing
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  // wait a bit for splash screen to disappear
  await new Promise(r => setTimeout(r, 2000));

  const rootHtml = await page.$eval('#root', el => el.innerHTML);
  console.log('ROOT HTML:', rootHtml);

  await page.screenshot({ path: 'screenshot.png' });

  await browser.close();
})();
