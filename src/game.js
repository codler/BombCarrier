

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

var tileW = 116;
var tileH = 59;


var delta, time, oldTime;

var tileSystem;


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
		container.append( debugElement );

	}

	// Stats - FPS viewer
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 1000;
	container.append( stats.domElement );
}

function intro_scene() {
		var intro_scene = $('<div>').css({
			'background-image' : 'url(textures/diaglog-box.png)',
			'background-size' : '100% 100%',
			'font-family' : "'Holtwood One SC', serif",
			'position' : 'absolute',
			'top' : 0,
			'left' : 0,
			'z-index' : 101,
			'text-align' : 'center',
			'width' : '100%',
			'height' : '100%'
		});

		var bomb_title = $('<h1>')
			.html('B<img src="textures/logoBomb.png" style="width:12%;"/>mb')
			.css({
				'color' : '#fff',
				'line-height' : 1,
				'padding' : 0,
				'margin' : 0,
				'width' : '100%'
			});

		var carrier_title = $('<h1>')
			.text('Carrier')
			.css({
				'padding' : 0,
				'line-height' : 1,
				'margin' : 0,
				'width' : '100%'
			});

		var meny = $('<h1>')
			.html('Play')
			.css({
				'cursor' : 'pointer',
				'width' : '100%'
			});
			
		// Start game
		$(meny).click(function() {
				play_scene();
				intro_scene.remove();
			});

		$(meny).mouseover(function() {
			$(this).css({
				'color' : '#FFF'
			});
		});

		$(meny).mouseout(function() {
			$(this).css({
				'color' : '#000'
			});
		});

		var intro_scene_inner = $('<div>').css({
			'margin' : '0 auto'
		});

		intro_scene_inner.append( bomb_title );
		intro_scene_inner.append( carrier_title );
		intro_scene_inner.append( meny );

		intro_scene.append( intro_scene_inner );

		container.append( intro_scene );

		// Fix aspect ratio
		if (intro_scene.width() / intro_scene.height() > 1.8) {
			intro_scene_inner.width(intro_scene.height() * 1.8);
		}

		$(bomb_title).fitText( 0.6 );
		$(carrier_title).fitText( 0.9 );
		$(meny).fitText( 1.3 );
}

function play_scene() {

	// Event listener
	$(document).keydown( onKeyDown );
	$(document).keyup( onKeyUp );

	loadAudio('sound/battle4.ogg');
	init();
	animate();
}

function loadAudio(uri)
{
    var audio = new Audio();

    var audio = $('<audio>').attr({
    	'preload':'auto'
    	,'src': uri
    })[0];
    $('body').append(audio);
    audio.src = uri;
    audio.play();
    return audio;
}

function init() {
	var amount = 15*13;
	var mapA   = THREE.ImageUtils.loadTexture( "textures/Dirt Block.png" );
	var mapB   = THREE.ImageUtils.loadTexture( "textures/Stone Block Tall.png" );
	var mapC   = THREE.ImageUtils.loadTexture( "textures/Water Block.png" );
	var char1  = THREE.ImageUtils.loadTexture( "textures/Character Princess Girl.png" );




	player1 = new PlayerClass( "textures/Character Princess Girl.png", new THREE.Vector3(
		0 * tileW - 200 + 0,
		0 * tileH - 200 + 280,
		15 + 2
	) );
	player1.setScene(scene);
	player1.setScale(new THREE.Vector3(1,1.5,1));

	player1.setKeyCode({
		87 : 'up', // w
		83 : 'down', // s
		68 : 'right', // d
		65 : 'left', // a
		16 : 'bomb' // shift
	});

	player2 = new PlayerClass( "textures/Character Horn Girl.png", new THREE.Vector3(
		0 * tileW - 100 + 90,
		0 * tileH - 200 + 160,
		15 + 2
	) );
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

/*
	group = new THREE.Object3D();

	var level1 = [
		[mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC],
		
		[mapC, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapC],
		[mapC, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapC],
		
		[mapC, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapC],
		[mapC, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapC],
		
		[mapC, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapC],
		[mapC, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapC],
		
		[mapC, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapC],
		[mapC, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapC],

		[mapC, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapC],
		[mapC, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapB, mapA, mapC],

		[mapC, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapA, mapC],

		[mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC, mapC]
	];
	var level = level1;

	for( var a = 0; a < amount; a++ ) {

		var z = 15 - Math.floor(a/15) * 2;

		var map = level[Math.floor(a/15)][a%15];
		var sprite = new THREE.Sprite( { map: map, useScreenCoordinates: false } );

		if (sprite.map == mapB || sprite.map == mapC) {
			z++;
			// Collision area
			sprite.boundingMesh = new THREE.Mesh(
				new THREE.CubeGeometry(120, 60, 100, 1, 1, 1) 
				//,new THREE.MeshLambertMaterial( { color: 0xffccff } )
			);

			sprite.boundingMesh.position.set( a%15 * tileW - 800,
		                     Math.floor(a/15) * tileH - 400 + 10,
		                     z - 20);

			group.addChild( sprite.boundingMesh );
			player1.addCollision(sprite);
			player2.addCollision(sprite);
		}

		sprite.position.set( a%15 * tileW - 800,
		                     Math.floor(a/15) * tileH - 400,
		                     z);

		//sprite.position.normalize();
		//sprite.position.multiplyScalar( radius );
		
		
		group.addChild( sprite );
	}

	scene.addChild( group );*/



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
	oldTime = time;

	player1.saveState();
	player1.move(delta);
	player1.checkCollision();
	player1.checkZIndex();
	player1.handleBomb();

	player2.saveState();
	player2.move(delta);
	player2.checkCollision();
	player2.checkZIndex();
	player2.handleBomb();

	// Garbage Collector
	tileSystem.handleBomb();
	tileSystem.gc();

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