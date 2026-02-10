FROM oven/bun:1 AS base

WORKDIR /Bun-api

COPY package.json bun.lock
COPY . .

CMD ["bun", "run", "start"]










