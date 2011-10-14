var SceneClass = function () {
	var $this = this;
	// Stores all sceneContent
	this.scenes = {};

	this.htmlScene = $('<div>').css({
		'background-size' : '100% 100%',
		'font-family' : "'Holtwood One SC', serif",
		'position' : 'absolute',
		'top' : 0,
		'left' : 0,
		'z-index' : 101,
		'text-align' : 'center',
		'width' : '100%',
		'height' : '100%'
	});

	this.htmlSceneInner = $('<div>').css({
		'margin' : '0 auto'
	});

	this.htmlScene.append( this.htmlSceneInner );
	container.append( this.htmlScene );

	// Fix aspect ratio
	var fixAspectRatio = function() {
		if ($this.htmlScene.width() / $this.htmlScene.height() > 1.8) {
			$this.htmlSceneInner.width($this.htmlScene.height() * 1.8);
		}
	};
	fixAspectRatio();
	$(window).resize(fixAspectRatio);
};

SceneClass.prototype.defaultBackground = 'textures/diaglog-box.png';

SceneClass.prototype.add = function(name, sceneContent, callback) {
	this.scenes[name] = {
		'content' : sceneContent,
		'callback' : callback
	};
};

SceneClass.prototype.change = function(name) {
	var $this = this;
	// scene does not exist
	if (!this.scenes.hasOwnProperty(name)) return;

	// remove old scene
	this.htmlSceneInner.children().remove();

	// Get new scene
	scene = this.scenes[name];

	if (scene.content instanceof Function) {
		this.htmlScene.hide();
		scene.content();
		return;
	} else {
		this.htmlScene.show();
	}

	this.htmlScene.css({
		'background-image' : 'url("' + ((scene.content.background) ? scene.content.background : this.defaultBackground) + '")'
	});

	var defaultCss = {
		'color' : '#fff',
		'padding' : 0,
		'margin' : 0,
		'width' : '100%',
		'-moz-user-select' : 'none',
		'-webkit-user-select' : 'none',
		'user-select' : 'none'
	};
	for(var key in scene.content.content) {
		var value = scene.content.content[key];
		var content = $('<div>')
			.html( (value.text instanceof Function) ? value.text() : value.text )
			.css( $.extend({}, defaultCss, value.css) );
		
		if (value.clickScene) {
			content.attr('tag', 'a');
			content.css('color', '');
			// Lambda function needed here to fix reference problem.
			(function(v) {
				content.one('click', function () {
					$this.change(v);
				});
			})(value.clickScene);
		} else {
			content.css('cursor', 'default');
		}

		this.htmlSceneInner.append( content );
		$(content).fitText( value.fitTextSize );
	}

	if (scene.callback instanceof Function) {
		scene.callback();
	}
};

/* -------------------
	sceneContent
   ------------------- */
var SceneContent = function() {
	this.content = [];
};

SceneContent.prototype.setBackground = function(background) {
	this.background = background;
};
/*
fitTextSize : int
text : string|function
clickScene : string
css : object
*/
SceneContent.prototype.add = function(fitTextSize, text, clickScene, css) {
	this.content.push({
		'fitTextSize' : fitTextSize,
		'text' : text,
		'clickScene' : clickScene,
		'css' : css
	});
};