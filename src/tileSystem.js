// x,y offset
// -800,-400
var TileSystem = function(x, y) {
	this.x       = x;
	this.y       = y;
	this.tiles   = new THREE.Object3D();
	this.grid   = new THREE.Object3D();
	this.players = [];
	this.bombs   = [];
};

TileSystem.prototype.tileSize = {
	'width'  : 116,
	'height' : 59
};

TileSystem.prototype.tileInfo = {
	0 : {
		'name'       : 'map-a',
		'destroyable' : true
	},
	1 : {
		'name'       : 'map-b',
		'destroyable' : false
	},
	2 : {
		'name'       : 'map-c',
		'destroyable' : false
	},
	3 : {
		'name'       : 'blue-block',
		'destroyable' : true
	},
	4 : {
		'name'       : 'green-block',
		'destroyable' : true
	},
	5 : {
		'name'       : 'yellow-block',
		'destroyable' : true
	},
	6 : {
		'name'		 : 'bomb',
		'destroyable': true
	},
	7 : {
		'name'		 : 'upgrade-life',
		'destroyable': true
	},
	8 : {
		'name'		 : 'upgrade-power',
		'destroyable': true
	},
	9 : {
		'name'		 : 'upgrade-bomb',
		'destroyable': true
	}
};

/*
l : string
*/
TileSystem.prototype.loadMap = function(l) {

	var times = function (s, i) {
		return (new Array(i+1)).join(s);
	};
	var repeat = function(s, i){
		var t = [];
		while(i--) t.push(s);
		return t;
	};

	this.tiles = new THREE.Object3D();

	l = l.replace(/[\n\r\t]/g,'').split(',').reverse().map(function(x) { return x.split(' ')});

	var level = l;

	this.level      = level;
	this.sizeWidth  = this.level[0].length;
	this.sizeHeight = this.level.length;

	// Remapping
	for (var x = 0; x < this.sizeWidth; x++) {
		for (var y = 0; y < this.sizeHeight; y++) {
			this.level[y][x] = {
				type : this.level[y][x]
			};
		}
	}

	// grid
	/*
	var g = new THREE.Geometry();
	g.vertices.push( new THREE.Vertex( new THREE.Vector3( -1000, 0, 0 ) ) );
	g.vertices.push( new THREE.Vertex( new THREE.Vector3( 1000, 0, 0 ) ) );

	for ( var i = 0; i <= this.sizeWidth; i ++ ) {
		if (i <= this.sizeHeight) {
			var line = new THREE.Line( g, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			//line.position.x = this.x;
			line.position.y = ( i * this.tileSize.height ) + this.y;
			this.grid.add( line );
			
		}

		var line = new THREE.Line( g, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
		line.position.x = ( i * this.tileSize.width ) + this.x;
		line.position.y = this.y;
		line.rotation.z = 90 * Math.PI / 180;
		this.grid.add( line );

	}*/



	var geometry = new THREE.CubeGeometry(120, 60, 100, 1, 1, 1);

	for (var x = 0; x < this.sizeWidth; x++) {
		for (var y = 0; y < this.sizeHeight; y++) {
			// Times 2 means one TileSizeY equals 2z
			var z = this.sizeWidth - y * 2;
			var tileType = this.level[y][x].type;
			var tileTexture = this.tileInfo[ tileType ].name;

			var sprite = new THREE.Sprite( { 
				map: _GAME_.texture.get( tileTexture ), 
				useScreenCoordinates: false 
			} );

			

			// Collision on tileType 1,2
			if (tileType != 0)  {
				
				z++; // IMPORTANT, do not move or remove!
				
				// Collision area
				sprite.boundingMesh = new THREE.Mesh(
					geometry
					//,new THREE.MeshLambertMaterial( { color: 0xffccff } )
				);

				sprite.boundingMesh.position.set(
					x * this.tileSize.width + this.x,
					y * this.tileSize.height + this.y + 10,
					z
				);
				
				sprite.boundingMesh.gameType = 'tile';

				// Register collision to players
				for (var p = 0; p < this.players.length; p++) {
					this.players[p].addCollision(sprite);
				}

				this.tiles.add( sprite.boundingMesh );

			}

			sprite.position.set(
				x * this.tileSize.width + this.x,
				y * this.tileSize.height + this.y,
				z
			);

			this.level[y][x].sprite = sprite;

			this.tiles.add( sprite );
		}
	}

};

TileSystem.prototype.changeTile = function( tileX, tileY, tileType, force) {
	force = force || false;
	var t = this.tileInfo[ tileType ].name;
	console.log(this.tileInfo[ this.level[tileY][tileX].type ].name);

	// Need refactor


	if (force || (tileType == 0 && this.tileInfo[ this.level[tileY][tileX].type ].destroyable)) {
		// TODO : Replace this. This is a temporary fix to "remove" object.
		this.level[tileY][tileX].sprite.boundingMesh.position.z -= 10000;
		this.level[tileY][tileX].sprite.map = _GAME_.texture.get( t );
		this.level[tileY][tileX].sprite.map.needsUpdate = true;
		this.level[tileY][tileX].type = 0;
		return true;
	}

	
	if (force || (tileType == 7 && this.tileInfo[ this.level[tileY][tileX].type ].destroyable)) {
		this.level[tileY][tileX].sprite.map = _GAME_.texture.get( t );
		this.level[tileY][tileX].sprite.map.needsUpdate = true;
		this.level[tileY][tileX].type = 7;
		return true;
	}
	if (force || (tileType == 8 && this.tileInfo[ this.level[tileY][tileX].type ].destroyable)) {
		this.level[tileY][tileX].sprite.map = _GAME_.texture.get( t );
		this.level[tileY][tileX].sprite.map.needsUpdate = true;
		this.level[tileY][tileX].type = 8;
		return true;
	}
	if (force || (tileType == 9 && this.tileInfo[ this.level[tileY][tileX].type ].destroyable)) {
		this.level[tileY][tileX].sprite.map = _GAME_.texture.get( t );
		this.level[tileY][tileX].sprite.map.needsUpdate = true;
		this.level[tileY][tileX].type = 9;
		return true;
	}
	return false;
};

/*
player : PlayerClass
*/
TileSystem.prototype.addPlayer = function(player) {
	this.players.push(player);
};

TileSystem.prototype.setScene = function(scene) {
	this.scene = scene;
	this.scene.add(this.tiles);
	this.scene.add(this.grid);
};

TileSystem.prototype.getPosition = function(tileX, tileY, z) {
	return new THREE.Vector3(
		tileX * this.tileSize.width + this.x, 
		tileY * this.tileSize.height + this.y, 
		z || 0
	);
};

TileSystem.prototype.getTilePosition = function(x, y) {
	return {
		x: Math.floor( (x - this.x) / this.tileSize.width ),
		y: Math.floor( (y - this.y) / this.tileSize.height )
	};
};

TileSystem.prototype.addBomb = function(bomb) {
	this.bombs = bomb;
};

TileSystem.prototype.handleBomb = function() {
	var $this = this;
	this.bombs.forEach(function (bomb) {
		bomb.update();
		
		// Remove bomb from scene
		if ( bomb.expired() ) {
			$this.scene.remove( bomb.animate );	
			
		}
	});
};

TileSystem.prototype.gc = function() {
	// Remove expired bombs from array
	this.bombs = this.bombs.filter(function (bomb) {
		return !bomb.expired();
	});
	//index = array.indexOf(item);
	//array.splice(index, 1);
};
