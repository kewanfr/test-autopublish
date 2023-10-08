const path = require("path");
const puppeteer = require("puppeteer-extra");

require("dotenv").config();
const ID = process.env.ARD_USERNAME
const PWD = process.env.ARD_PASSWORD;
const fs = require("fs");
if(!fs.existsSync("./downloads")){
  fs.mkdirSync("./downloads");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const downloadPath = path.resolve("./downloads");
console.log("Telechargement du menu...");
(async () => {
  puppeteer.use(
    require("puppeteer-extra-plugin-user-preferences")({
      headless: false,
      timeout: 30000,
      ignoreHTTPSErrors: true,
      userPrefs: {
        download: {
          prompt_for_download: false,
          // open_pdf_in_system_reader: true,
          directory_upgrade: true,
          default_directory: downloadPath,
          extensions_to_open: "applications/pdf",
        },
        plugins: {
          always_open_pdf_externally: true,
          plugins_disabled: ["Chrome PDF Viewer"],
        },
      },
    })
  );
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    process.env.ARD_URL
  );
  await page.setViewport({ width: 1080, height: 1024 });

  page.waitForSelector("#news2020hide").then((selector) => {
    selector.click();
  });

  console.log("Connexion...");

  const idInput = await page.locator("#tx-newloginbox-pi1-user");
  await idInput.fill(ID);

  const pwdInput = await page.locator("#tx-newloginbox-pi1-pass");
  await pwdInput.fill(PWD);

  const submitBtn = await page.locator("#login");
  await submitBtn.click();

  await sleep(1000);
  console.log("Telechargement...");

  await page.goto(
    process.env.ARD_URL_MENU
  );

  await sleep(1000);
  
  const downloadBtn = await page.waitForSelector("#menuPdf > div > a");
  const link = await page.evaluate((el) => el.href, downloadBtn);
  console.log(link);

  // await downloadBtn.click();
  // download pdf from link
  // await page.pdf({
  //   path: path.join(downloadPath, "menu.pdf"),
  //   format: "A4",
  // });
  const session = await page.target().createCDPSession()
  await session.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath
  })
  await page.goto(link, { waitUntil: "networkidle0" });
  await sleep(5000);
  console.log("Fermeture du navigateur...");
  // await browser.close();
})();
