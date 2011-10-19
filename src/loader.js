var loaded = 0,
	load = [
		// Load libraries
		 'libs/Three.js'
		,'libs/RequestAnimationFrame.js'
		,'libs/Stats.js'

		,'libs/jquery-1.6.4.min.js'
		,'libs/jquery.fittext.js'

		// Load fonts
		,'fonts/helvetiker_regular.typeface.js'

		// Load game
		,'src/game.js'
		,'src/playerClass.js'
		,'src/timeClass.js'
		,'src/bombClass.js'
		,'src/sceneClass.js'
		,'src/tileSystem.js'
		,'src/textureClass.js'

		,'http://zencodez.net:8080/socket.io/socket.io.js'
	],
	preload_images = [
		// Hotkeys
		 'A.png'
		,'D.png'
		,'down.png'
		,'left.png'
		,'right.png'
		,'S.png'
		,'shift.png'
		,'up.png'
		,'W.png'

		// Backgrounds
		,'diaglog-box.png'
		,'paper-dialog.png'

		// Effects
		,'Explosion.png'
		,'explosion2.png'
		,'explosion3.png'

		// Tiles
		,'Dirt Block.png'
		,'Gem Blue.png'
		,'Gem Green.png'
		,'Gem Orange.png'
		,'Heart.png'
		,'Rock.png'
		,'Star.png'
		,'Stone Block Tall.png'
		,'Water Block.png'
		
		// Characters
		,'Character Horn Girl.png'
		,'Character Princess Girl.png'
		,'Player_1.png'
		,'Player_2.png'

		// Misc
		,'bomb.png'
		,'logoBomb.png'

		,'button-off.png'
	],
	preload_sounds = [
		'battle4.ogg'
	];

var loaded_images = {};
// Preload images
for(var image in preload_images) {
	loaded_images[preload_images[image]] = document.createElement('img');
	loaded_images[preload_images[image]].src = 'textures/' + preload_images[image] + (( DEBUG ) ? rId : '');
}

// Preload sounds
for(var sound in preload_sounds) {
	var audio = document.createElement('audio');
	audio.src = 'sound/' + preload_sounds[sound];
	audio.preload = 'auto';
}

// Load all js files
yepnope({
	load : load,
	callback : function() {
		var loading = document.getElementById('loading'),
			percent = (loaded++ / load.length * 100).toFixed();
		
		loading.innerHTML = percent + ' %';
		loading.style.backgroundImage = '-webkit-linear-gradient(left, #FFF '+percent+'%, #000 '+percent+'%)';
	},
	complete : function() {

		jQuery(function ($) {
			$('#first').remove();
			init_game();
			init_core();
			init_scene();
		});
	}
});