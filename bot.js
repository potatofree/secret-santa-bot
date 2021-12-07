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

const createGroup = (ctx, next) => {
  ctx.reply('Nice! How do we name it?');
  creationProcess = true;
  return next();
}

bot.action('createGroup', createGroup)

const onCreationMessage = (ctx, next) => {
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
    ctx.reply(group.id);
    return next();
  } else {
    return next()
  }
}
const startJoiningProcess = (ctx) => {
  ctx.reply(`Sure, you can join group if you want.
Just send me Group ID`);
  joiningProcess = true;
};
const joinGroup = (ctx, next) => {
  if (joiningProcess) {
    recivedID = ctx.message.text;
    if (checkGroupID(recivedID)) {
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
};

bot.on('message', onCreationMessage);
bot.action('invite', startJoiningProcess)
bot.on('message', joinGroup);

bot.hears('groupList', (ctx) => (ctx.reply(groups)));


bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

exports.createGroup = createGroup;
exports.onCreationMessage = onCreationMessage;
exports.checkGroupID = checkGroupID;
exports.startJoiningProcess = startJoiningProcess;
exports.addGroup = addGroup;
exports.joinGroup = joinGroup;