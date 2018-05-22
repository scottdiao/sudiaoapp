

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import argparse
import collections
from datetime import datetime
import hashlib
import os.path
import random
import re
import sys

import numpy as np

target_dir="./building_photos/validation_temp/"


def remove_file():
  for building_dir in os.listdir(target_dir):
      building_list = os.listdir(target_dir+building_dir)
      building_num = len(building_list)
      print(building_dir+str(building_num))
      for index, image in enumerate(building_list):
          if index > 20:
              print("removed"+image)
              os.remove(target_dir+building_dir+"/"+image)
remove_file()
