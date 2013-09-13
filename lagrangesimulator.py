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


def main():
    options = _parse_args()

    pp = pprint.PrettyPrinter(indent=1, width=80)

    simple_pendulum = SimplePendulum()
    t = np.linspace(0, 5, 100)
    y0 = [.2, 0]

    simple_pendulum.solve(y0, t)
    simple_pendulum.save_to_json("Simple_Pendulum.js")


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
