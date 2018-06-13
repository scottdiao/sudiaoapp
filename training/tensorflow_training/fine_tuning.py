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
import tensorflow as tf
import tensorflow_hub as hub

FLAGS = None

MAX_NUM_IMAGES_PER_CLASS = 2 ** 27 - 1  # ~134M

# The location where variable checkpoints will be stored.
CHECKPOINT_NAME = '/tmp/_retrain_checkpoint'

def create_image_lists(image_dir, testing_percentage, validation_percentage):

  if not tf.gfile.Exists(image_dir):
    tf.logging.error("Image directory '" + image_dir + "' not found.")
    return None
  result = collections.OrderedDict()
  sub_dirs = sorted(x[0] for x in tf.gfile.Walk(image_dir))
  # The root directory comes first, so skip it.
  is_root_dir = True
  for sub_dir in sub_dirs:
    if is_root_dir:
      is_root_dir = False
      continue
    extensions = ['jpg', 'jpeg', 'JPG', 'JPEG']
    file_list = []
    dir_name = os.path.basename(sub_dir)
    if dir_name == image_dir:
      continue
    # tf.logging.info("Looking for images in '" + dir_name + "'")
    for extension in extensions:
      file_glob = os.path.join(image_dir, dir_name, '*.' + extension)
      file_list.extend(tf.gfile.Glob(file_glob))
    if not file_list:
      tf.logging.warning('No files found')
      continue
    if len(file_list) < 20:
      tf.logging.warning(
          'WARNING: Folder has less than 20 images, which may cause issues.')
    elif len(file_list) > MAX_NUM_IMAGES_PER_CLASS:
      tf.logging.warning(
          'WARNING: Folder {} has more than {} images. Some images will '
          'never be selected.'.format(dir_name, MAX_NUM_IMAGES_PER_CLASS))
    label_name = re.sub(r'[^a-z0-9]+', ' ', dir_name.lower())
    training_images = []
    testing_images = []
    validation_images = []
    for file_name in file_list:
      base_name = os.path.basename(file_name)
      hash_name = re.sub(r'_nohash_.*$', '', file_name)
      hash_name_hashed = hashlib.sha1(tf.compat.as_bytes(hash_name)).hexdigest()
      percentage_hash = ((int(hash_name_hashed, 16) %
                          (MAX_NUM_IMAGES_PER_CLASS + 1)) *
                         (100.0 / MAX_NUM_IMAGES_PER_CLASS))
      if percentage_hash < validation_percentage:
        validation_images.append(base_name)
      elif percentage_hash < (testing_percentage + validation_percentage):
        testing_images.append(base_name)
      else:
        training_images.append(base_name)
    result[label_name] = {
        'dir': dir_name,
        'training': training_images,
        'testing': testing_images,
        'validation': validation_images,
    }
  return result


def get_image_path(image_lists, label_name, index, image_dir, category):

  if label_name not in image_lists:
    tf.logging.fatal('Label does not exist %s.', label_name)
  label_lists = image_lists[label_name]
  if category not in label_lists:
    tf.logging.fatal('Category does not exist %s.', category)
  category_list = label_lists[category]
  if not category_list:
    tf.logging.fatal('Label %s has no images in the category %s.',
                     label_name, category)
  mod_index = index % len(category_list)
  base_name = category_list[mod_index]
  sub_dir = label_lists['dir']
  full_path = os.path.join(image_dir, sub_dir, base_name)
  return full_path

def ensure_dir_exists(dir_name):

  if not os.path.exists(dir_name):
    os.makedirs(dir_name)

def get_random_input(sess, image_lists, how_many, category,
                                  bottleneck_dir, image_dir, jpeg_data_tensor,
                                  decoded_image_tensor,
                                  module_name):

  class_count = len(image_lists.keys())
  tf.logging.debug("class_count"+str(class_count))
  resized_input = []
  ground_truths = []
  filenames = []
  if how_many >= 0:
    # Retrieve a random sample of bottlenecks.
    for unused_i in range(how_many):
      label_index = random.randrange(class_count)
      label_name = list(image_lists.keys())[label_index]
      image_index = random.randrange(MAX_NUM_IMAGES_PER_CLASS + 1)
      image_name = get_image_path(image_lists, label_name, image_index,
                                  image_dir, category)
      if not tf.gfile.Exists(image_name):
        tf.logging.fatal('File does not exist %s', image_name)
      image_data = tf.gfile.FastGFile(image_name, 'rb').read()
      resized_input_values = sess.run(decoded_image_tensor,
                                      {jpeg_data_tensor: image_data})
      tf.logging.debug("before squeeze"+str(resized_input_values.shape))
      resized_input_values = np.squeeze(resized_input_values)
      tf.logging.debug("after squeeze"+str(resized_input_values.shape))
      resized_input.append(resized_input_values)
      ground_truths.append(label_index)
      filenames.append(image_name)
  else:
    # Retrieve all bottlenecks.
    for label_index, label_name in enumerate(image_lists.keys()):
      for image_index, image_name in enumerate(
          image_lists[label_name][category]):
        image_name = get_image_path(image_lists, label_name, image_index,
                                    image_dir, category)
        if not tf.gfile.Exists(image_name):
          tf.logging.fatal('File does not exist %s', image_name)
        image_data = tf.gfile.FastGFile(image_name, 'rb').read()
        resized_input_values = sess.run(decoded_image_tensor,
                                        {jpeg_data_tensor: image_data})
        resized_input.append(resized_input_values)
        ground_truths.append(label_index)
        filenames.append(image_name)
  return resized_input, ground_truths, filenames

def get_test_input(sess, image_lists, label_i, how_many, category,
                                  bottleneck_dir, image_dir, jpeg_data_tensor,
                                  decoded_image_tensor,
                                  module_name):
  class_count = len(image_lists.keys())
  resized_input = []
  ground_truths = []
  filenames = []
  if how_many >= 0:
    # Retrieve a random sample of bottlenecks.
    for unused_i in range(how_many):
      label_index = label_i
      label_name = list(image_lists.keys())[label_index]
      image_index = random.randrange(MAX_NUM_IMAGES_PER_CLASS + 1)
      image_name = get_image_path(image_lists, label_name, image_index,
                                  image_dir, category)
      if not tf.gfile.Exists(image_name):
        tf.logging.fatal('File does not exist %s', image_name)
      image_data = tf.gfile.FastGFile(image_name, 'rb').read()
      resized_input_values = sess.run(decoded_image_tensor,
                                      {jpeg_data_tensor: image_data})
      resized_input_values = np.squeeze(resized_input_values)
      resized_input.append(resized_input_values)
      ground_truths.append(label_index)
      filenames.append(image_name)
  else:
    # Retrieve all bottlenecks.
    for label_index, label_name in enumerate(image_lists.keys()):
      for image_index, image_name in enumerate(
          image_lists[label_name][category]):
        image_name = get_image_path(image_lists, label_name, image_index,
                                    image_dir, category)
        if not tf.gfile.Exists(image_name):
          tf.logging.fatal('File does not exist %s', image_name)
        image_data = tf.gfile.FastGFile(image_name, 'rb').read()
        resized_input_values = sess.run(decoded_image_tensor,
                                        {jpeg_data_tensor: image_data})
        resized_input.append(resized_input_values)
        ground_truths.append(label_index)
        filenames.append(image_name)
  return resized_input, ground_truths, filenames

def get_input(sess, image_lists, label_name, label_index, category,
                                  bottleneck_dir, image_dir, jpeg_data_tensor,
                                  decoded_image_tensor,
                                  module_name):
  class_count = len(image_lists.keys())
  resized_input = []
  ground_truths = []
  filenames = []
    # Retrieve all bottlenecks.
  for image_index, image_name in enumerate(image_lists[label_name][category]):
    image_i = random.randrange(MAX_NUM_IMAGES_PER_CLASS + 1)
    image_name = get_image_path(image_lists, label_name, image_i, image_dir, category)
    if not tf.gfile.Exists(image_name):
      tf.logging.fatal('File does not exist %s', image_name)
    image_data = tf.gfile.FastGFile(image_name, 'rb').read()
    resized_input_values = sess.run(decoded_image_tensor,
                                        {jpeg_data_tensor: image_data})
    resized_input.append(resized_input_values)
    ground_truths.append(label_index)
    filenames.append(image_name)
  return resized_input, ground_truths, filenames

def variable_summaries(var):
  """Attach a lot of summaries to a Tensor (for TensorBoard visualization)."""
  with tf.name_scope('summaries'):
    mean = tf.reduce_mean(var)
    tf.summary.scalar('mean', mean)
    with tf.name_scope('stddev'):
      stddev = tf.sqrt(tf.reduce_mean(tf.square(var - mean)))
    tf.summary.scalar('stddev', stddev)
    tf.summary.scalar('max', tf.reduce_max(var))
    tf.summary.scalar('min', tf.reduce_min(var))
    tf.summary.histogram('histogram', var)


def add_retrain_ops(class_count, final_tensor_name,
                          module_spec, is_training):
  # with tf.device("/cpu:0"):
  height, width = hub.get_expected_image_size(module_spec)
  with tf.name_scope('input'):
    resized_input = tf.placeholder(
        tf.float32,
        shape=[None, height, width, 3],
        name='InputPlaceholder')

    ground_truth_input = tf.placeholder(
        tf.int64, [None], name='GroundTruthInput')
  # m = hub.Module(module_spec)
  m = hub.Module(module_spec, trainable=True, tags={'train'})
  bottleneck_tensor=m(resized_input)
  # bottleneck_tensor = m(tf.reshape(resized_input,[-1,299,299,3]))
  batch_size, bottleneck_tensor_size = bottleneck_tensor.get_shape().as_list()
  # Organizing the following ops so they are easier to see in TensorBoard.


  layer_name = 'final_retrain_ops'
  with tf.name_scope(layer_name):
    with tf.name_scope('weights'):
      initial_value = tf.truncated_normal(
          [bottleneck_tensor_size, class_count], stddev=0.001)
      layer_weights = tf.Variable(initial_value, name='final_weights')
      variable_summaries(layer_weights)

    with tf.name_scope('biases'):
      layer_biases = tf.Variable(tf.zeros([class_count]), name='final_biases')
      variable_summaries(layer_biases)

    with tf.name_scope('Wx_plus_b'):
      logits = tf.matmul(bottleneck_tensor, layer_weights) + layer_biases
      tf.summary.histogram('pre_activations', logits)

  final_tensor = tf.nn.softmax(logits, name=final_tensor_name)


  tf.summary.histogram('activations', final_tensor)

  # If this is an eval graph, we don't need to add loss ops or an optimizer.
  if not is_training:
    return None, None, bottleneck_input, ground_truth_input, final_tensor

  with tf.name_scope('cross_entropy'):
    cross_entropy_mean = tf.losses.sparse_softmax_cross_entropy(
        labels=ground_truth_input, logits=logits)

  tf.summary.scalar('cross_entropy', cross_entropy_mean)

  with tf.name_scope('train'):
    # optimizer = tf.train.GradientDescentOptimizer(FLAGS.learning_rate)
    train_step = tf.train.GradientDescentOptimizer(FLAGS.learning_rate).minimize(cross_entropy_mean)

  return (train_step, cross_entropy_mean, resized_input, ground_truth_input,
          final_tensor)


def add_evaluation_step(result_tensor, ground_truth_tensor):

  with tf.name_scope('accuracy'):
    with tf.name_scope('correct_prediction'):
      prediction = tf.argmax(result_tensor, 1)
      correct_prediction = tf.equal(prediction, ground_truth_tensor)
    with tf.name_scope('accuracy'):
      evaluation_step = tf.reduce_mean(tf.cast(correct_prediction, tf.float32))
      correct_count = tf.reduce_sum(tf.cast(correct_prediction, tf.float32))
  tf.summary.scalar('accuracy', evaluation_step)
  return evaluation_step, prediction, correct_prediction, correct_count


def run_final_eval(sess, module_spec, class_count, image_lists,
                   jpeg_data_tensor, decoded_image_tensor,
                   resized_image_tensor, evaluation_step, prediction):

  # (sess, resized_input, ground_truth_input, evaluation_step,
  #  prediction) = build_eval_session(module_spec, class_count)

  test_resized_input, test_ground_truth, test_filenames = (
      get_random_input(sess, image_lists, FLAGS.test_batch_size,
                                    'testing', FLAGS.bottleneck_dir,
                                    FLAGS.image_dir, jpeg_data_tensor,
                                    decoded_image_tensor,
                                    FLAGS.tfhub_module))
  train_resized_input, train_ground_truth, train_filenames = (
      get_random_input(sess, image_lists, FLAGS.train_batch_size,
                                    'training', FLAGS.bottleneck_dir,
                                    FLAGS.image_dir, jpeg_data_tensor,
                                    decoded_image_tensor,
                                    FLAGS.tfhub_module))
  valid_resized_input, valid_ground_truth, valid_filenames = (
      get_random_input(sess, image_lists, FLAGS.validation_batch_size,
                                    'validation', FLAGS.bottleneck_dir,
                                    FLAGS.image_dir, jpeg_data_tensor,
                                    decoded_image_tensor,
                                    FLAGS.tfhub_module))
  test_accuracy, predictions = sess.run(
      [evaluation_step, prediction],
      feed_dict={
          resized_input: test_resized_input,
          ground_truth_input: test_ground_truth
      })
  train_accuracy, train_predictions = sess.run(
      [evaluation_step, prediction],
      feed_dict={
          resized_input: train_resized_input,
          ground_truth_input: train_ground_truth
      })
  valid_accuracy, valid_predictions = sess.run(
      [evaluation_step, prediction],
      feed_dict={
          resized_input: valid_resized_input,
          ground_truth_input: valid_ground_truth
      })
  tf.logging.info('Final test accuracy = %.1f%% (N=%d)' %
                  (test_accuracy * 100, len(test_bottlenecks)))
  tf.logging.info('Final train accuracy = %.1f%% (N=%d)' %
                  (train_accuracy * 100, len(train_bottlenecks)))
  tf.logging.info('Final valid accuracy = %.1f%% (N=%d)' %
                  (valid_accuracy * 100, len(valid_bottlenecks)))

  if FLAGS.print_misclassified_test_images:
    tf.logging.info('=== MISCLASSIFIED TEST IMAGES ===')
    print("test_filenames size"+str(len(test_filenames)))
    for i, test_filename in enumerate(test_filenames):
      if predictions[i] != test_ground_truth[i]:
        tf.logging.info('%70s  %s' % (test_filename,
                                      list(image_lists.keys())[predictions[i]]))
    tf.logging.info('=== MISCLASSIFIED TRAIN IMAGES ===')
    for i, train_filename in enumerate(train_filenames):
      if train_predictions[i] != train_ground_truth[i]:
        tf.logging.info('%70s  %s' % (train_filename,
                                      list(image_lists.keys())[train_predictions[i]]))
    tf.logging.info('=== MISCLASSIFIED VALID IMAGES ===')
    for i, valid_filename in enumerate(valid_filenames):
      if valid_predictions[i] != valid_ground_truth[i]:
        tf.logging.info('%70s  %s' % (valid_filename,
                                      list(image_lists.keys())[valid_predictions[i]]))



def build_eval_session(module_spec, class_count):



def save_graph_to_file(graph, graph_file_name, module_spec, class_count):
  """Saves an graph to file, creating a valid quantized one if necessary."""
  sess, _, _, _, _= build_eval_session(module_spec, class_count)
  graph = sess.graph

  output_graph_def = tf.graph_util.convert_variables_to_constants(
      sess, graph.as_graph_def(), [FLAGS.final_tensor_name])

  with tf.gfile.FastGFile(graph_file_name, 'wb') as f:
    f.write(output_graph_def.SerializeToString())


def prepare_file_system():
  # Setup the directory we'll write summaries to for TensorBoard
  if tf.gfile.Exists(FLAGS.summaries_dir):
    tf.gfile.DeleteRecursively(FLAGS.summaries_dir)
  tf.gfile.MakeDirs(FLAGS.summaries_dir)
  if FLAGS.intermediate_store_frequency > 0:
    ensure_dir_exists(FLAGS.intermediate_output_graphs_dir)
  return


def add_jpeg_decoding(module_spec):

  input_height, input_width = hub.get_expected_image_size(module_spec)
  input_depth = hub.get_num_image_channels(module_spec)
  jpeg_data = tf.placeholder(tf.string, name='DecodeJPGInput')
  decoded_image = tf.image.decode_jpeg(jpeg_data, channels=input_depth)
  # Convert from full range of uint8 to range [0,1] of float32.
  decoded_image_as_float = tf.image.convert_image_dtype(decoded_image,
                                                        tf.float32)
  decoded_image_4d = tf.expand_dims(decoded_image_as_float, 0)
  resize_shape = tf.stack([input_height, input_width])
  resize_shape_as_int = tf.cast(resize_shape, dtype=tf.int32)
  resized_image = tf.image.resize_bilinear(decoded_image_4d,
                                           resize_shape_as_int)
  return jpeg_data, resized_image


def export_model(module_spec, class_count, saved_model_dir):

  # The SavedModel should hold the eval graph.
  sess, in_image, _, _, _, _ = build_eval_session(module_spec, class_count)
  graph = sess.graph
  with graph.as_default():
    inputs = {'image': tf.saved_model.utils.build_tensor_info(in_image)}

    out_classes = sess.graph.get_tensor_by_name('final_result:0')
    outputs = {
        'prediction': tf.saved_model.utils.build_tensor_info(out_classes)
    }

    signature = tf.saved_model.signature_def_utils.build_signature_def(
        inputs=inputs,
        outputs=outputs,
        method_name=tf.saved_model.signature_constants.PREDICT_METHOD_NAME)

    legacy_init_op = tf.group(tf.tables_initializer(), name='legacy_init_op')

    # Save out the SavedModel.
    builder = tf.saved_model.builder.SavedModelBuilder(saved_model_dir)
    builder.add_meta_graph_and_variables(
        sess, [tf.saved_model.tag_constants.SERVING],
        signature_def_map={
            tf.saved_model.signature_constants.
            DEFAULT_SERVING_SIGNATURE_DEF_KEY:
                signature
        },
        legacy_init_op=legacy_init_op)
    builder.save()


def main(_):
  # Needed to make sure the logging output is visible.
  # See https://github.com/tensorflow/tensorflow/issues/3047
  tf.logging.set_verbosity(tf.logging.INFO)

  if not FLAGS.image_dir:
    tf.logging.error('Must set flag --image_dir.')
    return -1

  # Prepare necessary directories that can be used during training
  prepare_file_system()

  # Look at the folder structure, and create lists of all the images.
  image_lists = create_image_lists(FLAGS.image_dir, FLAGS.testing_percentage,
                                   FLAGS.validation_percentage)
  class_count = len(image_lists.keys())
  if class_count == 0:
    tf.logging.error('No valid folders of images found at ' + FLAGS.image_dir)
    return -1
  if class_count == 1:
    tf.logging.error('Only one valid folder of images found at ' +
                     FLAGS.image_dir +
                     ' - multiple classes are needed for classification.')
    return -1

  # Set up the pre-trained graph.
  module_spec = hub.load_module_spec(FLAGS.tfhub_module)
  print ("module_spec"+str(module_spec))
  # Add the new layer that we'll be training.
  with tf.Graph().as_default() as graph:
    (train_step, cross_entropy, resized_input,
     ground_truth_input, final_tensor) = add_retrain_ops(
         class_count, FLAGS.final_tensor_name,
         module_spec, is_training=True)

  with tf.Session(graph=graph) as sess:
    # Initialize all weights: for the module to their pretrained values,
    # and for the newly added retraining layer to random initial values.
    init = tf.global_variables_initializer()
    sess.run(init)
    # Set up the image decoding sub-graph.
    jpeg_data_tensor, decoded_image_tensor = add_jpeg_decoding(module_spec)

    evaluation_step, prediction, correct_prediction, correct_count = add_evaluation_step(final_tensor, ground_truth_input)
    merged = tf.summary.merge_all()
    train_writer = tf.summary.FileWriter(FLAGS.summaries_dir + '/train',
                                         sess.graph)

    validation_writer = tf.summary.FileWriter(
        FLAGS.summaries_dir + '/validation')

    # Create a train saver that is used to restore values into an eval graph
    # when exporting models.
    train_saver = tf.train.Saver()

    # Run the training for as many cycles as requested on the command line.
    for i in range(FLAGS.how_many_training_steps):
      tf.logging.info(str(datetime.now()) + ":  mini batch step: "+str(i))
      (train_input,
      train_ground_truth, _) = get_random_input(
             sess, image_lists, FLAGS.train_batch_size, 'training',
             FLAGS.bottleneck_dir, FLAGS.image_dir, jpeg_data_tensor,
             decoded_image_tensor, FLAGS.tfhub_module)
      # Feed the bottlenecks and ground truth into the graph, and run a training
      # step. Capture training summaries for TensorBoard with the `merged` op.
      train_summary, _ = sess.run(
          [merged, train_step],
          feed_dict={resized_input: train_input,
                     ground_truth_input: train_ground_truth})
      train_writer.add_summary(train_summary, i)
      # Every so often, print out how well the graph is training.
      is_last_step = (i + 1 == FLAGS.how_many_training_steps)
      if (i % FLAGS.eval_step_interval) == 0 or is_last_step:
        train_accuracy, cross_entropy_value = sess.run(
            [evaluation_step, cross_entropy],
            feed_dict={resized_input: train_input,
                       ground_truth_input: train_ground_truth})
        tf.logging.info('%s: Step %d: Train accuracy = %.1f%%' %
                        (datetime.now(), i, train_accuracy * 100))
        tf.logging.info('%s: Step %d: Cross entropy = %f' %
                        (datetime.now(), i, cross_entropy_value))
        # TODO: Make this use an eval graph, to avoid quantization
        # moving averages being updated by the validation set, though in
        # practice this makes a negligable difference.
        validation_bottlenecks, validation_ground_truth, _ = (
            get_random_input(
                sess, image_lists, FLAGS.validation_batch_size, 'validation',
                FLAGS.bottleneck_dir, FLAGS.image_dir, jpeg_data_tensor,
                decoded_image_tensor, FLAGS.tfhub_module))
        # Run a validation step and capture training summaries for TensorBoard
        # with the `merged` op.
        validation_summary, validation_accuracy, validation_predictions = sess.run(
            [merged, evaluation_step, prediction],
            feed_dict={resized_input: validation_bottlenecks,
                       ground_truth_input: validation_ground_truth})
        tf.logging.info("validation_predictions"+str(validation_predictions))
        validation_writer.add_summary(validation_summary, i)
        tf.logging.info('%s: Step %d: Validation accuracy = %.1f%% (N=%d)' %
                        (datetime.now(), i, validation_accuracy * 100,
                         len(validation_bottlenecks)))


    # After training is complete, force one last save of the train checkpoint.

    print("********************************************evaluation*************************************************")

    totalCorrectCounts=0
    totalCounts=0
    for label_index, label_name in enumerate(image_lists.keys()):
      test_resized_input = []
      test_ground_truth = []
      test_filenames = []
      i=0
      for image_index, image_name in enumerate(image_lists[label_name]['testing']):
        i+=1
        totalCounts+=1
      #   image_name = get_image_path(image_lists, label_name, image_index, FLAGS.image_dir, 'testing')
      #   if not tf.gfile.Exists(image_name):
      #     tf.logging.fatal('File does not exist %s', image_name)
      #   image_data = tf.gfile.FastGFile(image_name, 'rb').read()
      #   resized_input_values = sess.run(decoded_image_tensor, {jpeg_data_tensor: image_data})
      #   # test_resized_input.append(resized_input_values)
      #   # test_ground_truth.append(label_index)
        test_filenames.append(image_name)
      test_resized_input, test_ground_truth, _ = (
          get_test_input(
              sess, image_lists, label_index, 1, 'testing',
              FLAGS.bottleneck_dir, FLAGS.image_dir, jpeg_data_tensor,
              decoded_image_tensor, FLAGS.tfhub_module))
      # test_resized_input, test_ground_truth, _ = (
      #     get_input(
      #         sess, image_lists, label_name, label_index, 'testing',
      #         FLAGS.bottleneck_dir, FLAGS.image_dir, jpeg_data_tensor,
      #         decoded_image_tensor, FLAGS.tfhub_module))
      test_accuracy, test_predictions, correct_counts = sess.run([evaluation_step, prediction, correct_count],
            feed_dict={
                resized_input: test_resized_input,
                ground_truth_input: test_ground_truth
            })
      totalCorrectCounts+=correct_counts
      tf.logging.info("*************************label_name: "+str(label_name)+"****************")
        # tf.logging.info("resized_input_values: "+str(test_resized_input))
      tf.logging.info("predictions: "+str(test_predictions))
      # tf.logging.info("test_resized_input: "+str(test_resized_input))
      tf.logging.info("truth: "+str(test_ground_truth))
      tf.logging.info('current test accuracy = %.3f%% (N=%d)' %
                          (test_accuracy*100, i))
      tf.logging.info("totalCorrectCounts: "+str(totalCorrectCounts))
      test_resized_input = []
      test_ground_truth = []
      test_filenames = []
      i=0
    final_test_accuracy = totalCorrectCounts/totalCounts
    tf.logging.info('final test accuracy = %.4f%% (N=%d)' %
                        (final_test_accuracy*100, totalCounts))
        # tf.logging.info("correct_predictions: "+str(correct_predictions))

      # for image_index, image_name in enumerate(image_lists[label_name]['testing']):
      #   i+=1
      #   tf.logging.info("interation: "+str(i))
      #
      #   image_name = get_image_path(image_lists, label_name, image_index, FLAGS.image_dir, 'testing')
      #   if not tf.gfile.Exists(image_name):
      #     tf.logging.fatal('File does not exist %s', image_name)
      #   image_data = tf.gfile.FastGFile(image_name, 'rb').read()
      #   resized_input_values = sess.run(decoded_image_tensor,
      #                                   {jpeg_data_tensor: image_data})
      #   test_resized_input.append(resized_input_values)
      #   test_ground_truth.append(label_index)
      #   test_filenames.append(image_name)
      #
      #   test_accuracy, test_predictions = sess.run(
      #           [evaluation_step, prediction],
      #       feed_dict={
      #           resized_input: test_resized_input,
      #           ground_truth_input: test_ground_truth
      #       })
      #   tf.logging.info("name: "+str(image_name))
      #   # tf.logging.info("resized_input_values: "+str(test_resized_input))
      #   tf.logging.info("predictions: "+str(test_predictions))
      #   tf.logging.info("truth: "+str(test_ground_truth))
      #   # tf.logging.info("correct_predictions: "+str(correct_predictions))
      #   test_resized_input = []
      #   test_ground_truth = []
      #   test_filenames = []
      #   # totalCorrectCounts+=correct_counts
      #   tf.logging.info("count: "+str(totalCorrectCounts))

    final_test_accuracy = 0
    for i in range(0,5):
        tf.logging.debug("test iteration: "+str(i))
        test_bottlenecks, test_ground_truth, _ = (
            get_random_input(
                sess, image_lists, 100, 'testing',
                FLAGS.bottleneck_dir, FLAGS.image_dir, jpeg_data_tensor,
                decoded_image_tensor, FLAGS.tfhub_module))
        # tf.logging.debug("test_bottlenecks shape "+str(test_bottlenecks.shape))
        # tf.logging.debug("test_bottlenecks reshape "+str(tf.shape(tf.reshape(test_bottlenecks,[-1,299,299,3]))))
        tf.logging.info("test_ground_truth: "+str(test_ground_truth))
        # tf.logging.info("test_bottlenecks: "+str(test_bottlenecks))
        test_accuracy, test_predictions = sess.run(
            [evaluation_step, prediction],
            feed_dict={resized_input: test_bottlenecks,
                       ground_truth_input: test_ground_truth})
        tf.logging.info("test_predictions: "+str(test_predictions))
        tf.logging.info('current test accuracy = %.3f%% (N=%d)' %
                            (test_accuracy*100, 100))
        final_test_accuracy+=test_accuracy
    final_test_accuracy = final_test_accuracy/50
    tf.logging.info('final_test_accuracy = %.3f%% (N=%d)' %
                        (final_test_accuracy*100, 100))

    train_saver.save(sess, CHECKPOINT_NAME)
    
    tf.logging.info('Save final result to : ' + FLAGS.output_graph)
    save_graph_to_file(graph, FLAGS.output_graph, module_spec, class_count)
    with tf.gfile.FastGFile(FLAGS.output_labels, 'w') as f:
      f.write('\n'.join(image_lists.keys()) + '\n')

    if FLAGS.saved_model_dir:
      export_model(module_spec, class_count, FLAGS.saved_model_dir)


if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument(
      '--image_dir',
      type=str,
      default='',
      help='Path to folders of labeled images.'
  )
  parser.add_argument(
      '--output_graph',
      type=str,
      default='../model/output_graph.pb',
      help='Where to save the trained graph.'
  )
  parser.add_argument(
      '--intermediate_output_graphs_dir',
      type=str,
      default='../model/intermediate_graph/',
      help='Where to save the intermediate graphs.'
  )
  parser.add_argument(
      '--intermediate_store_frequency',
      type=int,
      default=0,
      help="""\
         How many steps to store intermediate graph. If "0" then will not
         store.\
      """
  )
  parser.add_argument(
      '--output_labels',
      type=str,
      default='../model/output_labels.txt',
      help='Where to save the trained graph\'s labels.'
  )
  parser.add_argument(
      '--summaries_dir',
      type=str,
      default='../model/retrain_logs',
      help='Where to save summary logs for TensorBoard.'
  )
  parser.add_argument(
      '--how_many_training_steps',
      type=int,
      default=4000,
      help='How many training steps to run before ending.'
  )
  parser.add_argument(
      '--learning_rate',
      type=float,
      default=0.01,
      help='How large a learning rate to use when training.'
  )
  parser.add_argument(
      '--testing_percentage',
      type=int,
      default=10,
      help='What percentage of images to use as a test set.'
  )
  parser.add_argument(
      '--validation_percentage',
      type=int,
      default=10,
      help='What percentage of images to use as a validation set.'
  )
  parser.add_argument(
      '--eval_step_interval',
      type=int,
      default=10,
      help='How often to evaluate the training results.'
  )
  parser.add_argument(
      '--train_batch_size',
      type=int,
      default=10,
      help='How many images to train on at a time.'
  )
  parser.add_argument(
      '--test_batch_size',
      type=int,
      default=2,
      help="""\
      How many images to test on. This test set is only used once, to evaluate
      the final accuracy of the model after training completes.
      A value of -1 causes the entire test set to be used, which leads to more
      stable results across runs.\
      """
  )
  parser.add_argument(
      '--validation_batch_size',
      type=int,
      default=50,
      help="""\
      How many images to use in an evaluation batch. This validation set is
      used much more often than the test set, and is an early indicator of how
      accurate the model is during training.
      A value of -1 causes the entire validation set to be used, which leads to
      more stable results across training iterations, but may be slower on large
      training sets.\
      """
  )
  parser.add_argument(
      '--print_misclassified_test_images',
      default=False,
      help="""\
      Whether to print out a list of all misclassified test images.\
      """,
      action='store_true'
  )
  parser.add_argument(
      '--bottleneck_dir',
      type=str,
      default='/tmp/bottleneck',
      help='Path to cache bottleneck layer values as files.'
  )
  parser.add_argument(
      '--final_tensor_name',
      type=str,
      default='final_result',
      help="""\
      The name of the output classification layer in the retrained graph.\
      """
  )
  parser.add_argument(
      '--tfhub_module',
      type=str,
      default=(
          'https://tfhub.dev/google/imagenet/inception_v3/feature_vector/1'),
      help="""\
      Which TensorFlow Hub module to use.
      See https://github.com/tensorflow/hub/blob/master/docs/modules/image.md
      for some publicly available ones.\
      """)
  parser.add_argument(
      '--saved_model_dir',
      type=str,
      default='',
      help='Where to save the exported graph.')
  FLAGS, unparsed = parser.parse_known_args()
  tf.app.run(main=main, argv=[sys.argv[0]] + unparsed)
