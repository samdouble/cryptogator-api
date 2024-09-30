#!/bin/bash

# wait to be able to access to at least one of the nodes of the replica-set
mongosh --nodb --eval '
var connection;
do {
  try {
    connection = new Mongo("mongo0:27017");
  } catch(Error) {
    sleep(1000);
  }
} while( !connection );'

# wait for replica-set setUp to finish
mongosh --host mongo0:27017 --eval '
var cfg = {
"_id": "rs0",
    "version": 1,
    "members": [
        {
            "_id": 0,
            "host": "mongo0:27017",
            "priority": 1
        },
        {
            "_id": 1,
            "host": "mongo1:27017",
            "priority": 0
        },
        {
            "_id": 2,
            "host": "mongo2:27017",
            "priority": 0
        }
    ],
};
rs.initiate(cfg);
while( !(rs.status().ok) ) {
  sleep(1000);
}'
