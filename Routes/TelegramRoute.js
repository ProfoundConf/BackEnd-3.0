const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer');
dotenv.config()
const Services = require('../Services')
const fs = require('fs')
const path = require("path")

const token = process.env.TELEGRAM_KEY;
const bot = new TelegramBot(token, { polling: true });

// Handle '/start' command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  // Send a message asking for the phone number
  bot.sendMessage(chatId, 'Привіт! Надішли свій номер телефону, щоб отримати всю необіхідну інформацію', {
    reply_markup: {
      keyboard: [[{ text: 'Надішли номер', request_contact: true }]],
      one_time_keyboard: true
    }
  });
});

async function generateImageFromHTML(outputPath, url) {
  const browser = await puppeteer.launch({ headless: false});

  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.setViewport({
    width: 360,
    height: 627
  })

  // Set the HTML content
  // await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Take a screenshot
  await page.screenshot({ path: outputPath, fullPage: true });
  // await browser.close();
}

// Handle received phone number
bot.on('contact', async (msg) => {
  const chatId = msg.chat.id;
  let phoneNumber = msg.contact.phone_number;
  phoneNumber = phoneNumber.replace(/\D/g, '');

  try {
    // let test = await Services.ContactService.aggregate([ {$match: {}} ])
    // Check if the user already exists in the database
    let user = await Services.ContactService.getOne({ phone: phoneNumber });

    if (!user) {
      bot.sendMessage(chatId, 'Я не зміг нічого знайти. Якщо ти насправді реєструвався через наш сайт, запитай допомоги у адмінів.');
      return { data: true }
    }

    await Services.ContactService.updateOne(
        {
            _id: user._id
        },
        {
            chatId: chatId
        }
    )

    let filePath = `./${user._id.toString()}_download.jpg`
    let url = `http${process.env.NODE_ENV !== 'LOCAL' ? 's' : ''}://${process.env.APP_ORIGIN}${process.env.APP_HOST}/ticket/${user._id}`

    await generateImageFromHTML(filePath, url)

    await bot.sendPhoto(chatId,fs.createReadStream(filePath), {caption: 'TEST!'})

    fs.unlink(filePath, () => {})
    
  } catch (error) {
    console.error('Error processing contact:', error);
    bot.sendMessage(chatId, 'Помилка при обробці контакту, спробуй ще раз пізніше, або запитай у наших адмінів');
  }
});