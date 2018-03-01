function getLine(x0, y0, x1, y1) {
	var dx = Math.abs(x1 - x0),
		dy = Math.abs(y1 - y0),			
		sx = (x0 < x1) ? 1 : -1,
		sy = (y0 < y1) ? 1 : -1,
		err = dx - dy,
		points = [],
		e2;
	
	while(true) {
		points.push({
			x: x0,
			y: y0
		});
		
		if(x0 === x1 && y0 === y1) {
			break;
		}
		
		e2 = 2 * err;
		
		if(e2 > -dy) {
			err = err - dy;
			x0 = x0 + sx;
		}
		
		if(e2 < dx) {
			err = err + dx;
			y0 = y0 + sy;
		}
	}
	
	return points;
}

// function blendColors(rgb1, strength1, rgb2, strength2) {
// 	strength1 = strength1 || 1;
// 	strength2 = strength2 || 1;
	
// 	rgb1.r *= strength1;
// 	rgb1.g *= strength1;
// 	rgb1.b *= strength1;
	
// 	rgb2.r *= strength2;
// 	rgb2.g *= strength2;
// 	rgb2.b *= strength2;
	
// 	var r = Math.round((rgb1.r + rgb2.r) / (strength1 + strength2));
// 	var g = Math.round((rgb1.g + rgb2.g) / (strength1 + strength2));
// 	var b = Math.round((rgb1.b + rgb2.b) / (strength1 + strength2));
	
// 	return {r: r, g: g, b: b}
// }

function blendColors(colors) {
	var r = 0,
		g = 0, 
		b = 0, 
		w = 0;
	
	for(var i = 0; i<colors.length; i++) {
		r += colors[i].color.r;
		g += colors[i].color.g;
		b += colors[i].color.b;
		w += colors[i].strength;
	}
	
	r = Math.round(r / w);
	g = Math.round(g / w);
	b = Math.round(b / w);
	
	return {r: r, g: g, b: b};
}

function colorString(rgb, a) {
	if(a) {
		return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + a + ")";
	}
	
	return "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
}