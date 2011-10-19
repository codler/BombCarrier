/*
timeAlive : Seconds
*/
var BombClass = function(tilePosition, position, timeAlive, firePower) {
	this.animate   = new THREE.Object3D();
	this.fireAnimate = new THREE.Object3D();
	this.timeAlive = timeAlive || 5;
	this.position  = tilePosition;
	this.firePower = firePower || 2;
	this.steppable  = true;

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

	this.animate.add( this.fireAnimate );

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

	// collision with tile
	var done = {
		'player' : false
	};
	var distance = 0;
	// up
	distance = this.checkCollision(new THREE.Vector3(0,1,0), tileSystem.tileSize.height * this.firePower, done);
	if (distance === false || distance > tileSystem.tileSize.height) {
		var dTile = (distance === false) ? this.firePower : Math.floor(distance / tileSystem.tileSize.height);
		for(var i = 1, j = dTile; i <= j; i++) {
			var sprite = new THREE.Sprite( { map: _GAME_.texture.get('explosion2'), useScreenCoordinates: false } );
			sprite.map.needsUpdate = true;
			sprite.position = this.sprite.position.clone().addSelf(new THREE.Vector3(0,-30 + i * tileSystem.tileSize.height,0));
			sprite.scale.y /= 2;
			this.fireAnimate.add( sprite );
		}
	}

	// down
	distance = this.checkCollision(new THREE.Vector3(0,-1,0), tileSystem.tileSize.height * this.firePower, done);
	if (distance === false || distance > tileSystem.tileSize.height) {
		var dTile = (distance === false) ? this.firePower : Math.floor(distance / tileSystem.tileSize.height);
		for(var i = 1, j = dTile; i <= j; i++) {
			var sprite = new THREE.Sprite( { map: _GAME_.texture.get('explosion2'), useScreenCoordinates: false } );
			sprite.map.needsUpdate = true;
			sprite.position = this.sprite.position.clone().addSelf(new THREE.Vector3(0,-30 - i * tileSystem.tileSize.height,2*i));
			sprite.scale.y /= 2;
			sprite.rotation = Math.PI;
			this.fireAnimate.add( sprite );
		}
	}
	// right
	distance = this.checkCollision(new THREE.Vector3(1,0,0), tileSystem.tileSize.width * this.firePower, done);
	if (distance === false || distance > tileSystem.tileSize.width) {
		var dTile = (distance === false) ? this.firePower : Math.floor(distance / tileSystem.tileSize.width);
		for(var i = 1, j = dTile; i <= j; i++) {
			var sprite = new THREE.Sprite( { map: _GAME_.texture.get('explosion2'), useScreenCoordinates: false } );
			sprite.map.needsUpdate = true;
			sprite.position = this.sprite.position.clone().addSelf(new THREE.Vector3(i*tileSystem.tileSize.width,-30,0));
			sprite.scale.y /= 2;
			sprite.rotation = -Math.PI/2;
			this.fireAnimate.add( sprite );
		}
	}
	// left
	distance = this.checkCollision(new THREE.Vector3(-1,0,0), tileSystem.tileSize.width * this.firePower, done);
	if (distance === false || distance > tileSystem.tileSize.width) {
		var dTile = (distance === false) ? this.firePower : Math.floor(distance / tileSystem.tileSize.width);
		for(var i = 1, j = dTile; i <= j; i++) {
			var sprite = new THREE.Sprite( { map: _GAME_.texture.get('explosion2'), useScreenCoordinates: false } );
			sprite.map.needsUpdate = true;
			sprite.position = this.sprite.position.clone().addSelf(new THREE.Vector3(-i*tileSystem.tileSize.width,-30,0));
			sprite.scale.y /= 2;
			sprite.rotation = Math.PI/2;
			this.fireAnimate.add( sprite );
		}		
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

		var fires = this.fireAnimate.children;
		for(var i = 0; i < fires.length; i++) {
			fires[i].opacity = 1 - ( this.time.getElapse() / this.timeAlive );
		}
	}
};

BombClass.prototype.expired = function () {
	return this.time.getElapse() > this.timeAlive;
};

BombClass.prototype.exploded = function () {
	return this.time.getElapse() > this.timeAlive - 2;
};