FROM node:22-slim

COPY . /app
WORKDIR /app
RUN npm ci
