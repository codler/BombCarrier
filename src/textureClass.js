var TextureClass = function( path ) {
	this.loaded = {};
	this.URLs = {};
	this.path = path || 'textures/';
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

TextureClass.prototype.url = function( name ) {
	if (!(name in this.URLs)) {
		log('Texture \'' + name + '\' was not found');
		return;
	}
	return this.path + this.URLs[name];
}

TextureClass.prototype.set = function( name, src ) {
	if (name in this.loaded) {
		log('Texture \'' + name + '\' was overridden');
	}
	this.URLs[name] = src;
	return this.loaded[name] = THREE.ImageUtils.loadTexture(this.path + src + (( DEBUG ) ? rId : ''));
}

TextureClass.prototype.has = function( name ) {
	return ( name in this.loaded );
}