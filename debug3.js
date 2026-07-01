import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Wait for 4 seconds to let the loader finish
  await new Promise(r => setTimeout(r, 4000));

  const rootHtml = await page.$eval('#root', el => el.innerHTML);
  console.log('ROOT HTML LENGTH:', rootHtml.length);
  console.log('ROOT HTML SNIPPET:', rootHtml.substring(0, 500));

  await browser.close();
})
  ();
