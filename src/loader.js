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
	,'src/timeClass.js'
	,'src/bombClass.js'
	,'src/tileSystem.js'

	// Music
	//,'preload!sound/battle4.mid'
];

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
			init_core();
			intro_scene();
		});
	}
});