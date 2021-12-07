const dotenv = require('dotenv').config()
const uniqId = require('uniqid');

const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN)

const welcomeMsg = `Hi! I'm Secret Santa bot. 
Do you want to create a new Group for you and your friends?`;
const keyboard = Markup.inlineKeyboard([
  Markup.button.callback('Create Group', 'createGroup'),
  Markup.button.callback('Join Group', 'invite')
]);
let creationProcess = false;
let joiningProcess = false;
let groups = [];
let checkGroupID = (ID) => {
  let check = false;
  groups.forEach((group) => {
    if (group.id == ID) {
      check = true;
    }
  })
  return check;
}
let addUserInGroup = (ID, userID) => {
  let check = (group) => {
    return group.id == ID;
  }
  let i = groups.findIndex(check);
  groups[i].userList.push(userID);
}
let addGroup = (group) => {
  groups.push(group);
}

bot.start((ctx) => ctx.reply(welcomeMsg, keyboard))
bot.action('createGroup', (ctx, next) => {
  ctx.reply('Nice! How do we name it?');
  creationProcess = true;
  return next();
})
bot.on('message', (ctx, next) => {
  if (creationProcess) {
    let group = {};
    group.name = ctx.message.text;
    group.id = uniqId();
    group.creator = ctx.chat.id;
    group.userList= [ctx.chat.id];
    creationProcess = false;
    addGroup(group);
    ctx.reply('Cool name!');
    ctx.reply(`Group created.
Your group ID is:
${group.id}`);
    return next();
  } else {
    return next()
  }
});
bot.action('invite', (ctx) => {
  ctx.reply(`Sure, you can join group if you want.
Just send me Group ID`);
  joiningProcess = true;
})
bot.on('message', (ctx, next) => {
  if (joiningProcess) {
    recivedID = ctx.message.text;
    if (checkGroupID(recivedID)) {
      console.log('In');
      addUserInGroup(recivedID, ctx.chat.id);
      ctx.reply('You in!');
      joiningProcess = false;
      return next();
    } else {
      ctx.reply('I know nothing about group with that ID. =(');
      joiningProcess = false;
      return next();
    }
  } else {
    return next()
  }
});

bot.hears('groupList', (ctx) => (ctx.reply(groups)));


bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))