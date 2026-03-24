FROM node:20-alpine

WORKDIR /app
RUN corepack enable
COPY . /app
RUN pnpm install
CMD ["pnpm", "--filter", "web", "dev", "--hostname", "0.0.0.0"]
