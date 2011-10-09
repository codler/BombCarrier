/*
timeAlive : Seconds
*/
var BombClass = function(tilePosition, position, timeAlive, firePower) {
	this.animate   = new THREE.Object3D();
	this.timeAlive = timeAlive || 5;
	this.position  = tilePosition;
	this.firePower = firePower || 2;

	this.sprite = new THREE.Sprite( { map: THREE.ImageUtils.loadTexture( texture.bomb ), useScreenCoordinates: false } );
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


	this.hasExploaded = false;
	
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

BombClass.prototype.checkCollision = function (direction, distance) {
	var ray = new THREE.Ray( this.sprite.position.clone().addSelf(new THREE.Vector3(0, -20,0)), direction );
	var d = this.collision.rayCastAll(ray);
	var c = d.sort(function (a,b) {
		return a.distance - b.distance;
	})[0];

	if (c && c.distance < distance ) {

		if(c.mesh.gameType == 'bomb'){
			c.mesh.bombClass.explode();
		}else{
			var tilePos = tileSystem.getTilePosition( c.mesh.position.x, c.mesh.position.y );
			tileSystem.changeTile( tilePos.x, tilePos.y, 0 );
			
		}
	}
};

BombClass.prototype.explode = function () {
	this.sprite.map = THREE.ImageUtils.loadTexture( texture.explosion3 );
	this.sprite.scale = new THREE.Vector3(1.3,1.3,1);
	this.sprite.position.y += 30;

	this.sprite2 = new THREE.Sprite( { map: THREE.ImageUtils.loadTexture( texture.explosion2 ), useScreenCoordinates: false } );
	this.sprite2.map.needsUpdate = true;
	this.sprite2.position = this.sprite.position;
	this.sprite2.scale = this.sprite.scale;
	this.animate.add( this.sprite2 );

	// collision with tile
	this.checkCollision(new THREE.Vector3(0,1,0), tileSystem.tileSize.height * this.firePower);
	this.checkCollision(new THREE.Vector3(0,-1,0), tileSystem.tileSize.height * this.firePower);
	this.checkCollision(new THREE.Vector3(1,0,0), tileSystem.tileSize.width * this.firePower);
	this.checkCollision(new THREE.Vector3(-1,0,0), tileSystem.tileSize.width * this.firePower);
	
	this.hasExploaded = true;
	this.timeAlive = this.time.getElapse() + 2;
}


BombClass.prototype.update = function () {
	var $this = this;
	if (this.hasExploaded || this.time.elapse(0, this.timeAlive - 2, function () {
		$this.explode();
	}) ) {

		this.sprite.opacity = 1 - ( this.time.getElapse() / this.timeAlive );
		this.sprite2.opacity = 1 - ( this.time.getElapse() / this.timeAlive );

	}
};

BombClass.prototype.expired = function () {
	return this.time.getElapse() > this.timeAlive;
};

BombClass.prototype.exploded = function () {
	return this.time.getElapse() > this.timeAlive - 2;
};