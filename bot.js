const dotenv = require('dotenv').config()
const uniqId = require('uniqid');

const { Telegraf, Markup } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

const welcomeMsg = `Hi! I'm Secret Santa bot. 
Do you want to create a new Group for you and your friends?`;
const keyboard = Markup.inlineKeyboard([
  Markup.button.callback('Yes, I want!', 'createGroup'),
  Markup.button.callback("No, I don't", 'invite')
])
let creationProcess = false;
var group = {
  name: 'name',
  id: ''
};

bot.start((ctx) => ctx.reply(welcomeMsg, keyboard))
bot.action('createGroup', (ctx) => {ctx.reply('Nice! How do we name it?');
  creationProcess = true;})
bot.on('message', (ctx, next) => { if (creationProcess) { group.name = ctx.message.text; group.id = uniqId(); creationProcess = false; ctx.reply('Cool name!')} else {next()}});
bot.hears('group', (ctx) => (ctx.reply(group)));

// bot.help((ctx) => ctx.reply('Send me a sticker'))
// bot.on('sticker', (ctx) => ctx.reply('👍'))

// bot.hears('hi', (ctx) => ctx.reply('Hey there'))
// bot.hears('message', (ctx) => ctx.reply(ctx.message.chat.id))
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))