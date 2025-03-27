FROM python:3.12.7

# set the working directory
WORKDIR /code

# install dependencies
COPY ./requirements.txt ./
RUN pip install --upgrade pip
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# copy the api to the folder
COPY ./api ./api

ENV PYTHONPATH /code/api 