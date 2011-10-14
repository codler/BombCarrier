

// == Begin Constants ==
var SCREEN_WIDTH  = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

// == End Constants ==
var container, stats;

var camera, scene, renderer;
var projector;
var loader;

var group;
var bombs;
var time = 0;

var mouse = { x: 0, y: 0 };

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var player1, player2;

var debugElement;


var fightTime;

var delta, time, oldTime;

var tileSystem;

var background_sound;

var texture = {
	'map-a'        : 'textures/Dirt Block.png',
	'map-b'        : 'textures/Stone Block Tall.png',
	'map-c'        : 'textures/Water Block.png',
	'blue-block'   : 'textures/Gem Blue.png',
	'green-block'  : 'textures/Gem Green.png',
	'yellow-block' : 'textures/Gem Orange.png',
	'char-1'       : 'textures/Character Princess Girl.png',
	'bomb'         : 'textures/bomb.png',
	'explosion'    : 'textures/Explosion.png',
	'explosion2'   : 'textures/explosion2.png',
	'explosion3'   : 'textures/explosion3.png'
};

var game_alive = false;

var sceneHandler;


// Initialize core - canvas, camera, scene, debuginfo
function init_core() {

	container = $('<div>');
	$('body').append( container );

	projector = new THREE.Projector();

	camera = new THREE.Camera( 
		60, 							// FOV, field of view
		SCREEN_WIDTH / SCREEN_HEIGHT, 	// Aspect ratio
		1, 								// Near
		10000 							// Far
	);
	camera.position.z = 1000;

	loader = new THREE.Loader( true );

	scene = new THREE.Scene();

	// renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColorHex( 0x000000, 1 );
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
		//	container.append( debugElement );

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
		'line-height' : 1
	});
	intro.add(0.9, 'Carrier', null, {
		'color' : '#000',
		'line-height' : 1
	});
	intro.add(1.3, 'Play', 'play', {
		'margin' : '0.67em 0'
	});
	intro.add(4, 'How to play', 'help1');

	var help1 = new SceneContent();
	help1.add(1.4, 'How to play', null, {
		'color' : '#000'
	});
	help1.add(5, 'BombCarrier is a classic Arcade style game. <br/>The goal of the game is to take control of one of the bombers, and successfully eliminate your opponent. <br/>To your advantage you have the ability and craftmanship to use bombs! <br/> 	But beware... So does your enemy!<br/><br/><br/><br/>');
	help1.add(4, 'Main Menu', 'intro');
	help1.add(4, 'Next Page', 'help2');

	var help2 = new SceneContent();
	help2.add(1.4, 'Controls', null, {
		'color' : '#000'
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

	var gameOver = new SceneContent();
	gameOver.add(1.4, 'Game Over', null, {
		'color' : '#000'
	});
	gameOver.add(1.3, function() {
		return (player1.lifes == player2.lifes) ? 'Draw' : (player1.lifes > player2.lifes) ? 'Player 1 WINS' : 'Player 2 WINS';
	});
	gameOver.add(4, 'Main Menu', 'intro');

	sceneHandler.add('intro', intro);
	sceneHandler.add('play', play_scene);
	sceneHandler.add('help1', help1);
	sceneHandler.add('help2', help2);
	sceneHandler.add('gameOver', gameOver, function() {
		game_alive = false;
		$('#score').remove();
		$('#timer').remove();
		background_sound.pause();
		console.log('ss');
	});

	sceneHandler.change('intro');
}

function play_scene() {
	game_alive = true;
	scene = new THREE.Scene();

	// Event listener
	$(document).keydown( onKeyDown );
	$(document).keyup( onKeyUp );

	background_sound = loadAudio('sound/battle4.ogg');

	$('body').css({
		'background-image' : 'url(textures/paper-dialog.png)',
		'background-size' : '50% 50%'
	});
	fightTime = new TimeClass();
	init();
	animate();
	score_bar();
	

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
			'background-image' : 'url(textures/button-off.png)',
			'background-size' : '100% 100%',
			'width' : '20%',
			'margin' : '0 auto',		
			'padding' : 0

		});


	var players = $('<h1>')
		.html(' <img src="textures/Player_1.png" width="30%"/> <span class="player-score" data-id="' + player1.id + '">0</span>  <img src="textures/Player_2.png" width="30%" /> <span class="player-score" data-id="' + player2.id + '">0</span> ')
		.css({
			'white-space' : 'pre',
			'margin' : 0,
			'padding' : 0
		});

	var bar2 = $('<div id="timer"></div>')
		.html('Time left: <span id="time-left"></span>')
		.css({
			'background-image' : 'url(textures/button-off.png)',
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
function loadAudio(uri, audio)
{
    //audio = audio || new Audio();

    audio = audio || $('<audio>', {
    	'preload':'auto'
    }).appendTo('body')[0];

    audio.src = uri;
    audio.volume = parseInt(localStorage.getItem('sound_on')) / 2;
    audio.play();

    return audio;
}

function init() {
	var amount = 15*13;
	var mapA   = THREE.ImageUtils.loadTexture( "textures/Dirt Block.png" );
	var mapB   = THREE.ImageUtils.loadTexture( "textures/Stone Block Tall.png" );
	var mapC   = THREE.ImageUtils.loadTexture( "textures/Water Block.png" );
	var char1  = THREE.ImageUtils.loadTexture( "textures/Character Princess Girl.png" );

	var bg = new THREE.Sprite({ 
		map: THREE.ImageUtils.loadTexture( "textures/paper-dialog.png" ),
		useScreenCoordinates: false 
	});
	bg.position.z = -250;
	bg.scale.x *= 4;
	bg.scale.y *= 2;
	scene.add( bg );

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
	tileSystem.loadMap();
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



	// Inline text
	/*var text3d = new THREE.TextGeometry( 'testar text', {

					size: 80,
					height: 20,
					curveSegments: 2,
					font: "helvetiker"

				});

				text3d.computeBoundingBox();
				var centerOffset = -0.5 * ( text3d.boundingBox.x[ 1 ] - text3d.boundingBox.x[ 0 ] );

                var textMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false } );
                text = new THREE.Mesh( text3d, textMaterial );

                text.doubleSided = false;

                text.position.set( 0, 100, 0 );

				text.overdraw = true;

				parent = new THREE.Object3D();
                parent.addChild( text );

				scene.addObject( parent );*/


	//THREE.Collisions.colliders.push(spriteChar2);

	// add 2d-sprites
	/*
	sprite = new THREE.Sprite( { map: mapA, alignment:THREE.SpriteAlignment.topLeft } );
	sprite.position.set( 100, 100, 0 );
	sprite.opacity = 0.25;
	scene.addChild( sprite );

	sprite = new THREE.Sprite( { map: mapA, alignment:THREE.SpriteAlignment.topLeft } );
	sprite.position.set( 150, 150, 2 );
	sprite.opacity = 0.5;
	scene.addChild( sprite );

	sprite = new THREE.Sprite( { map: mapA, alignment:THREE.SpriteAlignment.topLeft } );
	sprite.position.set( 200, 200, 3 );
	sprite.opacity = 1;
	scene.addChild( sprite );
	*/

	

}



function animate() {
	if (!game_alive) return;

	requestAnimationFrame( animate );

	render();
	stats.update();

}


function render() {

	/*
	for ( var c = 0; c < group.children.length; c++ ) {

		var sprite = group.children[ c ];
		var scale = Math.sin( time + sprite.position.x * 0.01 ) * 0.3 + 1.0;

		sprite.rotation += 0.1 * ( c / group.children.length );
		sprite.scale.set( scale, scale, 1.0 );
		sprite.opacity = Math.sin( time + sprite.position.x * 0.01 ) * 0.4 + 0.6;
	}

	group.rotation.x = time * 0.5;
	group.rotation.y = time * 0.75;
	group.rotation.z = time * 1.0;

	time += 0.02;
	*/

	// lower sound at end game
	if (fightTime.elapse(0,180-4)) {
		if (parseInt(localStorage.getItem('sound_on'))) {
			background_sound.volume = Math.min(1, Math.max(0,(180-fightTime.getElapse()) / (4 / 0.5)));
		}
	}

	// switch to game over scene
	fightTime.elapse(1,180, function() { 
		console.log('Time over');

		sceneHandler.change('gameOver');
	});
	$('#time-left').text(180 - fightTime.getElapse().toFixed());

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

	//player1.sprite.boundingMesh.materials[0].color = new THREE.Color(0xffffff);
	//player2.sprite.boundingMesh.materials[0].color = new THREE.Color(0xffffff);

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

	var e = document.getElementById("log");
	e.innerHTML = text + "<br/>" + e.innerHTML;

}

function onDocumentMouseMove( event ) {

	event.preventDefault();	
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

};

function onKeyDown(a) {
    var a = a.keyCode;
    /*
    if (a in keyMap) {
    	keyPressed[keyMap[a]] = true;
    }*/

    if (a in player1.keyCode) {
    	player1.keyPressed[player1.keyCode[a]] = true;

    }
    if (a in player2.keyCode) {
    	player2.keyPressed[player2.keyCode[a]] = true;


    }

}
function onKeyUp(a) {
    a = a.keyCode;
    /*
    if (a in keyMap) {
    	keyPressed[keyMap[a]] = false;
    }*/

    if (a in player1.keyCode) {
    	player1.keyPressed[player1.keyCode[a]] = false;
    }
    if (a in player2.keyCode) {
    	player2.keyPressed[player2.keyCode[a]] = false;
    }
}