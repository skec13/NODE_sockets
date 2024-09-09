// imports
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/isRealString');
const {Users} = require('./utils/users');

// path to server folder
const publicPath = path.join(__dirname, '/../public');

// init the express
let app = express();

// use the http module to have access to server property
let server = http.createServer(app);

// init socketIO
let io = socketIO(server);

// custom Users class
let users = new Users();

// middleware for express to serve static pages
app.use(express.static(publicPath));

// event listener for socket connections
io.on('connection', (socket) => {
  console.log('Client connected');

  // joining the same room
  socket.on('join', (params, callback) => {
    if(!isRealString(params.name) || !isRealString(params.room)){
      return callback('Name and room are required');
    } else {

      socket.join(params.room);

      // remove user from other rooms
      users.removeUser(socket.id);
      // add user to the room
      users.addUser(socket.id, params.name, params.room);
      // broadcast to everyone the new users array
      io.to(params.room).emit('updateUsersList', users.getUserList(params.room));


      // first greet when new user connects
      socket.emit('newMessage', generateMessage('Admin', `Welcome to ${params.room}`))

      // sending all other users that someone new joined
      socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user joined!'))

      callback();
    }
  })

  // event for creating a message
  socket.on('createMessage', (message, callback) => {
    let user = users.getUser(socket.id);

    if(user && isRealString(message.text)){
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }

    callback('This is from server');
  });

  // geolocation message
  socket.on('createLocationMessage', (coords) => {
    let user = users.getUser(socket.id)

    if(user){
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.lat, coords.lng));
    }
  })

  socket.on('disconnect', () => {
    let user = users.removeUser(socket.id);
    if(user){
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has lest ${user.room} chat room.`));
    }
  });
})


// port number
const port = process.env.PORT || 3000;

// init the server
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
  console.log(`http://localhost:${port}`);
});
