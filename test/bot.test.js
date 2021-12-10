const test = require('ava');

const {createGroup, startCreationProcess, checkGroupID, startJoiningProcess, addGroup, joinGroup} = require('../bot')

test.cb('should pass', (t) => {
  t.is(1, 1);
  t.end();
});

const context = () => {
    const replies = []
    ctx = {
        reply: msg => {replies.unshift(msg)},
        replies: replies,
        chat: {id: 'user-id'},
    }
    return ctx
}

const text = (msg) => {
    return {text: msg}
}

// TODO: make it a suite: Create Group
// test.cb('should show a message')
test.cb('should prompt for a name', (t) => {
    ctx = context()

    startCreationProcess(ctx, () => {
        t.is(ctx.replies[0], 'Nice! How do we name it?')
        
        ctx.message = text('Me myself and I')
        createGroup(ctx, () => {

            groupId = ctx.replies[0];
            t.true(checkGroupID(groupId), `${groupId} not found`);
            t.end()
        })
    })
})


test.cb('should add the second group', (t) => {
    ctx = context()

    startCreationProcess(ctx, () => {
        t.is(ctx.replies[0], 'Nice! How do we name it?')
        
        ctx.message = text('Me myself and I')
        createGroup(ctx, () => {

            groupId = ctx.replies[0];
            t.true(checkGroupID(groupId), `${groupId} not found`);
            t.end()
        })
    })
})

test.cb('should add user to a group', (t) => {
    ctx = context()

    const group = {
        id: 'testID',
        userList: []
    };
    addGroup(group);
    startJoiningProcess(ctx)
    t.is(ctx.replies[0], `Sure, you can join group if you want.
Just send me Group ID`);
    ctx.message = text(group.id)
    joinGroup(ctx, () => {
        t.is(group.userList[0], ctx.chat.id);
        t.end()
    })
})

