from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from google.cloud import datastore

def load_building(ds, label):
   print ("load building"+label)
   query = ds.query(kind='Buildings')
   query.add_filter('name', '=', label)

   query_iter = query.fetch()
   for entity in query_iter:
      return entity;

def list_buildings(ds):
    query = ds.query(kind='Buildings')
    query_iter = query.fetch()
    result = []
    for entity in query_iter:
        result.append(entity)
    return result
