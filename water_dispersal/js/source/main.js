/* 	array shuffle function originally posted on StackOverflow by CoolAJ86,
	and can be found here: http://stackoverflow.com/a/2450976/339852 */
	
function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/* 	randomRange function from my blog post here:
	http://heyjavascript.com/improving-on-javascripts-random-numbers/ */
	
Math.randomRange = function(min, max) {
    if (min && max) {
        return (min + Math.floor(Math.random() * (max - min + 1)));
    } else if (min) {
        return (Math.floor(Math.random() * min + 1))
    } else {
        return (Math.floor(Math.random() * 101));
    }
}

// tile class
function Tile(x, y, altitude) {
	this.x = x;
	this.y = y;
	this.altitude = altitude;
	this.waterLevel = 0;
	this.waterLevelChanged = false;
}

// static variables
var mapWidth = 250,
	mapHeight = 120,
	tileSize = 5,
	noiseLevel = .02,
	waterLevels = 20,
	x_array = [0, -1, -1, -1, 0, 1, 1, 1],
	y_array = [1, 1, 0, -1, -1, -1, 0, 1],
	rainRate = 4;
	
// dynamic variables
var canvas,
	riverSource,
	context,
	waterCanvas, 
	waterContext,
	brushCanvas,
	brushContext,
	tileBatching,
	mod, // current mouse button held down
	noise = new SimplexNoise,
	data = [],
	mouseX,
	mouseY,
	landModInterval,
	brushSize = 10,
	brushIntensity = .1,
	tool = "raise";

// the higher the water level the darker the color
// ranges from .1 for shallowest and .9 for deepest
function getWaterColor(waterLevel) {
	waterLevel = Math.min(waterLevel, waterLevels);
	waterLevel = waterLevels - waterLevel;
	waterLevel /= waterLevels;
	
	waterLevel = Math.max(.4, waterLevel);
	
	var col = [77, 210, 255];

	col[0] = Math.floor(col[0] * waterLevel + .5);
	col[1] = Math.floor(col[1] * waterLevel + .5);
	col[2] = Math.floor(col[2] * waterLevel + .5);
	
	return col;
}

function getLandColor(altitude) {
	var sandColor = [73, 56, 41];
	var grassColor = [0,179, 0];
	
	altitude = Math.min(.9, Math.max(0, altitude - .1));
	
	var r = Math.floor(sandColor[0] + (altitude * (grassColor[0] - sandColor[0])) + .5);
	var g = Math.floor(sandColor[1] + (altitude * (grassColor[1] - sandColor[1])) + .5);
	var b = Math.floor(sandColor[2] + (altitude * (grassColor[2] - sandColor[2])) + .5);
	
	return [r, g, b];
}

function modifyLand() {
	var dx = Math.floor(mouseX / tileSize + .5);
	var dy = Math.floor(mouseY / tileSize + .5);
	
	switch(tool) {
		case "raise":
			// create a feathered brushstroke
			for(var x = dx-brushSize-5; x<dx+brushSize + 5; x++) {
				for(var y = dy-brushSize-5; y<dy+brushSize + 5; y++) {
					if(!data[x] || !data[x][y]) {
						continue;
					}
					var distance = Math.sqrt((x - dx) * (x - dx) + (y - dy) * (y - dy));
					if(distance <= brushSize) {
						distance = (brushSize - distance) / (brushSize / 2);
						distance *= .04;
						data[x][y].altitude += distance * mod * brushIntensity;
						data[x][y].altitude = Math.max(.1, Math.min(data[x][y].altitude, .9));
					}
				}
			}
			break;
		
		case "lower":		
			// create a feathered brushstroke
			for(var x = dx-brushSize-5; x<dx+brushSize + 5; x++) {
				for(var y = dy-brushSize-5; y<dy+brushSize + 5; y++) {
					if(!data[x] || !data[x][y]) {
						continue;
					}
					var distance = Math.sqrt((x - dx) * (x - dx) + (y - dy) * (y - dy));
					if(distance <= brushSize) {
						distance = (brushSize - distance) / (brushSize / 2);
						distance *= .04;
						data[x][y].altitude += distance * mod * -1 * brushIntensity;
						data[x][y].altitude = Math.max(.1, Math.min(data[x][y].altitude, .9));
					}
				}
			}
			
			break;
			
		case "smooth":
			var averageAltitude = 0;
		
			// find average height of tiles in brush range
			for(var x = dx-brushSize-5; x<dx+brushSize + 5; x++) {
				for(var y = dy-brushSize-5; y<dy+brushSize + 5; y++) {
					if(!data[x] || !data[x][y]) {
						continue;
					}
					var distance = Math.sqrt((x - dx) * (x - dx) + (y - dy) * (y - dy));
					if(distance <= brushSize) {
						averageAltitude += data[x][y].altitude;
					}
				}
			}
			
			averageAltitude /= (brushSize * brushSize) * Math.PI;
			
			// apply height to all tiles modified by intensity
			for(var x = dx-brushSize-5; x<dx+brushSize + 5; x++) {
				for(var y = dy-brushSize-5; y<dy+brushSize + 5; y++) {
					if(!data[x] || !data[x][y]) {
						continue;
					}
					var distance = Math.sqrt((x - dx) * (x - dx) + (y - dy) * (y - dy));
					if(distance <= brushSize) {
						var diff = averageAltitude - data[x][y].altitude;
						distance = (brushSize - distance) / (brushSize / 2);
						distance *= .04;
						data[x][y].altitude += distance * diff * brushIntensity;
						data[x][y].altitude = Math.max(.1, Math.min(data[x][y].altitude, .9));
					}
				}
			}
			break;	
			
		default:
			alert("huh?");
			break;
	}
	
	renderLand((dx-brushSize-5) * tileSize, (dy-brushSize-5) * tileSize, (dx+brushSize+5) * tileSize, (dy+brushSize+5) * tileSize);
}

function renderLand(minX, minY, maxX, maxY) {
	minX = minX || 0;
	maxX = maxX || mapWidth * tileSize;
	minY = minY || 0;
	maxY = maxY || mapHeight * tileSize;
	
	context.clearRect(minX, minY, maxX - minX, maxY - minY);
	
	minX /= tileSize;
	maxX /= tileSize;
	minY /= tileSize;
	maxY /= tileSize;
	
	for(x = minX; x<maxX; x++) {
		for(y = minY; y<maxY; y++) {
			if(!data[x] || !data[x][y]) {
				continue;
			}
			var t = data[x][y];
			
			var color = getLandColor(t.altitude);
			context.fillStyle = "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
			context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
		}
	}
}

function render() {
	var x, y,
		color, 
		t; // current tile
	
	waterContext.clearRect(0, 0, mapWidth * tileSize, mapHeight * tileSize);
	
	tileBatching = {};
	
	// batch tiles based on water level to avoid setting context fillStyle many times
	for(x = 0; x<data.length; x++) {
		for(y = 0; y<data[x].length; y++) {
			t = data[x][y];
			
			if(!t.waterLevelChanged || t.waterLevel == 0) {
				continue;
			}
			
			if(typeof tileBatching[t.waterLevel] === "undefined") {
				tileBatching[t.waterLevel] = [t];
			} else {
				tileBatching[t.waterLevel].push(t);
			}
		}
	}
	
	// set context fillStyle once for each represented water level and render 
	// all tiles with that level of water
	for(tList in tileBatching) {
		var list = tileBatching[tList];
		color = getWaterColor(+tList);
		opacity = Math.min(waterLevels, +tList + 2) / waterLevels;
		waterContext.fillStyle = "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + "," + opacity + ")";
		
		for(var i = 0; i<list.length; i++) {
			waterContext.fillRect(list[i].x * tileSize, list[i].y * tileSize, tileSize, tileSize);
		}
	}
	
	
}

function updateBrush() {
	brushCanvas.width = brushSize * 2 * tileSize;
	brushCanvas.height = brushSize * 2 * tileSize;
	
	var dx = Math.floor(brushCanvas.width / 2 / tileSize + .5);
	var dy = Math.floor(brushCanvas.height / 2 / tileSize + .5);
	console.log(dx);
	for(var x = 1; x<brushCanvas.width / tileSize; x++) {
		for(var y = 1; y<brushCanvas.height / tileSize; y++) {
			var distance = Math.sqrt((x - dx) * (x - dx) + (y - dy) * (y - dy));
			if(distance <= brushSize) {
				brushContext.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
			}
		}
	}
}

function update() {
	// add water at random points (aka rain)
	
	/*for(var i = 0; i<rainRate; i++) {
		var px = Math.randomRange(1, mapWidth-1);
		var py = Math.randomRange(1, mapHeight-1);
		data[px][py].waterLevel += 30;
		data[px][py].waterLevelChanged = true;
	}*/
	
	// create a water flow (aka a river) at the top of the map
	for(var x = riverSource - 5; x<riverSource+5; x++) {
		data[x][0].waterLevel += 50;
		data[x][0].waterLevelUpdated = true;
	}
	
	for(var x = data.length-1; x>=0; x--) {
		for(var y = data[x].length-1; y>=0; y--) {
			var t = data[x][y];
			if(!t || t.waterLevel == 0) continue;
			
			var neighbors = [];
			
			// add neighbors to array
			for(var i = 7; i>=0; i--) {
				if(data[x + x_array[i]] && data[x + x_array[i]][y + y_array[i]]) {
					neighbors.push(data[x + x_array[i]][y + y_array[i]]);
				}
			}
			
			// sort neighbors in order from lowest relative to highest relative
			neighbors.sort(function(a, b) {
				return (a.waterLevel + a.altitude) - (b.waterLevel + b.altitude);
			});

			// add water to neighbors as needed until current water level is 0 or all neighbors 
			// have a water level higher than or equal to the current tile
			for(var i = 0; i<8; i++) {
				if(t.waterLevel <=0) {
					break;
				}
				
				n = neighbors[i];
				
				if(!n) continue;
				
				if(t.altitude + t.waterLevel*.04 / 2 > n.altitude + n.waterLevel*.04 / 2) {
					n.waterLevel++;
					//n.waterLevel = Math.min(n.waterLevel, waterLevels);
					n.waterLevelChanged = true;
					t.waterLevel--;
					t.waterLevelChanged = true;
				}
			}
		}
	}
	
	// draw the water
	render();
	
	// ask for the next update in 100 ms; 10 frames per second.
	setTimeout(update, 1000 / 10);
}

function init() {
	var x, y,
		altitude;
	
	mapWidth = Math.ceil($(window).width() / tileSize);
	mapHeight = Math.ceil($(window).height() / tileSize);
	
	// generate data
	for(x = 0; x<mapWidth; x++) {
		data[x] = [];
		for(y = 0; y<mapHeight; y++) {
			altitude = Math.max(0, ((noise.noise(x * noiseLevel, y * noiseLevel) + 1) / 2) - .1);
			data[x][y] = new Tile(x, y, altitude);
		}
	}
		
	// get reference to canvas and context
	canvas = $("#land_render")[0];
	waterCanvas = $("#water_render")[0];
	brushCanvas = $("#brush_render")[0];
	
	canvas.width = mapWidth * tileSize;
	canvas.height = mapHeight * tileSize;
	waterCanvas.width = mapWidth * tileSize;
	waterCanvas.height = mapHeight * tileSize;
	brushCanvas.width = brushSize * 2;
	brushCanvas.height = brushSize * 2;
	
	context = canvas.getContext("2d");
	waterContext = waterCanvas.getContext("2d");
	brushContext = brushCanvas.getContext("2d");
	brushContext.fillStyle = "rgba(0, 204, 204, .1)";
	
	riverSource = Math.floor((mapWidth / 2) + .5);
	
	updateBrush();
	renderLand();
	update();
}

$(function() {
	init();
	
	$("canvas").mousedown(function(e) {
		mouseX = e.pageX;
		mouseY = e.pageY;
		
		// figure out, based on mouse input, whether to lower or raise terrain
		// (right mouse button raises, left mouse button lowers)
		mod = (e.which == 3) ? -1 : 1;
		modifyLand();
		landModInterval = setInterval(modifyLand, 10);
	}).mouseup(function(e) {
		clearInterval(landModInterval);
	}).mousemove(function(e) {
		mouseX = e.pageX;
		mouseY = e.pageY;
		if(e.which == 0) {
			clearInterval(landModInterval);
		}
		
		$(brushCanvas).css({
			top: e.pageY - brushCanvas.height / 2,
			left: e.pageX - brushCanvas.width / 2
		});
		
		
	});
	
	// bind events for tool selection
	$("#toolset").buttonset();
	
	$("#toolset :radio").click(function() {
		tool = $(this).prop("id").replace("_terrain", "");
	})
	
	$("#brush_size_slider").slider({
		value: brushSize,
		min: 1,
		max: 50,
		step: 2,
		slide: function(e, ui) {
			brushSize = ui.value;
			updateBrush();
		}
	});
	
	$("#brush_intensity_slider").slider({
		value: brushIntensity,
		min: 0,
		max: 1,
		step: .1,
		slide: function(e, ui) {
			brushIntensity = ui.value;
		}
	});
	
	$("#clear_water").button().click(function() {
		for(x = 0; x<data.length; x++) {
			for(y = 0; y<data[x].length; y++) {
				data[x][y].waterLevel = 0;
			}
		}
	});
	
	$("#menu").mouseleave(function(e) {
		$(this).stop().delay(1000).animate({
			opacity: .25
		}, 2500);
	}).mouseover(function(e) {
		$(this).stop().animate({
			opacity: 1
		}, 500);
	}).stop().delay(1000).animate({
		opacity: .25
	}, 2500);
	
	document.onselectstart = function(){ return false; }
});