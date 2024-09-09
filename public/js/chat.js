let socket = io();

socket.on("connect", function () {
  console.log("connected");
  let searchQuery = window.location.search.substring(1);
  let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, '').replace(/=/g, '":"') + '"}');
  socket.emit('join', params, function(err) {
    if (err) {
      alert(err);
      window.location.href = "/";
    } else {
      console.log('No error');
    }
  })
});

socket.on("disconnect", function () {
  console.log("disconnected");
});

socket.on('updateUsersList', function (users) {
  let ol = document.createElement('ol');
  users.forEach(function (user) {
    let li = document.createElement('li');
    li.innerHTML = user;
    ol.appendChild(li);
  });

  let userList = document.getElementById('users');
  userList.innerHTML = '';
  userList.appendChild(ol);

});

socket.on('newMessage', function (message) {
  const formattedTime = moment(message.createdAt).format('LT');
  console.log(message);
  let li = document.createElement('li');
  li.innerText = `${message.from} ${formattedTime}: ${message.text}`;
  li.classList.add('messages');
  document.getElementById('messages').appendChild(li);
});

socket.on('newLocationMessage', function (message) {
  const formattedTime = moment(message.createdAt).format('LT');
  let li = document.createElement('li');
  let a = document.createElement('a');
  li.innerText = `${message.from} ${formattedTime}: `;
  li.classList.add('messages');
  a.setAttribute('target', '_blank');
  a.setAttribute('href', message.url);
  a.innerText = 'My current location'
  li.appendChild(a);
  document.getElementById('messages').appendChild(li);
})

document.getElementById('submit-btn').addEventListener('click', function (e) {
  e.preventDefault();
  socket.emit('createMessage', {
    text : document.querySelector('input[name="message"]').value
  }, function () {

  })
});

document.getElementById('send-location').addEventListener('click', function (e) {
  e.preventDefault();
  if(!navigator.geolocation){
    return alert("Geolocation is not supported");
  }

  navigator.geolocation.getCurrentPosition(function (position) {
    socket.emit('createLocationMessage', {
      lat : position.coords.latitude,
      lng : position.coords.longitude
    })
  }, function (){
    alert("Unable to get current location");
  })
})
