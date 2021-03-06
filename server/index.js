// Setup basic express server
var express = require('express');
var app = express();
var http = require('http').Server(app);

var io = require('socket.io')(http);

// 链接数据库并初始化
// const db = require('./db')
const api = require('./api')
api(app)

http.listen(8081, function () {
  console.log('Server listening at port 8081');
});

var chat = {}
var roomNum = {}

io.on('connection', function(socket){
  console.log('center.vue connection')
  // room join

  // socket.on('userJoining', function (data) {
  //   console.log('userJoining')
  //   chat = data
  //   socket.account = chat.account
  //   socket.nickName = chat.nickName
  //   socket.broadcast.emit('userJoined', chat)
  //   // io.sockets.emit('userJoined', {chat})
  // })
  socket.on('joinToRoom', function (data) {
    console.log('joinToRoom')
    chat = data
    socket.account = chat.account
    socket.nickName = chat.nickName
    let roomGroupId = chat.chatToGroup
    // 在线人数
    if (!roomNum[roomGroupId]) {
      roomNum[roomGroupId] = []
    }
    roomNum[roomGroupId].push(socket.nickName)
    // console.log(roomNum[roomGroupId])
    console.log(roomNum[roomGroupId])

    socket.join(roomGroupId)
    io.sockets.in(roomGroupId).emit('joinToRoom', chat)
    io.sockets.in(roomGroupId).emit('updateGroupNumber', roomNum[roomGroupId])
  })
  socket.on('leaveToRoom', function (data) {
    console.log('leaveToRoom')
    chat = data
    socket.account = chat.account
    socket.nickName = chat.nickName
    let roomGroupId = chat.chatToGroup
    // 从房间名单中移除
    let index = roomNum[roomGroupId].indexOf(socket.nickName);
    if (index !== -1) {
      roomNum[roomGroupId].splice(index, 1);
    }
    console.log(roomNum[roomGroupId])

    socket.leave(roomGroupId)
    io.sockets.in(roomGroupId).emit('leaveToRoom', chat)
    io.sockets.in(roomGroupId).emit('updateGroupNumber', roomNum[roomGroupId])
  })

  socket.on('disconnect', function () {
    console.log('one disconnect')
    chat = {
      account: socket.account,
      nickName: socket.nickName,
      chatTime: Date.parse(new Date()),
      chatMes: 'off-line',
      chatToId: 401,
      chatType: 'tips'     // chat/tips
    }
    socket.broadcast.emit('userQuit', chat);
  })
  // 接收消息
  socket.on('emitChat', function (data) {
    chat = data
    console.log(data)
    let roomGroupId = chat.chatToGroup
    socket.in(roomGroupId).emit('broadChat', chat)
  })
});


