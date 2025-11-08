FROM node:24-slim

COPY . /app
WORKDIR /app
RUN npm ci
