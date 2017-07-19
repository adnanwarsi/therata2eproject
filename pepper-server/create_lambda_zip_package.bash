#!/bin/bash

zip_file="TestLambda.zip"

# remove the zip file if it already exists
if [ -f $zip_file ] ; then
    rm $zip_file
fi

# add the site packages
cd env/lib/python2.7/site-packages/
zip -r9 ../../../../$zip_file *
cd  ../../../../

# add the redpepper library
zip -r9 $zip_file redpepper_utils

# add the main lambda function script
zip -g $zip_file lambda_function.py


