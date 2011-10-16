var io = require('socket.io').listen(8080),
	users = {};

var lobby = io
	.of('/lobby')
	.on('connection', function (socket) {
		var randomId = Math.random();
		console.log('Client connected' + randomId);
		users[randomId] = socket.id = true;
		

		socket.on('join-lobby', function (clientId) {
			console.log('Client joined' + clientId);
			users[randomId] = socket.id = clientId;
			socket.broadcast.emit('users', users);
		});
		
		socket.on('play', function (opponentId) {
			console.log('Client play' + opponentId);
			socket.broadcast.emit('play', opponentId, socket.id);
		});
		
		socket.on('leave-lobby', function () {
			if (!users[randomId]) return;
			delete users[randomId];
			socket.broadcast.emit('users', users);
		});
		
		
		socket.on('key', function (opponentId, keyCode, isKeyDown) {
			console.log('Client key' + opponentId + '|' + keyCode + '|' + isKeyDown);
			socket.broadcast.emit('key', opponentId, keyCode, isKeyDown);
		});	
		
		socket.on('screenshot', function (opponentId, dataurl) {
			socket.broadcast.emit('screenshot', opponentId, dataurl);
		});	

		socket.on('disconnect', function() {
			console.log('Client disconnect' + randomId);
			if (!users[randomId]) return;

			delete users[randomId];
			socket.broadcast.emit('users', users);
		});

	});
