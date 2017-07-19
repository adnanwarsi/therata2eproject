#!/bin/bash

zip_file="Lambda.zip"

# remove the zip file if it already exists
if [ -f $zip_file ] ; then
    rm $zip_file
fi

# add the redpepper library
zip -r9 $zip_file src
zip -r9 $zip_file node_modules
zip -r9 $zip_file DatabaseInFiles

# add the main lambda function script
zip -g $zip_file index.js


