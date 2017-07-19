# pepper-server

Install virtualenv via pip:

$ pip install virtualenv


create virtual environment 

$ virtualenv env


Use a Python interpreter of your choice.

$ virtualenv -p /usr/bin/python2.7 env


To begin using the virtual environment, it needs to be activated:

$ source env/bin/activate


For virtualenv to install all files in the requirements.txt file.

$ pip install -r pip_requirements.txt 


Create the lambda server .ZIP file, by running the bash script

$ ./create_lambda_zip_package.bash 


Upload the TestLambda.zip file on AWS Lambda function in Python2.7 environment

## API definition at 
https://docs.google.com/document/d/1cQ32zTbE8sAQfVVsp6HpAvlPJySKl4PAObBqjY8BICw/edit?usp=sharing
