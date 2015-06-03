#!/bin/bash

cd ontology
npm start &
PIDS[0]=$!
cd ../interoperability
npm start &
PIDS[1]=$!
cd ../code-repository
npm start &
PIDS[2]=$!
cd ../functionalities
npm start &
PIDS[3]=$!

trap "kill ${PIDS[*]}" SIGINT

wait