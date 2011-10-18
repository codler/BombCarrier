var TextureClass = function() {
	this.loaded = {};
	this.loadedSrc = {};
}

TextureClass.prototype.preload = function( sources ) {
	for(var src in sources) {
		this.set(src, sources[src]);
	}
	return this.loaded;
}

TextureClass.prototype.get = function( name ) {
	if (!(name in this.loaded)) {
		log('Texture \'' + name + '\' was not found');
		return;
	}
	return this.loaded[name];
}

TextureClass.prototype.getSrc = function( name ) {
	if (!(name in this.loaded)) {
		log('Texture \'' + name + '\' was not found');
		return;
	}
	return this.loadedSrc[name];
}

TextureClass.prototype.set = function( name, src ) {
	if (name in this.loaded) {
		log('Texture \'' + name + '\' was overridden');
	}
	return this.loaded[name] = this.loadedSrc[name] = THREE.ImageUtils.loadTexture(src + (( DEBUG ) ? rId : ''));
}

TextureClass.prototype.has = function( name ) {
	return ( name in this.loaded );
}