/*
Player class

map : texture
position : Vector3
*/
var PlayerClass = function( texture, position ) {
	this.history = []; // Players previous positions
	this.bombs   = [];
	this.players = [];
	this.width   = 80;
	this.height  = 100;
	this.alive   = true;
	this.lifes   = 3;

	this.sprite = new THREE.Sprite( { 
		map: texture || this.defaultTexture,
		useScreenCoordinates: false 
	} );


	// Collision area
	this.sprite.boundingMesh = new THREE.Mesh(
		new THREE.CubeGeometry(40, 40, 100, 1, 1, 1) 
		//,new THREE.MeshLambertMaterial( { color: 0xffffff } )
	);
	this.sprite.boundingMesh.gameType = 'player';

	this.setPosition(position || new THREE.Vector3(0,0,0));
	this.setKeyPressed({
		up    :false,
		right :false,
		down  :false,
		left  :false,
		bomb  :false
	});

	this.collision = new THREE.CollisionSystem();
	
	this.sprite.boundingMesh.playerClass = this;
};
//PlayerClass.prototype.constructor = PlayerClass;

// Variable
PlayerClass.prototype.defaultTexture = THREE.ImageUtils.loadTexture( "textures/Character Princess Girl.png" );

/*
texture : texture
*/
PlayerClass.prototype.setTexture = function(texture) {
	this.sprite.map = texture;
};

/*
position : Vector3
*/
PlayerClass.prototype.setPosition = function(position) {
	this.setPositionX(position.x);
	this.setPositionY(position.y);
	this.setPositionZ(position.z);
};
/*
x : float
*/
PlayerClass.prototype.setPositionX = function(x) {
	this.sprite.position.x = x;
	this.sprite.boundingMesh.position.x = x;
};
/*
y : float
*/
PlayerClass.prototype.setPositionY = function(y) {
	this.sprite.position.y = y;
	this.sprite.boundingMesh.position.y = y - 40;
};
/*
z : float
*/
PlayerClass.prototype.setPositionZ = function(z) {
	this.sprite.position.z = z;
	this.sprite.boundingMesh.position.z = z;
};

/*
scale : Vector3
*/
PlayerClass.prototype.setScale = function(scale) {
	this.sprite.scale = scale;
};

/*
scene : Vector3
*/
PlayerClass.prototype.setScene = function(scene) {
	this.scene = scene;
	this.scene.add(this.sprite);
	this.scene.add(this.sprite.boundingMesh);
};

/*
collision : Object3d | Mesh
*/
PlayerClass.prototype.addCollision = function(collision) {
	this.collision.colliders.push( THREE.CollisionUtils.MeshOBB( collision.boundingMesh || collision ) );
};

/*
Store position
*/
PlayerClass.prototype.saveState = function() {
	this.history.push(this.sprite.position.clone());
	if (this.history.length > 5) {
		this.history.shift();
	}
};

/*
keys : { up, right, down, left }
*/
PlayerClass.prototype.setKeyPressed = function(keys) {
	this.keyPressed = keys;
};
/*
keys : { up, right, down, left }
*/
PlayerClass.prototype.setKeyCode = function(keys) {
	this.keyCode = keys;
};
/*
tileSystem : TileSystem
*/
PlayerClass.prototype.setTileSystem = function(tileSystem) {
	this.tileSystem = tileSystem;
};
PlayerClass.prototype.move = function(speed) {


	if (this.keyPressed.up) {
		this.setPositionY(this.sprite.position.y + speed * 0.8);
	}
	if (this.keyPressed.down) {
		this.setPositionY(this.sprite.position.y - speed * 0.8);
	}
	if (this.keyPressed.right) {
		this.setPositionX(this.sprite.position.x + speed);
	}
	if (this.keyPressed.left) {
		this.setPositionX(this.sprite.position.x - speed);
	}
};

PlayerClass.prototype.checkZIndex = function() {
	var z = -2 - (this.sprite.position.y - 200 - 10 )/ tileH * 2;

	z = z - (z - Math.floor(z)) / 2 + (z - Math.floor(z)) / 4;

	this.setPositionZ(z);
	return z;
};

PlayerClass.prototype.registerPlayer = function(player) {
	this.players.push(player);
};

PlayerClass.prototype.checkCollision = function() {
	var pop = false;
	var $this = this;
	var callback = function(side) {
		if (!pop) pop = $this.history.pop();
		if (side == 'l' || side == 'r') {
			$this.setPositionX(pop.x);
		} else if (side == 'n' || side == 's') {
			$this.setPositionY(pop.y);
		} else {
			$this.setPosition(pop);
		}
	};
	if (this.keyPressed.up) {
		this.checkCollisionItem(this.sprite.boundingMesh, callback, 'n');
	}
	if (this.keyPressed.down) {
		this.checkCollisionItem(this.sprite.boundingMesh, callback, 's');
	}
	if (this.keyPressed.right) {
		this.checkCollisionItem(this.sprite.boundingMesh, callback, 'r');
	}
	if (this.keyPressed.left) {
		this.checkCollisionItem(this.sprite.boundingMesh, callback, 'l');
	}
};

PlayerClass.prototype.checkCollisionItem = function(item, callback, side) {
	var direction;
	var position = item.position.clone();
	if (side == 'l') {
		direction = new THREE.Vector3(0,-1,0);
		position.addSelf(new THREE.Vector3(-20, 20 - 2, 0));
	} else if (side == 'r') {
		direction = new THREE.Vector3(0,-1,0);
		position.addSelf(new THREE.Vector3(20, 20 - 2, 0));
	} else if (side == 'n') {
		direction = new THREE.Vector3(1,0,0);
		position.addSelf(new THREE.Vector3(-20 + 2, 20, 0));
	} else if (side == 's') {
		direction = new THREE.Vector3(-1,0,0);
		position.addSelf(new THREE.Vector3(20 - 2, -20, 0));
	}

	var ray = new THREE.Ray( position, direction );
	var c = this.collision.rayCastNearest(ray);
	if (c && c.distance < 40 - 5) {
		callback(side);
	}
};

PlayerClass.prototype.handleBomb = function() {
	var availableBombs = this.bombs.length;
	for(bomb in this.bombs) {
		if ( this.bombs[bomb].exploded() ) {
			availableBombs--;
		}
	}
	if (this.keyPressed.bomb && availableBombs < 2) {
		var pos = this.sprite.position.clone().addSelf( new THREE.Vector3(0, -20, -0.25) );
		var tilePos = this.tileSystem.getTilePosition(pos.x + this.tileSystem.tileSize.width / 2, pos.y + 10);
		console.log([tilePos.x,tilePos.y]);

		// Check bomb isnt on same tile
		if (this.tileSystem.bombs.every(function (bomb) {
				return !(tilePos.x == bomb.position.x && tilePos.y == bomb.position.y);
			})
		) {
			pos = this.tileSystem.getPosition(tilePos.x, tilePos.y, pos.z);
	    	
	    	var bomb = new BombClass(tilePos, pos.addSelf( new THREE.Vector3(0, 10, 0) ) );

	    	var c = new THREE.CollisionSystem();
	    	c.merge(this.collision);

	    	bomb.setCollision( c );

			var $this = this;
	    
			this.tileSystem.bombs.forEach(function (b) {
			 	b.addCollision( bomb.sprite );
			 	bomb.addCollision( b.sprite );
			});

			for (player in this.players) {
				bomb.addCollision( this.players[player].sprite );
			}

			bomb.addCollision( this.sprite );

			bombs.add( bomb.animate );

			this.bombs.push(bomb);
			this.tileSystem.bombs.push(bomb);					
		}
		this.keyPressed.bomb = false;
	}

	// Remove expired bombs from array
	this.bombs = this.bombs.filter(function (bomb) {
		return !bomb.expired();
	});
};

PlayerClass.prototype.die = function() {
	if (this.lifes) {
		this.lifes--;
		return;
	}

	if (!this.alive) return;
	this.scene.remove( this.sprite );
	this.alive = false;

	game_alive = false;
	$('#score').remove();
	intro_scene()
	
};