const path = require("path");
const puppeteer = require("puppeteer");
const fs = require("fs");

require("dotenv").config();
const EDU_USERNAME = process.env.EDU_USERNAME
const EDU_PASSWORD = process.env.EDU_PASSWORD;
if(!fs.existsSync("./downloads")){
  fs.mkdirSync("./downloads");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const downloadPath = path.resolve("./downloads");

const files = fs.readdirSync(downloadPath);
console.log(files);
var fileToUpload;
let mostRecentFile;
let mostRecentTime = 0;
for (const file of files) {
  if (file.endsWith(".pdf")) {
    const filePath = path.join(downloadPath, file);
    const stats = fs.statSync(filePath);
    const modifiedTime = stats.mtimeMs;

    if (modifiedTime > mostRecentTime) {
      mostRecentFile = file;
      mostRecentTime = modifiedTime;
      fileToUpload = filePath;
    }
  }
}


(async () => {
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    process.env.EDU_URL
  );
  await page.setViewport({ width: 1080, height: 1024 });

  (await page.waitForSelector("#ep4")).click();
  await sleep(500);
  (await page.waitForSelector("#valider")).click();
  await sleep(1000);
  const boutonEleve = await page.waitForSelector("#bouton_eleve");
  await boutonEleve.click();
  await sleep(1000);
  const usernameInput = await page.waitForSelector("#username");
  await usernameInput.click();
  await usernameInput.type(EDU_USERNAME);
  const passwordInput = await page.waitForSelector("#password");
  await passwordInput.click();
  await passwordInput.type(EDU_PASSWORD);
  const submitBtn = await page.waitForSelector("#bouton_valider");
  await submitBtn.click();
  await sleep(1000);


  await page.goto(process.env.ADD_FILE_URL);


  await sleep(1000);
  const dropZonePicker = await page.waitForSelector("#ctl00_ContentPlaceHolder_UploadControl_UploadArea > upload-area > div > dropzone-picker > button");
  await dropZonePicker.click();
  const file = fileToUpload;
  // const file = path.join(__dirname, downloadPath, "MENU du 9 au 13 octobre 2023.pdf");
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click('#local-picker'),
  ]);
  await fileChooser.accept([file]);
  await sleep(1000);
  const sendBtn = await page.waitForSelector("#ctl00_ContentPlaceHolder_MainContainer > section > div.h-is-above-tablet-portrait.h-mrt10 > button");
  await sendBtn.click();

  await sleep(3000);
  await browser.close();

})();
