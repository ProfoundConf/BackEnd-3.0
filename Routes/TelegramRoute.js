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

async function generateImageFromHTML(htmlContent, outputPath) {
  const browser = await puppeteer.launch({ headless: false});
  const page = await browser.newPage();

  // Set the HTML content
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

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
    let test = await Services.ContactService.aggregate([ {$match: {}} ])
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

    // const htmlResponse = `
    //     <b>Інформація</b>
    //     <b>Унікальний ID:</b> ${user._id}
    //     <b>Ім'я:</b> ${user.fullName}
    //     <b>Телефон:</b> ${user.phone}
    // `;

    let filePath = './download.jpg'
    const imagePath = path.resolve(__dirname, '../cat.jpg')
    const fileUrl = `file://${imagePath.replace(/\\/g, '/')}`;

    const htmlContent = `
    <html>
    <head>
      <style>
          body {
              width: 486px;
              height: 920px;
              display: flex;
              justify-content: center;
              align-items: center;
              font-family: Arial, sans-serif;
              background: url('${fileUrl}') no-repeat center center;
              background-size: cover;
          }
      </style>
    </head>
    <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial;">
        <h1 style="color: blue;">Hello, Telegram!</h1>
    </body>
    </html>
  `;

    await generateImageFromHTML(htmlContent, filePath)

    bot.sendPhoto(chatId,fs.createReadStream(filePath), {caption: 'TEST!'})
    
    // // Send data back as HTML
    // bot.sendMessage(chatId, htmlResponse, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error processing contact:', error);
    bot.sendMessage(chatId, 'Помилка при обробці контакту, спробуй ще раз пізніше, або запитай у наших адмінів');
  }
});