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
      bot.sendMessage(chatId, `Ти зареєструвався ${users?.length > 1 ? `для ${user.fullName} ` : ''}, але не заплатив. Щоб оплатити перейди за цим посиланням`, {
        parse_mode: 'HTML'
      });
      continue
    }
    let filePath = `./${user._id.toString()}_download.jpg`
    let url = `http${process.env.NODE_ENV !== 'LOCAL' ? 's' : ''}://${process.env.APP_ORIGIN}${process.env.APP_HOST}/ticket/${user._id}`

    // await getUserTicket(filePath, url)

    await bot.sendMessage(chatId, `Ось твій квиток ${url}`, {
      
    })
    // await bot.sendPhoto(chatId,fs.createReadStream(filePath), {caption: `Ось твій квиток${users?.length > 1 ? ' ' + user.fullName : ''}, покажи його на реєстрації`})

    // fs.unlink(filePath, () => {})
  }
});

async function getUserTicket(outputPath, ticketFrontUrl) {
  const browser = await puppeteer.launch({ 
    headless: process.env.NODE_ENV === 'LOCAL' ? false : true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.goto(ticketFrontUrl, { waitUntil: 'networkidle0' });
  await page.setViewport({
    width: 360,
    height: 627,
    deviceScaleFactor: 2
  })

  await page.evaluate(() => {
    const btnL = document.querySelector('.btn-back-laptop');
    if (btnL) {
      btnL.remove();
    }
    const btn = document.querySelector('.btn-back');
    if (btn) {
      btnL.remove();
    }
  });

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
        // bot.sendMessage(chatId, Ти зареєструвався ${users?.length > 1 ? `для ${user.fullName} : ''}, але не заплатив. Щоб оплатити перейди за цим <a href="${siteUrl}">посиланням</a>`, {
        //   parse_mode: 'HTML'
        // });
        continue
      }
      let filePath = `./${user._id.toString()}_download.jpg`
      let url = `http${process.env.NODE_ENV !== 'LOCAL' ? 's' : ''}://${process.env.APP_ORIGIN}${ process.env.NODE_ENV === 'LOCAL' ? process.env.APP_HOST : ''}/ticket/${user._id}`

      console.log('URL:', url, user._id)
      // await getUserTicket(filePath, url)

      // await bot.sendPhoto(chatId, fs.createReadStream(filePath), {
      //   caption: `Ось твій квиток${users?.length > 1 ? ' ' + user.fullName : ''}, покажи його на реєстрації\n\n<a href="${url}">Відкрити квиток у браузері</a>`,
      //   parse_mode: 'HTML'
      // })

      await bot.sendMessage(chatId, `Ось твій квиток :) \n${url}`, {
        parse_mode: 'HTML'
      });
      
      
      fs.unlink(filePath, () => {})
    }

    return { data: true }
  } catch (error) {
    console.error('Error processing contact:', error);
    bot.sendMessage(chatId, 'Помилка при обробці контакту, спробуй ще раз пізніше, або запитай у наших адмінів');
  }
});

bot.onText(/\/broadcast_tickets/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    // Get all users who have paid
    const users = await Services.ContactService.get({ paid: true, chatId: { $exists: true } });
    
    if (!users.length) {
      bot.sendMessage(chatId, 'Наразі немає користувачів з оплаченими квитками.');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (let user of users) {
      if (!user.chatId) {
        failCount++;
        continue;
      }

      try {
        const url = `http${process.env.NODE_ENV !== 'LOCAL' ? 's' : ''}://${process.env.APP_ORIGIN}${process.env.NODE_ENV === 'LOCAL' ? process.env.APP_HOST : ''}/ticket/${user._id}`;
        
        await bot.sendMessage(user.chatId, 
          `Добрий вечір!\nВибач, якщо трішки принесли дискомфорт з реєстрацією. Бот трішки налякався від кількості реєстрацій) \nБудь впевнений, що ти зареєструвався. Тримай повторне посилання на квиток: \n${url}`, {
          parse_mode: 'HTML'
        });
        
        successCount++;
      } catch (err) {
        console.error(`Failed to send message to user ${user._id}:`, err);
        failCount++;
      }

      // Add small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    bot.sendMessage(chatId, 
      `Розсилка завершена!\nУспішно відправлено: ${successCount}\nНе вдалося відправити: ${failCount}`
    );

  } catch (error) {
    console.error('Error in broadcast:', error);
    bot.sendMessage(chatId, 'Сталася помилка при виконанні розсилки.');
  }
});

module.exports = {
  getUserTicket,
  bot
}