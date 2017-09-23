// Copyright © 2013, 2017 Martin Ueding <dev@martin-ueding.de>

var l = 150;

var h = 0.01;

var rk_step = function(y, system) {
    // Find out the number of equations.
    var eqs = y.length;

    var k1 = system.f(y);

    var y2 = [];
    for (var i = 0; i < eqs; ++i) {
        y2[i] = y[i] + 0.5 * h * k1[i];
    }
    var k2 = system.f(y2);

    var y3 = [];
    for (var i = 0; i < eqs; ++i) {
        y3[i] = y[i] - h * k1[i] + 2 * h * k2[i];
    }
    var k3 = system.f(y3);

    var y_next = [];
    for (var i = 0; i < eqs; ++i) {
        y_next[i] = y[i] + h * (1.0/6.0 * k1[i] + 4.0/6.0 * k2[i] + 1.0/6.0 * k3[i]);
    }

    return y_next;
}

var spring_pendulum = {
    g: 9.81,
    k: 40.0,
    l: 1.0,
    l2: Math.pow(l, 2),
    m: 1.0,
    y0: [1.0, 2.0, 0.0, 0.0],
    f: function(y) {
        var r = y[0];
        var phi = y[1];
        var dot_r = y[2];
        var dot_phi = y[3];

        var ddt_r = dot_r;
        var ddt_phi = dot_phi;

        var ddt_dot_r = r * Math.pow(dot_phi, 2) + this.g * Math.cos(phi) - this.k / this.m * (r - this.l);
        var ddt_dot_phi = - this.g * Math.sin(phi) / r - 2 * dot_r * dot_phi / r;

        return [ddt_r, ddt_phi, ddt_dot_r, ddt_dot_phi];
    },
    cartesian: function(y) {
        var r = y[0];
        var phi = y[1];

        var x = r * Math.sin(phi) * 100;
        var y = r * Math.cos(phi) * 100;

        return [[x, y]];
    }
};


var start = function() {
    //var filename = window.location.hash.substring(1);
    $("#holder").html("");
    paper = Raphael("holder", 4*l, 4*l+10);
    midpoint = paper.circle(2*l, 2*l, 5);
    midpoint.attr("fill", "#000");
    midpoint.attr("stroke", "#000");

    start_animation(spring_pendulum);
};

var circles = [];

var start_animation = function(system) {
    t_id = 0;
    oldtime = 0.0;

    var points = system.cartesian(system.y0);

    for (var point_id in points) {
        var cx = points[point_id][0] + 2*l;
        var cy = points[point_id][1] + 2*l;
        circles[point_id] = paper.circle(cx, cy, 10);
        circles[point_id].attr("fill", "#0A0");
        circles[point_id].attr("stroke", "#000");
    }

    var y = system.y0;

    animation_step(system, y, 0);
}

var animation_step = function(system, y, i) {
    y = rk_step(y, system);
    points = system.cartesian(y);

    for (var point_id in points) {
        var anim = {};
        var px = points[point_id][0];
        var py = points[point_id][1];
        anim.cx = px + 2*l
        anim.cy = py + 2*l
            //anim.r = 10 + z / 20;
        var callback = function() { animation_step(system, y, i + 1); };
        var a1 = Raphael.animation(anim, h*1000, "linear", callback);
        circles[point_id].animate(a1);
    }
}

start();
