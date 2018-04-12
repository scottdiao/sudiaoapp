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
import datastore_api as dsa
from google.cloud import datastore


app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return "This is a building image recognition web service"

@app.route('/building_uri', methods=['POST'])
def building_uri():
    print("downloading........")
    if not request.json or not 'uri' in request.json:
        abort(400)
    urllib.request.urlretrieve(request.json['uri'], "./download.jpg")
    response = cnn.run_cnn("download.jpg")
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/building_file', methods=['POST'])
def building_file():
    f = request.files['file']
    print("filename"+f.filename)
    file_name = "./uploads/"+secure_filename(f.filename)
    f.save(file_name)
    response = cnn.run_cnn(file_name)
    os.remove(file_name)
    return response

@app.route('/building_list')
def list():
    ds = datastore.Client()
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
