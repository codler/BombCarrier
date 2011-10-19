/*
timeAlive : Seconds
*/
var BombClass = function(tilePosition, position, timeAlive, firePower) {
	this.animate   = new THREE.Object3D();
	this.timeAlive = timeAlive || 5;
	this.position  = tilePosition;
	this.firePower = firePower || 2;

	this.sprite = new THREE.Sprite( { map: _GAME_.texture.get('bomb'), useScreenCoordinates: false } );
	this.sprite.map.needsUpdate = true;

	this.sprite.position = position;
	this.sprite.scale = new THREE.Vector3(1.6,1.6,1);

	this.sprite.boundingMesh = new THREE.Mesh(
					new THREE.CubeGeometry(120, 60, 100, 1, 1, 1) 
					//,new THREE.MeshLambertMaterial( { color: 0xffccff } )
				);

				this.sprite.boundingMesh.position = this.sprite.position;

	this.sprite.boundingMesh.gameType = 'bomb';


	this.animate.add( this.sprite );
	this.animate.add( this.sprite.boundingMesh );


	this.hasExploded = false;
	
	this.time = new TimeClass();
	this.sprite.boundingMesh.bombClass = this;
};

/*
collision : Object3d | Mesh
*/
BombClass.prototype.addCollision = function(collision) {
	this.collision.colliders.push( THREE.CollisionUtils.MeshOBB( collision.boundingMesh || collision ) );
};


BombClass.prototype.setCollision = function (collision) {
	this.collision = collision;
};

/*
returns distance
*/
BombClass.prototype.checkCollision = function (direction, distance, done) {
	var ray = new THREE.Ray( this.sprite.position.clone().addSelf(new THREE.Vector3(0, -20,0)), direction );
	var d = this.collision.rayCastAll(ray);
	var c = d.sort(function (a,b) {
		return a.distance - b.distance;
	})[0];

	if (c && c.distance < distance ) {
		if(c.mesh.gameType == 'bomb') {
			if (!c.mesh.bombClass.hasExploded) {
				c.mesh.bombClass.explode();
			}
		} else if(c.mesh.gameType == 'player') {
			if (!done.player) {
				console.log('kill');
				c.mesh.playerClass.die();
				done.player = true;
			}

		} else {
			var randTiles = [0,8,9];
			var tilePos = tileSystem.getTilePosition( c.mesh.position.x, c.mesh.position.y );

			if (tileSystem.level[tilePos.y][tilePos.x].type == 7 ||
				tileSystem.level[tilePos.y][tilePos.x].type == 8) {
				tileSystem.changeTile( tilePos.x, tilePos.y, 0 );				
			} else {
				tileSystem.changeTile( tilePos.x, tilePos.y, randTiles[Math.floor(Math.random() * randTiles.length)] );
			}

		}
		return c.distance;
	}
	return false;
};

BombClass.prototype.explode = function () {
	if (this.hasExploded) return;
	this.hasExploded = true;

	this.sprite.map = _GAME_.texture.get('explosion3');
	this.sprite.scale = new THREE.Vector3(1.3,1.3,1);
	this.sprite.position.y += 30;

	this.sprite2 = new THREE.Sprite( { map: _GAME_.texture.get('explosion2'), useScreenCoordinates: false } );
	this.sprite2.map.needsUpdate = true;
	this.sprite2.position = this.sprite.position;
	this.sprite2.scale = this.sprite.scale;
	this.animate.add( this.sprite2 );

	// Right2
	/*this.sprite7 = new THREE.Sprite( { map: _GAME_.texture.get('explosion2'), useScreenCoordinates: false } );
	this.sprite7.map.needsUpdate = true;
	this.sprite7.position = this.sprite.position.clone().addSelf(new THREE.Vector3(tileSystem.tileSize.width*2,-30,0));
	this.sprite7.scale.y /= 2;
	this.sprite7.rotation = -Math.PI/2;
	this.animate.add( this.sprite7 );*/

	// collision with tile
	var done = {
		'player' : false
	};
	var distance = 0;
	// up
	distance = this.checkCollision(new THREE.Vector3(0,1,0), tileSystem.tileSize.height * this.firePower, done);
	if (distance > tileSystem.tileSize.height) {
		// up
		this.sprite5 = new THREE.Sprite( { map: _GAME_.texture.get('explosion2'), useScreenCoordinates: false } );
		this.sprite5.map.needsUpdate = true;
		this.sprite5.position = this.sprite.position.clone().addSelf(new THREE.Vector3(0,-30 + tileSystem.tileSize.height,0));
		this.sprite5.scale.y /= 2;
		this.animate.add( this.sprite5 );
	}
	// down
	distance = this.checkCollision(new THREE.Vector3(0,-1,0), tileSystem.tileSize.height * this.firePower, done);
	if (distance > tileSystem.tileSize.height) {
		// down
		this.sprite6 = new THREE.Sprite( { map: _GAME_.texture.get('explosion2'), useScreenCoordinates: false } );
		this.sprite6.map.needsUpdate = true;
		this.sprite6.position = this.sprite.position.clone().addSelf(new THREE.Vector3(0,-30 - tileSystem.tileSize.height,2));
		this.sprite6.scale.y /= 2;
		this.sprite6.rotation = Math.PI;
		this.animate.add( this.sprite6 );
	}
	// left
	distance = this.checkCollision(new THREE.Vector3(1,0,0), tileSystem.tileSize.width * this.firePower, done);
	if (distance > tileSystem.tileSize.width) {
		// Left
		this.sprite4 = new THREE.Sprite( { map: _GAME_.texture.get('explosion2'), useScreenCoordinates: false } );
		this.sprite4.map.needsUpdate = true;
		this.sprite4.position = this.sprite.position.clone().addSelf(new THREE.Vector3(-tileSystem.tileSize.width,-30,0));
		this.sprite4.scale.y /= 2;
		this.sprite4.rotation = Math.PI/2;
		this.animate.add( this.sprite4 );
	}
	// right
	this.checkCollision(new THREE.Vector3(-1,0,0), tileSystem.tileSize.width * this.firePower, done);
	if (distance > tileSystem.tileSize.width) {
		// Right
		this.sprite3 = new THREE.Sprite( { map: _GAME_.texture.get('explosion2'), useScreenCoordinates: false } );
		this.sprite3.map.needsUpdate = true;
		this.sprite3.position = this.sprite.position.clone().addSelf(new THREE.Vector3(tileSystem.tileSize.width,-30,0));
		this.sprite3.scale.y /= 2;
		this.sprite3.rotation = -Math.PI/2;
		this.animate.add( this.sprite3 );
	}
	
	this.timeAlive = this.time.getElapse() + 2;
}


BombClass.prototype.update = function () {
	var $this = this;
	if (this.hasExploded || this.time.elapse(0, this.timeAlive - 2, function () {
		$this.explode();
	}) ) {

		if (this.sprite) this.sprite.opacity = 1 - ( this.time.getElapse() / this.timeAlive );
		if (this.sprite2) this.sprite2.opacity = 1 - ( this.time.getElapse() / this.timeAlive );
		if (this.sprite3) this.sprite3.opacity = 1 - ( this.time.getElapse() / this.timeAlive );
		if (this.sprite4) this.sprite4.opacity = 1 - ( this.time.getElapse() / this.timeAlive );
		if (this.sprite5) this.sprite5.opacity = 1 - ( this.time.getElapse() / this.timeAlive );
		if (this.sprite6) this.sprite6.opacity = 1 - ( this.time.getElapse() / this.timeAlive );
		//this.sprite7.opacity = 1 - ( this.time.getElapse() / this.timeAlive );

	}
};

BombClass.prototype.expired = function () {
	return this.time.getElapse() > this.timeAlive;
};

BombClass.prototype.exploded = function () {
	return this.time.getElapse() > this.timeAlive - 2;
};