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


bot.onText(/\/get_ticket/, async(msg) => {
  const chatId = msg.chat.id;

  let mainUser = await Services.ContactService.getOne({ chatId: chatId });

  if(!mainUser){
    bot.sendMessage(chatId, `Схоже ти ще не зареєструвався, або не заплатив, пройди оплату на нашому сайті, якщо хочеш отримати квиток в перший раз`);
    return { data: true}
  }

  let users = await Services.ContactService.get({ phone: mainUser.phone });

  if (!users.length) {
    let siteUrl = `http${process.env.NODE_ENV !== 'LOCAL' ? 's' : ''}://${process.env.APP_ORIGIN}${ process.env.NODE_ENV === 'LOCAL' ? process.env.APP_HOST : ''}`
    bot.sendMessage(chatId, `Я не зміг нічого знайти. Якщо ти насправді реєструвався через наш <a href="${siteUrl}">сайт</a>, запитай допомоги у адмінів.`, {
      parse_mode: 'HTML'
    });
    return { data: true }
  }

  for(let user of users){
    await Services.ContactService.updateOne(
        {
            _id: user._id
        },
        {
            chatId: chatId
        }
    )

    if(!user.paid){
      bot.sendMessage(chatId, `Ти зареєструвався ${users?.length > 1 ? `для ${user.fullName}` : ''}, але не заплатив. Щоб оплатити перейди за цим посиланням`, {
        parse_mode: 'HTML'
      });
      continue
    }
    let filePath = `./${user._id.toString()}_download.jpg`
    let url = `http${process.env.NODE_ENV !== 'LOCAL' ? 's' : ''}://${process.env.APP_ORIGIN}${process.env.APP_HOST}/ticket/${user._id}`

    await getUserTicket(filePath, url)

    await bot.sendPhoto(chatId,fs.createReadStream(filePath), {caption: `Ось твій квиток${users?.length > 1 ? ' ' + user.fullName : ''}, покажи його на реєстрації`})

    fs.unlink(filePath, () => {})
  }
});

async function getUserTicket(outputPath, ticketFrontUrl) {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.goto(ticketFrontUrl, { waitUntil: 'networkidle0' });
  await page.setViewport({
    width: 360,
    height: 627,
    deviceScaleFactor: 2
  })

  // Set the HTML content
  // await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Take a screenshot
  await page.screenshot({ path: outputPath, fullPage: true, type: 'jpeg', quality: 100 });
  await browser.close();
}

// Handle received phone number
bot.on('contact', async (msg) => {
  const chatId = msg.chat.id;
  let phoneNumber = msg.contact.phone_number;
  phoneNumber = phoneNumber.replace(/\D/g, '');

  try {
    // let test = await Services.ContactService.aggregate([ {$match: {}} ])
    // Check if the user already exists in the database
    let users = await Services.ContactService.get({ phone: phoneNumber });
    let siteUrl = `http${process.env.NODE_ENV !== 'LOCAL' ? 's' : ''}://${process.env.APP_ORIGIN}${ process.env.NODE_ENV === 'LOCAL' ? process.env.APP_HOST : ''}`
    if (!users.length) {
      bot.sendMessage(chatId, `Я не зміг нічого знайти. Якщо ти насправді реєструвався через наш <a href="${siteUrl}">сайт</a>, запитай допомоги у адмінів.`, {
        parse_mode: 'HTML'
      });
      return { data: true }
    }

    for(let user of users){
      await Services.ContactService.updateOne(
          {
              _id: user._id
          },
          {
              chatId: chatId
          }
      )

      if(!user.paid){
        bot.sendMessage(chatId, `Ти зареєструвався ${users?.length > 1 ? `для ${user.fullName}` : ''}, але не заплатив. Щоб оплатити перейди за цим <a href="${siteUrl}">посиланням</a>`, {
          parse_mode: 'HTML'
        });
        continue
      }
      let filePath = `./${user._id.toString()}_download.jpg`
      let url = `http${process.env.NODE_ENV !== 'LOCAL' ? 's' : ''}://${process.env.APP_ORIGIN}${ process.env.NODE_ENV === 'LOCAL' ? process.env.APP_HOST : ''}/ticket/${user._id}`

      console.log('URL:', url, user._id)
      await getUserTicket(filePath, url)

      await bot.sendPhoto(chatId,fs.createReadStream(filePath), {caption: `Ось твій квиток${users?.length > 1 ? ' ' + user.fullName : ''}, покажи його на реєстрації`})

      fs.unlink(filePath, () => {})
    }

    return { data: true }
  } catch (error) {
    console.error('Error processing contact:', error);
    bot.sendMessage(chatId, 'Помилка при обробці контакту, спробуй ще раз пізніше, або запитай у наших адмінів');
  }
});

module.exports = {
  getUserTicket,
  bot
}