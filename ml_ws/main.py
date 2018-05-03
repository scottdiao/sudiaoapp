from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from flask import Flask, jsonify, request
from werkzeug import secure_filename
import urllib.request
import argparse
from flask_cors import CORS
import cnn
import numpy as np
import tensorflow as tf
import os
import uuid
import datastore_api as dsa
from google.cloud import datastore


app = Flask(__name__)
CORS(app)

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
    response = cnn.run_cnn("download.jpg")
    os.remove(encrypt_filename)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/building_file', methods=['POST'])
def building_file():
    f = request.files['file']
    uuid = request.form.get("uuid")
    file_name = "./uploads/"+uuid+secure_filename(f.filename)
    f.save(file_name)
    response = cnn.run_cnn(file_name)
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





if __name__ == '__main__':
    app.run(debug=True)
