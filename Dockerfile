FROM node:7.4

MAINTAINER kivS

RUN apt-get -y update
RUN apt-get -y install libgtk2.0-0 libxtst6 libxss1 libgconf-2-4 libnss3 libasound2


