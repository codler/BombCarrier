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
			callback = callback || function() {};
			callback( this.getElapse );
			this.frame++;
		}
	}
	return this.getFrameElapsed(frame);
};

/*
unit : string(s, ms)

default is seconds
*/
TimeClass.prototype.getElapse = function ( unit ) {
	unit = unit || 's';
	if (unit == 's') {
		unit = 1000;
	} else if(unit == 'ms') {
		unit = 1;
	}
	return (new Date().getTime() - this.timeAlive) / unit;
};

TimeClass.prototype.getFrameElapsed = function (frame) {
	return this.frame > frame;
};