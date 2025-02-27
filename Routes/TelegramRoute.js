const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
dotenv.config()
const Services = require('../Services')

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

// Handle received phone number
bot.on('contact', async (msg) => {
  const chatId = msg.chat.id;
  let phoneNumber = msg.contact.phone_number;
  phoneNumber = phoneNumber.replace(/\D/g, '');

  try {
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

    const htmlResponse = `
        <b>Інформація</b>
        <b>Унікальний ID:</b> ${user._id}
        <b>Ім'я:</b> ${user.fullName}
        <b>Телефон:</b> ${user.phone}
    `;
    
    // Send data back as HTML
    bot.sendMessage(chatId, htmlResponse, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error processing contact:', error);
    bot.sendMessage(chatId, 'Помилка при обробці контакту, спробуй ще раз пізніше, або запитай у наших адмінів');
  }
});