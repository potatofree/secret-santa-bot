const dotenv = require('dotenv').config()
const uniqId = require('uniqid');

const { Bot, InlineKeyboard } = require('grammy');

const bot = new Bot(process.env.BOT_TOKEN)

const welcomeMsg = `Hi! I'm Secret Santa bot. 
Do you want to create a new Group for you and your friends?`;
const keyboard = new InlineKeyboard()
  .text('Create Group', 'startCreationProcess')
  .text('Join Group', 'startJoiningProcess')

let groups = [];

let basicMessageHandler = (ctx, next) => {
  return next()
};

var messageHandler = basicMessageHandler;

const checkGroupID = (ID) => {
  let check = false;
  groups.forEach((group) => {
    if (group.id == ID) {
      check = true;
    }
  })
  return check;
}

const addUserInGroup = (ID, userID) => {
  let check = (group) => {
    return group.id == ID;
  }
  let i = groups.findIndex(check);
  groups[i].userList.push(userID);
}
const addGroup = (group) => {
  group.status = 'Open';
  groups.push(group);
}

const startCreationProcess = async (ctx, next) => {
  await ctx.reply('Nice! How do we name it?');
  messageHandler = createGroup;
  return next();
}

const createGroup = async (ctx, next) => {
  let group = {
    name: ctx.message.text,
    id: uniqId(),
    creator: ctx.chat.id,
    userList: [ctx.chat.id],
  };
  addGroup(group);
  await ctx.reply('Cool name!');
  await ctx.reply(`Group created.
Your group ID is:
${group.id}`);
  ctx.reply(group.id);
  messageHandler = basicMessageHandler;
  return next();
}
const startJoiningProcess = (ctx) => {
  ctx.reply(`Sure, you can join group if you want.
Just send me Group ID`);
  messageHandler = joinGroup;
};

const joinGroup = (ctx, next) => {
  recivedID = ctx.message.text;
  if (checkGroupID(recivedID)) {
    addUserInGroup(recivedID, ctx.chat.id);
    ctx.reply('You in!');
  } else {
    ctx.reply('I know nothing about group with that ID. =(');
  }
  messageHandler = basicMessageHandler;
  return next();
};

bot.command('start', async (ctx) => await ctx.reply(welcomeMsg, { reply_markup: keyboard }))

bot.callbackQuery('startCreationProcess', startCreationProcess)
bot.callbackQuery('startJoiningProcess', startJoiningProcess)

bot.on('message', (ctx, next) => { messageHandler(ctx, next) });

const getUserGroupList = (id) => {
  let list = [];
  groups.forEach((group) => {
    if (group.userList.includes(id)) {
      list.push(group);
    }
  })
  return list;
}

const startEvent = (ctx, next) => {
  let groupList = getUserGroupList(ctx.chat.id);
  let groupNamesList = [];
  groupList.forEach((group) => {
    let s = `${group.name} (${group.id}) ${group.status}`;
    groupNamesList.push(s);
  })
  if (!groupNamesList.length) {
    ctx.reply(`You haven't joined any group. Try the /start for begining.`);
    return next();
  } else if (groupNamesList.length == 1) {
    startEventConfirmation(groupList[0]);
    return next();
  } else {
    let s = 'Your groups: \n';
    groupNamesList.forEach((group, i) => {
      s += `${i + 1}: ${group} \n`
    });
    ctx.reply(s);
    ctx.reply(`Which group do you want to start? (1-${groupNamesList.length})`);

    return next();
  };

}
bot.command('startevent', startEvent);

//  
bot.hears('groupList', (ctx) => (ctx.reply(groups)));


bot.start()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

// exports for the tests
exports.startCreationProcess = startCreationProcess;
exports.createGroup = createGroup;
exports.checkGroupID = checkGroupID;
exports.startJoiningProcess = startJoiningProcess;
exports.addGroup = addGroup;
exports.joinGroup = joinGroup;