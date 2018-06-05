
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import argparse
import collections
import hashlib
import os.path
import random
import re
import sys

import numpy as np
import tensorflow as tf

FLAGS = None

MAX_NUM_IMAGES_PER_CLASS = 2 ** 27 - 1  # ~134M




def main(_):
    file_name = FLAGS.name
    print("file name："+file_name)
    # We want to ignore anything after '_nohash_' in the file name when
    # deciding which set to put an image in, the data set creator has a way of
    # grouping photos that are close variations of each other. For example
    # this is used in the plant disease data set to group multiple pictures of
    # the same leaf.
    hash_name = re.sub(r'_nohash_.*$', '', file_name)
    # This looks a bit magical, but we need to decide whether this file should
    # go into the training, testing, or validation sets, and we want to keep
    # existing files in the same set even if more files are subsequently
    # added.
    # To do that, we need a stable way of deciding based on just the file name
    # itself, so we do a hash of that and then use that to generate a
    # probability value that we use to assign it.
    print ("hash_name:"+hash_name)
    hash_name_hashed = hashlib.sha1(tf.compat.as_bytes(hash_name)).hexdigest()
    print ("hash_name_hashed: "+str(hash_name_hashed))
    percentage_hash = ((int(hash_name_hashed, 16) %
                        (MAX_NUM_IMAGES_PER_CLASS + 1)) *
                       (100.0 / MAX_NUM_IMAGES_PER_CLASS))
    print ("percentage: "+str(percentage_hash))
    if percentage_hash < 10:
      print ("validation")
    elif percentage_hash < 20:
      print ("testing")
    else:
      print ("training")



if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument(
      '--name',
      type=str,
      default=".\\building_photos\\432 park avenue\cfv8.jpg",
      help='file name.'
  )
  FLAGS, unparsed = parser.parse_known_args()
  tf.app.run(main=main, argv=[sys.argv[0]] + unparsed)
