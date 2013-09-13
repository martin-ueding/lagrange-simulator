#!/usr/bin/python3
# -*- coding: utf-8 -*-

# Copyright © 2013 Martin Ueding <dev@martin-ueding.de>

import argparse
import json
import numpy as np
import pprint
import sys
import scipy.integrate

__docformat__ = "restructuredtext en"

class MechanicalSystem(object):
    def __init__(self):
        self.data = {}

    def solve(self, y0, t):
        self.result, infodict = scipy.integrate.odeint(self, y0, t, full_output=True)

        self.t = infodict["tcur"]

    def save_to_json(self, file_):
        self.convert_to_cartesian()
        with open(file_, "w") as f:
            f.write(json.dumps(self.data, indent=4, sort_keys=True))


class SimplePendulum(MechanicalSystem):
    g = 9.81
    l = 1.
    l2 = l**2

    def __call__(self, y, t0):
        phi = y[0]
        dot_phi = y[1]
        return np.array([dot_phi, - self.g / self.l2 * np.sin(phi)])

    def convert_to_cartesian(self):
        phi = self.result[:, 0]
        x = self.l * np.sin(phi) * 100
        y = self.l * np.cos(phi) * 100

        self.data = {
            "t": list(self.t),
            "points": [
                {
                    "x": list(x),
                    "y": list(y),
                },
            ],
        }

class BallInCone(MechanicalSystem):
    g = 9.81
    m = 1
    beta = .5

    def __call__(self, y, t0):
        z = y[0]
        phi = y[1]
        dot_z = y[2]
        dot_phi = y[3]

        ddt_z = dot_z
        ddt_phi = dot_phi
        ddt_dot_z = (self.beta**2 * dot_phi**2 * z - self.g) / (self.beta**2 + 1)
        ddt_dot_phi = - 2 * dot_z * dot_phi / z

        return [ddt_z, ddt_phi, ddt_dot_z, ddt_dot_phi]

    def convert_to_cartesian(self):
        z = self.result[:, 0]
        phi = self.result[:, 1]
        r = z * self.beta

        stretch = 5

        out_x = r * np.cos(phi) * stretch
        out_z = r * np.sin(phi) * stretch
        out_y = -z * stretch

        self.data = {
            "t": list(self.t),
            "points": [
                {
                    "x": list(out_x),
                    "y": list(out_y),
                    "z": list(out_z),
                },
            ],
        }


class DoublePendulum(MechanicalSystem):
    g = 9.81
    l = 1.
    l2 = l**2
    m = 1

    def __call__(self, y, t0):
        theta1 = y[0]
        theta2 = y[1]
        p1 = y[2]
        p2 = y[3]

        dot_theta1 = 6 / (self.m * self.l2) * (2 * p1 - 3 * np.cos(theta1 - theta2) * p2) / (18 - 9 * np.cos(theta1 - theta2)**2)
        dot_theta2 = 6 / (self.m * self.l2) * (8 * p2 - 3 * np.cos(theta1 - theta2) * p1) / (18 - 9 * np.cos(theta1 - theta2)**2)

        dot_p1 = - 1/2 * self.m * self.l2 * (dot_theta1 * dot_theta2 * np.sin(theta1 - theta2) + 3 * self.g / self.l * np.sin(theta1))
        dot_p2 = - 1/2 * self.m * self.l2 * (-dot_theta1 * dot_theta2 * np.sin(theta1 - theta2) + self.g / self.l * np.sin(theta2))

        return [dot_theta1, dot_theta2, dot_p1, dot_p2]
    
    def convert_to_cartesian(self):
        theta1 = self.result[:, 0]
        theta2 = self.result[:, 1]
        x1 = self.l * np.sin(theta1) * 100
        y1 = self.l * np.cos(theta1) * 100
        x2 = x1 + self.l * np.sin(theta2) * 100
        y2 = y1 + self.l * np.cos(theta2) * 100

        self.data = {
            "t": list(self.t),
            "points": [
                {
                    "x": list(x1),
                    "y": list(y1),
                },
                {
                    "x": list(x2),
                    "y": list(y2),
                },
            ],
        }



def main():
    options = _parse_args()

    pp = pprint.PrettyPrinter(indent=1, width=80)

    simple_pendulum = SimplePendulum()
    t = np.linspace(0, 10, 100)
    y0 = [.2, 0]
    simple_pendulum.solve(y0, t)
    simple_pendulum.save_to_json("Trajectories/Simple_Pendulum.js")

    double_pendulum = DoublePendulum()
    t = np.linspace(0, 20, 400)
    y0 = [np.pi/2, np.pi, 0, 0]
    double_pendulum.solve(y0, t)
    double_pendulum.save_to_json("Trajectories/Double_Pendulum.js")

    ball_in_cone = BallInCone()
    t = np.linspace(0, 20, 1000)
    y0 = [10, 0, 0, 5]
    ball_in_cone.solve(y0, t)
    ball_in_cone.save_to_json("Trajectories/Ball_in_Cone.js")


def _parse_args():
    """
    Parses the command line arguments.

    :return: Namespace with arguments.
    :rtype: Namespace
    """
    parser = argparse.ArgumentParser(description="")
    #parser.add_argument("args", metavar="N", type=str, nargs="*", help="Positional arguments.")
    #parser.add_argument("", dest="", type="", default=, help=)
    #parser.add_argument("--version", action="version", version="<the version>")

    return parser.parse_args()


if __name__ == "__main__":
    main()
