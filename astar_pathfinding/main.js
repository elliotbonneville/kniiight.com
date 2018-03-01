var canvas, context, map = [], start, astar, gridSize = 10;

$(function() {
	canvas = $("#canvas")[0];
	context = canvas.getContext("2d");
	
	drawMap();
	
	context.strokeStyle = "black";
	context.lineWidth = 2;
	context.strokeRect(1, 1, canvas.width-2, canvas.height-2);
	
	$("#canvas").click(function(e) {
		var _x = Math.floor(e.pageX / gridSize + .5) - 1;
		var _y = Math.floor(e.pageY / gridSize + .5) - 1;
		
		if(map[_x][_y] == 0) {
			if(start) {
				var path = astar.path(start.x, start.y, _x, _y);
				if(path !== undefined) {
					path.unshift(start);
					drawPath(path);
					start = undefined;
					
					context.fillStyle = "red";
					context.fillRect(_x*gridSize + 1, _y*gridSize + 1, gridSize, gridSize);
					context.strokeRect(_x * gridSize + 1, _y*gridSize + 1, gridSize, gridSize);
				} else {
					console.log("Path is blocked.");
					start = undefined;
				}
			} else {
				start = {x: _x, y: _y};
				context.fillStyle = "red";
				context.fillRect(_x*gridSize + 1, _y*gridSize + 1, gridSize, gridSize);
				context.strokeRect(_x * gridSize + 1, _y*gridSize + 1, gridSize, gridSize);
			}
		}
	});
});

function drawMap() {
	context.strokeStyle = "gray";
	
	for(var x = 1; x<canvas.width; x+=gridSize) {
		for(var y = 1; y<canvas.height; y+=gridSize) {
			context.strokeRect(x, y, gridSize, gridSize);
		}
	}
	context.strokeStyle = "black";
	
	for(x = 0; x<canvas.width / gridSize; x++) {
		map[x] = [];
		context.lineWidth = 1;
		for(var y = 0; y<canvas.width/gridSize; y++) {
			map[x][y] = 0;
			
			if(Math.random() > .6) {
				context.fillRect(x*gridSize + 1, y*gridSize + 1, gridSize, gridSize);
				context.strokeRect(x * gridSize + 1, y*gridSize + 1, gridSize, gridSize);

				map[x][y] = 1;
			} else {
				map[x][y] = 0;
			}
		}
	}
	
	astar = new AStar(map, canvas.width/gridSize, canvas.width/gridSize, function(data, x, y) {
		return {
			blocks: data[x][y]
		}
	});
}

function drawPath(points) {
	context.beginPath();
	
	for(var i = 0, len = points.length; i<len; i++) {
		context.moveTo(points[i].x * gridSize + gridSize/2, points[i].y * gridSize + gridSize/2);
		
		if(i < len - 1) {
			context.lineTo(points[i+1].x * gridSize + gridSize/2, points[i+1].y * gridSize + gridSize/2);
		}
	}
	
	context.strokeStyle = "red";
	context.stroke();
	context.strokeStyle = "black";
}