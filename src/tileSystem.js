// x,y offset
// -800,-400
var TileSystem = function(x, y) {
	this.x       = x;
	this.y       = y;
	this.tiles   = new THREE.Object3D();
	this.grid   = new THREE.Object3D();
	this.players = [];
	this.bombs   = [];
	this.rawLevel = '';
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
	},
	10 : {
		'name'		 : 'grass',
		'destroyable': false
	},
	11 : {
		'name'		 : 'tree-big',
		'destroyable': false
	},
	12 : {
		'name'		 : 'tree-small',
		'destroyable': false
	},
	13 : {
		'name' 		 : 'blue-grass',
		'destroyable': true
	},
	14 : {
		'name'		 : 'green-grass',
		'destroyable': true
	},
	15 : {
		'name'		 : 'orange-grass',
		'destroyable': true
	},
	16 : {
		'name'		 : 'blue-wood',
		'destroyable': true
	},
	17 :{
		'name'		 : 'green-wood',
		'destroyable': true
	},
	18 :{
		'name'		 : 'orange-wood',
		'destroyable': true
	},
	19 :{
		'name' 		 : 'wood',
		'destroyable': false
	},
	20 : {
		'name'		 : 'wall',
		'destroyable': false
	},
	21 :{
		'name' 		 : 'window',
		'destroyable': false
	},
	22 :{
		'name'		 : 'door',
		'destroyable': false
	}
};

/*
l : string
*/
TileSystem.prototype.loadMap = function(l) {
	this.rawLevel = l;
	
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

	if (_GAME_.branch_3D) {
		var materials = [];
		materials.push( [ new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'test/front.png' ) } ) ] );
		materials.push( [ new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'test/front.png' ) } ) ] );
		materials.push( [ new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ) ] );
		materials.push( [ new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'test/front.png' ) } ) ] );
		materials.push( [ new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'test/top.png' ) } ) ] );
		materials.push( [ new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'test/top.png' ) } ) ] );

		var materials2 = [];
		materials2.push( [ new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'test/front2.png' ) } ) ] );
		materials2.push( [ new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'test/front2.png' ) } ) ] );
		materials2.push( [ new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ) ] );
		materials2.push( [ new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'test/front2.png' ) } ) ] );
		materials2.push( [ new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'test/top2.png' ) } ) ] );
		materials2.push( [ new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'test/top2.png' ) } ) ] );

		var canvas = document.createElement("canvas"); 
		canvas.width = loaded_images['a'].width; 
		canvas.height = loaded_images['a'].height;
	 	var ctx = canvas.getContext("2d");

	 	//ctx.fillStyle = 'rgb( 200, 200, 200 )';
		//ctx.fillRect( 0, 0, canvas.width, canvas.height );

	 	ctx.drawImage(loaded_images['a'], 0, 0);
	 	//ctx.drawImage(loaded_images['b'], 0, -10);
	 	
	 	ctx.drawImage(loaded_images['Gem Green.png'], 0, -10, loaded_images['Gem Green.png'].width, loaded_images['Gem Green.png'].height - 40);

	 	var t = new THREE.Texture( canvas );
	 	var m = new THREE.MeshBasicMaterial( { map: t, transparent: true } );
	 	t.needsUpdate = true;

		var materials3 = [];
		materials3.push( [ new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'test/front.png' ) } ) ] );
		materials3.push( [ new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'test/front.png' ) } ) ] );
		materials3.push( [ new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ) ] );
		materials3.push( [ new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'test/front.png' ) } ) ] );
		materials3.push( [ m ] );
		materials3.push( [ m ] );	
	}

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
			if (tileType != 0 || tileType != 10 || tileType != 19)  {
				
				z++; // IMPORTANT, do not move or remove!
			
			}
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

			if (tileType == 0 || tileType == 10 || tileType == 19)  {
				sprite.boundingMesh.position.z -= 10000;
			}

			sprite.position.set(
				x * this.tileSize.width + this.x,
				y * this.tileSize.height + this.y,
				z
			);

			this.level[y][x].sprite = sprite;

			if (!_GAME_.branch_3D) {
				this.tiles.add( sprite );
			} else {
				if (tileType == 0) {
					var cube = new THREE.Mesh( new THREE.CubeGeometry( this.tileSize.width, this.tileSize.height, 39, 1, 1, 1, materials ), new THREE.MeshFaceMaterial() );
					cube.position.set(
						x * this.tileSize.width + this.x,
						y * this.tileSize.height + this.y,
						-39 - 8
					);
					this.tiles.add( cube );
					
				} else if(tileType == 1) {
					var cube = new THREE.Mesh( new THREE.CubeGeometry( this.tileSize.width, this.tileSize.height, 78, 1, 1, 1, materials2 ), new THREE.MeshFaceMaterial() );
					cube.position.set(
						x * this.tileSize.width + this.x,
						y * this.tileSize.height + this.y,
						-39 - 8 + 39 / 2
					);
					this.tiles.add( cube );
					
				} else if(tileType == 4) {
					var geo = new THREE.CubeGeometry( this.tileSize.width, this.tileSize.height, 39, 1, 1, 1, materials3 );
					var cube = new THREE.Mesh( geo , new THREE.MeshFaceMaterial() );
					cube.position.set(
						x * this.tileSize.width + this.x,
						y * this.tileSize.height + this.y,
						-39 - 8
					);
					this.tiles.add( cube );
					
				}
			}
		}
	}

};

TileSystem.prototype.changeTile = function( tileX, tileY, tileType, force) {
	force = force || false;
	var t = this.tileInfo[ tileType ].name;
	//console.log(this.tileInfo[ this.level[tileY][tileX].type ].name);

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
			// TODO remove properly
			bomb.sprite.boundingMesh.position.z -= 10000;
			$this.scene.remove( bomb.animate );	
			
		}

		// bomb position
		var bTilePos = $this.getTilePosition(bomb.sprite.position.x, bomb.sprite.position.y);

		var steppable = false;
		for(var player in $this.players) {
			// player position
			var pos = $this.players[player].sprite.position.clone().addSelf( new THREE.Vector3(0, -20, -0.25) );
			var pTilePos = $this.getTilePosition(pos.x + $this.tileSize.width / 2, pos.y + 10);

			if (bTilePos.x == pTilePos.x && bTilePos.y == pTilePos.y) {
				console.log(bomb.steppable);
				steppable = true;
				break;
			}
		}

		if (!bomb.exploded()) {
			bomb.steppable = steppable;
		}
		
	});
};

TileSystem.prototype.gc = function() {
	// Remove expired bombs from array
	this.bombs = this.bombs.filter(function (bomb) {
		return !bomb.expired();
	});
};
