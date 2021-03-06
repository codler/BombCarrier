
window.URL = window.URL || window.webkitURL;
window.BlobBuilder = window.BlobBuilder || 
					 window.WebKitBlobBuilder ||
               		 window.MozBlobBuilder;

var _GAME_ = _GAME_ || {};

var SCREEN_WIDTH  = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var container, stats;

var camera, scene, renderer;
var projector;
var loader;

var group;
var bombs;
var time = 0;

var mouse = { x: 0, y: 0 };

var player1, player2;

var debugElement;


var fightTime;

var delta, time, oldTime;

var tileSystem;

var background_sound;

var textures = {
	'bg-paper'     : 'bg-paper.png',
	'bg-blue'      : 'bg-blue.png',
	'bg-yellow'    : 'bg-yellow.png',
	'map-a'        : 'Dirt Block.png',
	'map-b'        : 'Stone Block Tall.png',
	'map-c'        : 'Water Block.png',
	'blue-block'   : 'Gem Blue.png',
	'green-block'  : 'Gem Green.png',
	'yellow-block' : 'Gem Orange.png',
	'char-1'       : 'Character Princess Girl.png',
	'bomb'         : 'bomb.png',
	'explosion2'   : 'explosion2.png',
	'explosion3'   : 'explosion3.png',
	'upgrade-life' : 'Heart.png',
	'upgrade-power': 'Star.png',
	'upgrade-bomb' : 'Rock.png',
	'tree-small'   : 'Tree Short.png',
	'tree-big'     : 'Tree Tall.png',
	'grass'		   : 'Grass Block.png',
	'blue-grass'   : 'Grass Blue.png',
	'green-grass'  : 'Grass Green.png',
	'orange-grass' : 'Grass Orange.png',
	'blue-wood'	   : 'Wood Blue.png',
	'green-wood'   : 'Wood Green.png',
	'orange-wood'  : 'Wood Orange.png',
	'wood'		   : 'Wood Block.png',
	'wall'		   : 'Wall Block Tall.png',
	'window'	   : 'Window Block.png',
	'door'		   : 'Door Tall Closed.png'
};

var game_alive = false;

var sceneHandler;

var socket;
var remote = 0;

function init_game() {
	_GAME_.texture = new TextureClass();
	_GAME_.branch_3D = false;

	if (_GAME_.branch_3D) {
		loaded_images['a'] = document.createElement('img');
		loaded_images['b'] = document.createElement('img');

		loaded_images['a'].src = 'test/top.png';
		loaded_images['b'].src = 'test/Gem Green.png';
	}

	_GAME_.texture.preload(textures);
}

// Initialize core - canvas, camera, scene, debuginfo
function init_core() {

	container = $('<div>');
	$('body').append( container );

	projector = new THREE.Projector();

	camera = new THREE.PerspectiveCamera( 
		60, 							// FOV, field of view
		SCREEN_WIDTH / SCREEN_HEIGHT, 	// Aspect ratio
		1, 								// Near
		10000 							// Far
	);
	camera.position.z = 1000;
	if (_GAME_.branch_3D) {
		camera.position.y = -600;
		camera.position.z = 600;
	}
	camera.lookAt( new THREE.Vector3(0,0,0) );

	loader = new THREE.Loader( true );

	scene = new THREE.Scene();

	// renderer
	renderer = new THREE.WebGLRenderer();
	//renderer.setClearColorHex( 0x000000, 1 );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

	container.append( renderer.domElement );

	var fixAspectRatio = function() {
		SCREEN_WIDTH = window.innerWidth;
		SCREEN_HEIGHT = window.innerHeight;

		// Fix aspect ratio
		if (SCREEN_WIDTH / SCREEN_HEIGHT < 1.8) {
			SCREEN_HEIGHT = SCREEN_WIDTH * 0.5;
			$('canvas:first').height(SCREEN_HEIGHT);
		} else {
			$('canvas:first').height('100%');
		}

		renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
		camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
		camera.updateProjectionMatrix();
	};
	
	fixAspectRatio();
	
	// Event listener
	$(window).resize(fixAspectRatio);

	container.mousemove( onDocumentMouseMove );

	// Debug box
	if (DEBUG) {

		debugElement = $('<div>').css({
			'background-color' : '#ccc',
			'margin-left' : 80,
			'opacity' : 0.5,
			'position' : 'absolute',
			'top' : 0,
			'z-index' : 1001
		});
		if (location.hash == '#debug') {
			container.append( debugElement );
			
		}
	}

	// Sound on/off
	if (localStorage.getItem('sound_on') == null) {
		localStorage.setItem('sound_on', 1); // On by default
	}

	var sound_switch = $('<div>').css({
		'background-color' : '#ccc',
		'cursor' : 'pointer',
		'position' : 'absolute',
		'top' : 0,
		'right' : 0,
		'z-index' : 1002
	}).text(parseInt(localStorage.getItem('sound_on')) ? 'Sound on': 'Sound off');

	sound_switch.click(function () {
		var sound_on = parseInt(localStorage.getItem('sound_on')) ? 0 : 1;
		localStorage.setItem('sound_on', sound_on);
		$(this).text(sound_on ? 'Sound on': 'Sound off');
		if (background_sound) {
			background_sound.volume = sound_on / 2;
		}
	});
	container.append( sound_switch );
	
	// Init sceneClass
	sceneHandler = new SceneClass();

	// handle drop files
	$(container).bind('dragover', function(e) {
		e.stopPropagation(); e.preventDefault();
	}).bind('drop', function(e) {
		e.stopPropagation(); e.preventDefault();

		if (!window.FileReader) return;

		var files = e.originalEvent.dataTransfer.files;
		var reader = new FileReader();

		reader.onload = function(e) {
			var raw_map = e.target.result;
			if (game_alive) {
				reset_play_scene(raw_map);
			} else {
				sceneHandler.change(function () {
					play_scene(raw_map);
				});
			}
		}
		reader.readAsText(files[0]);

	});

	// Stats - FPS viewer
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 1000;
	container.append( stats.domElement );
}





function init_scene() {
	var intro = new SceneContent();
	intro.add(0.6, 'B<img src="textures/logoBomb.png" style="width:12%;"/>mb', null, {
		'line-height' : 1,
		'text-shadow' : '0 0 10px #303'
	});
	intro.add(0.9, 'Carrier', null, {
		'line-height' : 1,
		'text-shadow' : '0 0 10px #303'
	});
	intro.add(1.3, 'Play', 'select-level', {
		'margin' : '0.2em 0'
	});
	intro.add(4, 'Play online', 'online-lobby');

	intro.add(4, 'Load level', function () {
		var input = $('<input type="file"/>').css('opacity', 0).appendTo('body');
		input.change(function () {
			if (!window.FileReader) {
				alert('Your browser doesn\'t support this feature!');
				return;
			}
			if (!this.files.length) {
				return false;
			}
			var files = this.files;
			var reader = new FileReader();

			reader.onload = function(e) {
				var raw_map = e.target.result;
				if (game_alive) {
					reset_play_scene(raw_map);
				} else {
					sceneHandler.change(function () {
						play_scene(raw_map);
					});
				}
			}
			reader.readAsText(files[0]);
		});
		input.click();
	});
	intro.add(4, 'How to play', 'help1');

	var selectLevel = new SceneContent();
	selectLevel.add(1.4, 'Select level', function() {
		if ($('#levels').length) return;

		var play = function() {
			
			sceneHandler.change('play', $(this).data('play'));
		};

		var save = function( name ) {
			var $this = this;
			$.get('maps/' + name + '.txt', function(data) {
				var a = download_level(name, data);
				a.text('save');
				a.bind('dragstart', function(e) {
					e.originalEvent.dataTransfer.setData('DownloadURL', a.data('downloadurl'));
				});
				a.css({
					'display' : 'block'
				});

				a.click(function(e) {
					e.stopPropagation();
				});
				$($this).append(a);
			});	
		};
		var css = {
			'background-image' : 'url("textures/ajax-loader.gif")',
			'background-position' : 'center center',
			'background-repeat' : 'no-repeat',
			'display' : 'inline-block',
			'vertical-align' : 'top',
			'width' : '40%'
		};
		var level1 = $('<div tag="a" data-play="maps/classic.txt"><img src="textures/preview_classic.png" width="70%"/><br/>Classic</div>')
			.css(css)
			.one('click', play);
		var level2 = $('<div tag="a" data-play="maps/spiral.txt"><img src="textures/preview_spiral.png" width="70%"/><br/>Spiral</div>')
			.css(css)
			.one('click', play);
		var level3 = $('<div tag="a" data-play="maps/GrassyKnoll.txt"><img src="textures/preview_GrassyKnoll.png" width="70%"/><br/>Grassy Knoll</div>')
			.css(css)
			.one('click', play);
		
		var level4 = $('<div tag="a" data-play="maps/house.txt"><img src="textures/preview_house.png" width="70%"/><br/>House</div>')
			.css(css)
			.one('click', play);
		var levels = $('<div id="levels"/>')
			.append(level1)
			.append(level2)
			.append(level3)
			.append(level4);
		
		if (window.BlobBuilder) {
			save.call(level1, 'classic');
			save.call(level2, 'spiral');
			save.call(level3, 'GrassyKnoll');
			save.call(level4, 'house');
		} 
		
		
		$(this).after(levels);
	}, {
		'color' : '#000'
	});


	var onlineLobby = new SceneContent();
	onlineLobby.add(1.4, 'Play online - Lobby', null, {
		'color' : '#000',
		'text-shadow' : '0px 0px 7px lightgreen'
	});

	onlineLobby.add(4, 'Connect', function () {
		var $this = this;
		var id = Math.random();
		var playing = null;

		$('#online-lobby').die('click').live('click', function() {
			var user = $(this).data('user');
			if (!user) return;

			console.log('plays');
			socket.emit('play', user);
			socket.emit('leave-lobby');

			sceneHandler.change('play');
			remote = {
				'player' : 2, // player 2 is remote
				'id' : user
			}; 
			playing = user;
		});

		socket = io.connect('http://zencodez.net:8080/lobby');
		socket.on('connect', function () {
			console.log('socket-connect');
		    socket.emit('join-lobby', id);
		});

		socket.on('users', function(users) {
			var online = $('#online-lobby');
			if (online.length) {
				online.empty();
			} else {
				online = $('<div id="online-lobby">').insertAfter($this);
			}
			for(var user in users) {
				if (id == users[user]) {
					online.append($('<div>').text('(you) ' + users[user]));
				} else {
					online.append($('<div>')
						.text(users[user]))
						.data('user', users[user]);				
				}

			}
			//console.log(users);
		});

		socket.on('play', function (clientId, playingWith) {
			if (id != clientId) return;
			if (playing) return;
			playing = playingWith;
			sceneHandler.change('play');
			remote = {
				'player' : 1, // player 1 is remote
				'id' : playing
			}
			socket.emit('leave-lobby');
		});

		socket.on('key', function(clientId, keyCode, isKeyDown) {
			//console.log(clientId + '|'+ playing + '|' + id);
			if (playing == clientId || clientId != id) return;
			var a = keyCode;
			if (a in player1.keyCode) {
		    	player1.keyPressed[player1.keyCode[a]] = isKeyDown;
		    }
		    if (a in player2.keyCode) {
		    	player2.keyPressed[player2.keyCode[a]] = isKeyDown;
		    }
		});

		/* // Not finish
		socket.on('screenshot', function(clientId, dataUrl) {
			if (playing == clientId || clientId != id) return;
			var ss = $('#screenshot');
			if (ss.length) {
				ss.attr('src', dataUrl);
			} else {
				ss = $('<img id="screenshot">').css({
					'background-color' : '#aaa',
					'position' : 'absolute',
					'top' : 0,
					'right' : 0,
					'z-index' : 1003
				});
				container.append( ss );
			}			
		});
		*/
	});
	onlineLobby.add(4, 'Main menu', 'intro');

	var help1 = new SceneContent();
	help1.add(1.4, 'How to play', null, {
		'color' : '#000',
		'text-shadow' : '0px 0px 7px yellow'
	});
	help1.add(5, 'BombCarrier is a classic Arcade style game. <br/>The goal of the game is to take control of one of the bombers, and successfully eliminate your opponent. <br/>To your advantage you have the ability and craftmanship to use bombs! <br/> 	But beware... So does your enemy!<br/><br/><br/><br/>', null, {
		'text-shadow' : '0 0 5px #333'
	});
	help1.add(4, 'Main Menu', 'intro');
	help1.add(4, 'Next Page', 'help2');

	var help2 = new SceneContent();
	help2.add(1.4, 'Controls', null, {
		'color' : '#000',
		'text-shadow' : '0px 0px 7px yellow'
	});
	help2.add(3, 'Player 1'+
	'                    '+
	'Player 2', null, {
		'color' : '#000',
		'white-space': 'pre'
	});
	help2.add(5, 'Movement controls<br/><img src="textures/W.png" width="5%"/>'+ 
	'                                                                          '+
	'<img src="textures/up.png" width="5%"/><br/>'+
	'<img src="textures/A.png" width="5%"/><img src="textures/S.png" width="5%"/><img src="textures/D.png" width="5%"/>' +
	'                                                         ' +
	'<img src="textures/left.png" width="5%"/><img src="textures/down.png" width="5%"/><img src="textures/right.png" width="5%"/> <br/>'+
	'Drop bomb<br/>'+
	'<img src="textures/shift.png" width="11%"/>' +
	'                                                               '+
	'<img src="textures/spacebar.png" width="11%"/>', null, {
		'color' : '#000',
		'white-space': 'pre'
	});
	help2.add(4, 'Main Menu', 'intro');
	help2.add(4, 'Next Page','help3');

	var help3 = new SceneContent();

	help3.add(1.4, 'Power Ups',null, {
		'color' : '#000',
		'text-shadow' : '0px 0px 7px yellow'
	});

	help3.add(5, '<img src="' + _GAME_.texture.url('upgrade-power') + '" width="5%" />  Will increase your firepower and will make your bombs <br/>able to reach further when exploading. <br/> <br/>' +
	'<img src="' + _GAME_.texture.url('upgrade-bomb') + '" width="5%"/> Will increase the amount of bombs you are allowed to <br/> carry. <br/> <br/>',null, {
		'text-shadow' : '0 0 5px #333'
	});

	help3.add(4,"Main Menu",'intro');

	var gameOver = new SceneContent();
	gameOver.add(1.4, 'Game Over', null, {
		'color' : '#000'
	});
	gameOver.add(1.3, function() {
		return (player1.lifes == player2.lifes) ? 'Draw' : (player1.lifes > player2.lifes) ? 'Player 1 WINS' : 'Player 2 WINS';
	});
	gameOver.add(4, 'Main Menu', 'intro');

	sceneHandler.add('intro', intro);
	sceneHandler.add('select-level', selectLevel);
	sceneHandler.add('play', function (map) {
		map = map || 'maps/classic.txt';
		$.get(map, play_scene);
	});
	sceneHandler.add('help1', help1);
	sceneHandler.add('help2', help2);
	sceneHandler.add('help3', help3);
	sceneHandler.add('gameOver', gameOver, function() {
		game_alive = false;
		$('#score').remove();
		$('#timer').remove();
		background_sound.pause();
	});
	sceneHandler.add('online-lobby', onlineLobby);

	sceneHandler.change('intro');
}

function play_scene(raw_map) {
	game_alive = true;
	scene = new THREE.Scene();

	// Event listener
	$(document).keydown( onKeyDown );
	$(document).keyup( onKeyUp );

	background_sound = loadAudio('battle4', background_sound);

	$('body').css({
		'background-image' : 'url(' + _GAME_.texture.url('bg-paper') + ')',
		'background-position' : 'center center',
		'background-size' : '200% 200%'
	});
	fightTime = new TimeClass();
	init(raw_map);
	animate();
	score_bar();
}

function reset_play_scene(raw_map) {
	scene.remove(player1.sprite);
	scene.remove(player2.sprite);
	
	// required to update scene
	renderer.render( scene, camera );

	scene = new THREE.Scene();

	load_background();

	player1.reset();
	player2.reset();

	player1.collision = new THREE.CollisionSystem();
	player2.collision = new THREE.CollisionSystem();

	player1.setScene(scene);
	player2.setScene(scene);

	tileSystem.loadMap(raw_map);
	tileSystem.setScene(scene);

	player1.setPosition( tileSystem.getPosition(1,1).addSelf(new THREE.Vector3(0, 40, 0)) );
	player2.setPosition( tileSystem.getPosition(13,11).addSelf(new THREE.Vector3(0, 40, 0)) );

	scene.add( bombs );

	background_sound = loadAudio('battle4', background_sound);
	fightTime = new TimeClass();

}

function score_bar(){
	
	var outer_layer = $('<div id="outer">')
		.css({
			'width' : '100%',
			'position' : 'absolute',
			'top' : 0,
			'text-align' : 'center',
			'z-index' : 1001
		});

	var bar = $('<div id="score"></div>')
		.css({
			'background-image' : 'url(' + _GAME_.texture.url('bg-yellow') + ')',
			'background-size' : '100% 100%',
			'width' : '20%',
			'margin' : '0 auto',		
			'padding' : 0

		});

	var players = $('<h1>')
		.html(' <img src="textures/Player_1.png" width="30%"/> <span class="player-score" data-id="' + player1.id + '">' + (player1.lifes+1) + '</span>  <img src="textures/Player_2.png" width="30%" /> <span class="player-score" data-id="' + player2.id + '">' + (player2.lifes+1) + '</span> ')
		.css({
			'white-space' : 'pre',
			'margin' : 0,
			'padding' : 0
		});

	var bar2 = $('<div id="timer"></div>')
		.html('Time left: <span id="time-left"></span>')
		.css({
			'background-image' : 'url(' + _GAME_.texture.url('bg-yellow') + ')',
			'background-size' : '100% 100%',
			'width' : '20%',
			'margin' : '0 auto',		
			'padding' : 0

		});

	container.append( outer_layer );
	outer_layer.append(bar);
	outer_layer.append(bar2);
	bar.append( players );

	// Fix aspect ratio
	var fixAspectRatio = function() {
		if (SCREEN_WIDTH / SCREEN_HEIGHT > 1.8) {
			bar.width(SCREEN_HEIGHT * 1.8 * 0.2);
			bar2.width(SCREEN_HEIGHT * 1.8 * 0.2);
		}
	};
	fixAspectRatio();
	$(window).resize(fixAspectRatio);

	$(players).fitText(0.7);
	$(bar2).fitText(0.7);
	
}



/*
audio : Audio tag - DOM element
Return DOM element
*/
function loadAudio( name, audio )
{
    audio = audio || $('<audio>', {
    	'preload':'auto'
    }).appendTo('body')[0];

    audio.src = 'sound/' + name + sound_file_suffix;
    audio.volume = parseInt(localStorage.getItem('sound_on')) / 2;
    audio.play();

    return audio;
}

function load_background(bg) {
	bg = bg || 'bg-paper';

	// change 1010, 820
	var bg = new THREE.Mesh( new THREE.PlaneGeometry( 1010, 820 ), new THREE.MeshBasicMaterial( { 
					map: _GAME_.texture.get( bg ),
					color: 0xffffff } ) );
	bg.position.z = -250;
	bg.scale.x *= 4;
	bg.scale.y *= 2;
	scene.add( bg );
}

function init(raw_map) {

	load_background();

	/* === IMPORTANT === */
	/* The execution order should be like this! */
	
	player1 = new PlayerClass( "textures/Character Princess Girl.png" );
	player1.setScene(scene);
	player1.setScale(new THREE.Vector3(1,1.5,1));

	player1.setKeyCode({
		87 : 'up', // w
		83 : 'down', // s
		68 : 'right', // d
		65 : 'left', // a
		16 : 'bomb' // shift
	});

	player2 = new PlayerClass( "textures/Character Horn Girl.png" );
	player2.setScene(scene);
	player2.setScale(new THREE.Vector3(1,1.5,1));

	player2.setKeyCode({
		38 : 'up', // arrow up
		40 : 'down', // arrow down
		39 : 'right', // arrow right
		37 : 'left', // arrow left
		32 : 'bomb' // space
	});

	//player1.addCollision(player2.sprite);
	//player2.addCollision(player1.sprite);

	tileSystem = new TileSystem( -800, -400 );
	tileSystem.addPlayer(player1);
	tileSystem.addPlayer(player2);
	tileSystem.loadMap(raw_map);
	tileSystem.setScene(scene);

	player1.setTileSystem(tileSystem);
	player2.setTileSystem(tileSystem);

	player1.setPosition( tileSystem.getPosition(1,1).addSelf(new THREE.Vector3(0, 40, 0)) );
	player2.setPosition( tileSystem.getPosition(13,11).addSelf(new THREE.Vector3(0, 40, 0)) );

	player1.registerPlayer(player2);
	player2.registerPlayer(player1);

	/* The execution order should be like this! */
	/* === END OF IMPORTANT === */

	bombs = new THREE.Object3D();
	scene.add( bombs );

}

function animate() {
	if (!game_alive) return;

	requestAnimationFrame( animate );

	render();
	stats.update();

}

function render() {
	if (_GAME_.branch_3D) {
		player1.sprite.lookAt(camera.position);
	}

	var gameTime = 180;

	// lower sound at end game
	if (fightTime.elapse(0,gameTime-4)) {
		if (parseInt(localStorage.getItem('sound_on'))) {
			background_sound.volume = Math.min(1, Math.max(0,(gameTime-fightTime.getElapse()) / (4 / 0.5)));
		}

		var angle = (fightTime.getElapse('ms') / Math.PI * 2) % (Math.PI * 2);
		tileSystem.tiles.position.x = tileSystem.x + (tileSystem.sizeWidth-1) * tileSystem.tileSize.width / 2 + Math.cos(angle)*3;
		tileSystem.tiles.position.y = tileSystem.y + (tileSystem.sizeHeight+0.5) * tileSystem.tileSize.height / 2 + Math.sin(angle)*3;
	}

	// switch to game over scene
	fightTime.elapse(1,gameTime, function() {
		sceneHandler.change('gameOver');
	});
	$('#time-left').text(gameTime - fightTime.getElapse().toFixed());

	if (DEBUG) {
		var s = [
			//'Mouse - X:' + mouse.x.toFixed(2) + ' Y:' + mouse.y.toFixed(2),
			'Mouse - ' + JSON.stringify(mouse),
			'camera - ' + JSON.stringify(camera.position),
			'Spritechar1 - ' + JSON.stringify(player1.sprite.position),
			'Spritechar2 - ' + JSON.stringify(player2.sprite.position),
			'distance - ' + JSON.stringify(player1.sprite.position.clone().subSelf(player2.sprite.position))
		];

		var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
		projector.unprojectVector( vector, camera );

		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

		var c = player1.collision.rayCastNearest( ray );

		if ( c ) {

			s.push('Mouse collision distance - ' + c.distance.toFixed(2));
			s.push('Mouse collision item position (z+20)- ' + JSON.stringify(c.mesh.position));

		}

		debugElement.html (s.join('<br/>'));
	}	

	if ( ! oldTime ) oldTime = new Date().getTime();

	time = new Date().getTime();
	delta = 0.35 * ( time - oldTime );
	delta = Math.min( delta, tileSystem.tileSize.width, tileSystem.tileSize.height );
	oldTime = time;

	if (player1.alive) {
		player1.saveState();
		player1.move(delta);
		player1.checkCollision();
		player1.checkZIndex();
		player1.handleBomb();
	}

	if (player2.alive) {
		player2.saveState();
		player2.move(delta);
		player2.checkCollision();
		player2.checkZIndex();
		player2.handleBomb();
	}

	// Garbage Collector
	tileSystem.handleBomb();
	tileSystem.gc();
	if (!game_alive) return;
	renderer.render( scene, camera );
}

function log( text ) {
	console.warn( 'BombCarrier: ' + text );
}

function onDocumentMouseMove( event ) {

	event.preventDefault();	
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

};

function onKeyDown(a) {
    var a = a.keyCode;

    if (a in player1.keyCode) {
    	player1.keyPressed[player1.keyCode[a]] = true;
    }
    if (a in player2.keyCode) {
    	player2.keyPressed[player2.keyCode[a]] = true;
    }

    if (remote) {
    	socket.emit('key', remote.id, a, true);
    }

}
function onKeyUp(a) {
    a = a.keyCode;

    if (a in player1.keyCode) {
    	player1.keyPressed[player1.keyCode[a]] = false;
    }
    if (a in player2.keyCode) {
    	player2.keyPressed[player2.keyCode[a]] = false;
    }
	
	//window.open( renderer.domElement.toDataURL('image/png'), 'mywindow' );
    if (remote) {
    	socket.emit('key', remote.id, a, false);

    	/* // Not finish
    	var screenshot = resizeDataUrlImage(renderer.domElement.toDataURL("image/png"), 100, 100);
    	socket.emit('screenshot', remote.id, screenshot);
    	*/
    }
}

function resizeDataUrlImage(dataUrl, width, height) {
	var canvas = document.createElement('canvas');
	var img = new Image();
	img.src = dataUrl;

	canvas.width = width;
	canvas.height = height;

	var ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0, width, height);

	return canvas.toDataURL('image/png');
}

function download_level( name, text ) {
	// Currently safari doesnt support
	if (!window.BlobBuilder) return $('<a>');

    var bb = new BlobBuilder();
    bb.append( text+"" );

    var a = $('<a>').attr({
	    'download' : name + '.txt',
	    'href' : window.URL.createObjectURL(bb.getBlob('text/plain'))
	});
	a.prop('draggable', true);

	a.data('downloadurl', ['text/plain', a.attr('download'), a.attr('href')].join(':'));
	/*
	a.click(function() {
		setTimeout(function() {
		    window.URL.revokeObjectURL( a.attr('href') );
		    a.remove();
		}, 1500);
	});*/
	return a;
}
