from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from flask import Flask, jsonify, request
from werkzeug import secure_filename
import urllib.request
from keras.models import load_model
from keras.preprocessing import image
from keras.applications.inception_v3 import preprocess_input
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import os, pickle, uuid, argparse
import datastore_api as dsa
from google.cloud import datastore


app = Flask(__name__)
CORS(app)
ds = datastore.Client('atomic-amulet-199016')
model_dir = './keras_model/inception_v3.h5'
model = load_model(model_dir)
graph = tf.get_default_graph()


@app.route('/')
def index():
    return "This is a building image recognition web service"

@app.route('/building_uri', methods=['POST'])
def building_uri():
    uri = request.json['uri']
    if(uri.endswith('.png')):
        filename='download.png'
    elif(uri.endswith('.bmp')):
        filename='download.bmp'
    elif(uri.endswith('.gif')):
        filename='download.gif'
    else:
        filename='download.jpg'
    encrypt_filename = "./uploads/"+str(uuid.uuid1())+filename
    if not request.json or not 'uri' in request.json:
        abort(400)
    urllib.request.urlretrieve(request.json['uri'], encrypt_filename)
    response = run_keras_cnn(encrypt_filename)
    os.remove(encrypt_filename)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/building_file', methods=['POST'])
def building_file():
    f = request.files['file']
    uuid = request.form.get("uuid")
    file_name = "./uploads/"+uuid+secure_filename(f.filename)
    f.save(file_name)
    response = run_keras_cnn(file_name)
    os.remove(file_name)
    return response

@app.route('/upload', methods=['POST'])
def upload():
    return "uploaded"

@app.route('/building_list')
def list():
    ds = datastore.Client('atomic-amulet-199016')
    buildings = dsa.list_buildings(ds)
    resjsonlist = []
    for b in buildings:
        resjson = {
            'name': b['name']
        }
        resjsonlist.append(resjson)
    response =  jsonify(resjsonlist)
    return response

def run_keras_cnn(file_name):
    img_width, img_height = 299, 299
    with open('./keras_model/class_dict.pkl', 'rb') as f:
        class_dict = pickle.load(f)
    x = image.load_img(file_name, target_size=(img_width, img_height))
    x = np.expand_dims(x, axis=0)
    x=x.astype("float32")
    x.setflags(write=1)
    x = preprocess_input(x)
    global graph
    with graph.as_default():
        preds = model.predict(x)
    preds = np.squeeze(preds)
    resjsonlist = []
    for i in top_k:
        label = class_dict[i].lower()
        entity = dsa.load_building(ds, label)
        resjson = {
            'label': label,
            'alias': entity['alias'],
            'place_id': entity['place_id'],
            'probability': str(preds[i])
        }
        resjsonlist.append(resjson)
        print(label, preds[i])
    response =  jsonify(resjsonlist)
    return response


if __name__ == '__main__':
    app.run(debug=False)
