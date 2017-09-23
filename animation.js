// Copyright © 2013, 2017 Martin Ueding <dev@martin-ueding.de>

var l = 150;

var h = 0.001;

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
    l2: 1.0,
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

var double_pendulum = {
    g: 9.81,
    l: 1.0,
    l2: 1.0,
    m: 1.0,
    y0: [Math.PI / 2, Math.PI, 0, 0],
    f: function(y) {
        var theta1 = y[0];
        var theta2 = y[1];
        var p1 = y[2];
        var p2 = y[3];

        var dot_theta1 = 6.0 / (this.m * this.l2)
            * (2 * p1 - 3 * Math.cos(theta1 - theta2) * p2)
            / (18 - 9 * Math.pow(Math.cos(theta1 - theta2), 2));
        var dot_theta2 = 6.0 / (this.m * this.l2)
            * (8 * p2 - 3 * Math.cos(theta1 - theta2) * p1)
            / (18 - 9 * Math.pow(Math.cos(theta1 - theta2), 2));

        var dot_p1 = - 1/2.0 * this.m * this.l2
            * (dot_theta1 * dot_theta2 * Math.sin(theta1 - theta2)
                + 3 * this.g / this.l * Math.sin(theta1));
        var dot_p2 = - 1/2.0 * this.m * this.l2
            * (-dot_theta1 * dot_theta2 * Math.sin(theta1 - theta2)
                + this.g / this.l * Math.sin(theta2));

        return [dot_theta1, dot_theta2, dot_p1, dot_p2];
    },
    cartesian: function(y) {
        var theta1 = y[0];
        var theta2 = y[1];
        var x1 = this.l * Math.sin(theta1) * 100;
        var y1 = this.l * Math.cos(theta1) * 100;
        var x2 = x1 + this.l * Math.sin(theta2) * 100;
        var y2 = y1 + this.l * Math.cos(theta2) * 100;

        return [[x1, y1], [x2, y2]];
    }
};

var simple_pendulum = {
    g: 9.81,
    l: 1.0,
    l2: 1.0,
    y0: [1.0, 0],
    f: function(y) {
        phi = y[0];
        dot_phi = y[1];
        return [dot_phi, - this.g / this.l2 * Math.sin(phi)];
    },
    cartesian: function(y) {
        var phi = y[0];
        var x = this.l * Math.sin(phi) * 100;
        var y = this.l * Math.cos(phi) * 100;
        return [[x, y]];
    }
};

var ball_in_cone = {
    g: 100,
    m: 1,
    beta: 0.8,
    y0: [10, 0, 5, 5],
    f: function(y) {
        var z = y[0];
        var phi = y[1];
        var dot_z = y[2];
        var dot_phi = y[3];

        var ddt_z = dot_z;
        var ddt_phi = dot_phi;
        var ddt_dot_z = (this.beta**2 * dot_phi**2 * z - this.g) / (this.beta**2 + 1);
        var ddt_dot_phi = - 2 * dot_z * dot_phi / z;

        return [ddt_z, ddt_phi, ddt_dot_z, ddt_dot_phi];
    },
    cartesian: function(y) {
        var z = y[0];
        var phi = y[1];
        var r = z * this.beta;

        var stretch = 5;

        var out_x = r * Math.cos(phi) * stretch;
        var out_y = -z * stretch;

        return [[out_x, out_y]];
    }
}

var sliding_pendulum = {
    g: 9.81,
    l: 1.0,
    l2: 1.0,
    m: 1.0,
    y0: [0, 0, 1, -1],
    f: function(y) {
        var x = y[0];
        var phi = y[1];
        var dot_x = y[2];
        var dot_phi = y[3];

        var ddt_x = dot_x;
        var ddt_phi = dot_phi;

        var ddt_dot_x = (- this.l / (2 * this.m) * Math.cos(phi) * (- this.m / (2 * this.l) * Math.sin(phi) * dot_phi + this.m * this.g / this.l * Math.sin(phi) + this.m / (2 * this.l) * dot_x * Math.sin(phi) * dot_phi) + this.l / (2 * this.m) * Math.sin(phi) * Math.pow(dot_phi, 2)) / (1 - 1/4 * Math.pow(Math.cos(phi), 2));

        var ddt_dot_phi = - this.m / (2 * this.l) * Math.sin(phi) * dot_phi + this.m * this.g / this.l * Math.sin(phi) - this.m / (2 * this.l) * ddt_dot_x * Math.sin(phi) + this.m / (2 * this.l) * dot_x * Math.sin(phi) * dot_phi;

        return [ddt_x, ddt_phi, ddt_dot_x, ddt_dot_phi];
    },
    cartesian: function(y) {
        var x = y[0];
        var phi = y[1];
        var x1 = x;
        var y1 = 0;
        var x2 = x1 + this.l * Math.sin(phi) * 100;
        var y2 = this.l * Math.cos(phi) * 100;

        return [[x1, y1], [x2, y2]];
    }
}


var start = function() {
    //var filename = window.location.hash.substring(1);
    $("#holder").html("");
    paper = Raphael("holder", 4*l, 4*l+10);
    midpoint = paper.circle(2*l, 2*l, 5);
    midpoint.attr("fill", "#000");
    midpoint.attr("stroke", "#000");

    start_animation(double_pendulum);
};

var circles = [];

var start_animation = function(system) {
    t_id = 0;
    oldtime = 0.0;

    var points = system.cartesian(system.y0);

    for (var id in circles) {
        circles[id].remove();
    }

    for (var point_id in points) {
        var cx = points[point_id][0] + 2*l;
        var cy = points[point_id][1] + 2*l;
        circles[point_id] = paper.circle(cx, cy, 10);
        circles[point_id].attr("fill", "#0A0");
        circles[point_id].attr("stroke", "#000");
    }

    var y = system.y0;

    animation_step(system, y, 0, ++global_id);
}


var animation_step = function(system, y, i, my_id) {
    for (var sub = 0; sub < 10; ++sub) {
        y = rk_step(y, system);
    }
    points = system.cartesian(y);

    for (var point_id in points) {
        var anim = {};
        var px = points[point_id][0];
        var py = points[point_id][1];
        anim.cx = px + 2*l
        anim.cy = py + 2*l
        var callback = function() { animation_step(system, y, i + 1, my_id); };
        var a1 = Raphael.animation(anim, h*500, "linear", point_id == 0 && my_id == global_id ? callback : function() {});
        circles[point_id].animate(a1);
    }
}

var global_id = 0;

start();
