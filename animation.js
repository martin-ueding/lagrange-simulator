// Copyright © 2013 Martin Ueding <dev@martin-ueding.de>

var l = 100;

var start = function(filename) {
	$("#holder").html("");
	paper = Raphael("holder", 4*l, 4*l+10);
	midpoint = paper.circle(2*l, 2*l, 5);
	midpoint.attr("fill", "#000");
	midpoint.attr("stroke", "#000");

	$.getJSON(filename, 0, function(response, status, jqXHR) {
		data = response;
		console.log(data);
		start_animation();
	});
};

var start_animation = function() {
	t_id = 0;
	oldtime = 0.0;

	circles = [];
	for (var point_id in data.points) {
		circles[point_id] = paper.circle(data.points[point_id].x[0] + 2*l, data.points[point_id].y[0] + 2*l, 10);
		circles[point_id].attr("fill", "#0A0");
		circles[point_id].attr("stroke", "#000");
	}

	animation_step();
}

var animation_step = function() {
	if (t_id >= data.t.length)
		return;

	for (var point_id in data.points) {
		var t = data.t[t_id];
		var x = data.points[point_id].x[t_id];
		var y = data.points[point_id].y[t_id];
		var a1 = Raphael.animation({"cx": x + 2*l, "cy": y + 2*l}, (t-oldtime)*1000, "linear", point_id == 0 ? animation_step : function() {});
		circles[point_id].animate(a1);
	}

	oldtime = t;

	t_id += 1;
}

start("Simple_Pendulum.js");
