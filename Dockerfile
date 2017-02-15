FROM ubuntu:16.04

MAINTAINER kivS

RUN apt-get -y update

RUN apt-get install -y curl

# Nodejs
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y build-essential

# Linux Graphical and sound libs
RUN apt-get -y install libgtk2.0-0 libxss1 libgconf-2-4 libnss3 libasound2 libxtst6
RUN apt-get install --no-install-recommends -y icnsutils graphicsmagick xz-utils

# Build for 32 bits support
RUN apt-get install --no-install-recommends -y icnsutils graphicsmagick xz-utils

# Wine 
RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:ubuntu-wine/ppa -y
RUN	apt-get update -y
RUN dpkg --add-architecture i386 && apt-get update
RUN apt-get install --no-install-recommends -y wine1.8

# Mono
RUN  apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
RUN echo "deb http://download.mono-project.com/repo/debian wheezy main" | tee /etc/apt/sources.list.d/mono-xamarin.list
RUN apt-get update -y
RUN apt-get install --no-install-recommends -y mono-devel ca-certificates-mono

