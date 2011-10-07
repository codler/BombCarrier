var TimeClass = function () {
	this.reset();
};
TimeClass.prototype.reset = function () {
	// In microseconds
	this.timeAlive = new Date().getTime();
	this.frame = 0;
};

/*
callback : function( timeOffsetFromFrameStart )

returns if it has elapsed
*/
TimeClass.prototype.elapse = function (frame, seconds, callback) {
	if (this.frame == frame) {
		if (new Date().getTime() > this.timeAlive + seconds * 1000) {
			callback( this.getElapse );
			this.frame++;
		}
	}
	return this.getFrameElapsed(frame);
};

TimeClass.prototype.getElapse = function () {
	// Returns seconds
	return (new Date().getTime() - this.timeAlive) / 1000;
};

TimeClass.prototype.getFrameElapsed = function (frame) {
	return this.frame > frame;
};