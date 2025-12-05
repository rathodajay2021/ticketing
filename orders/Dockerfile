FROM node:alpine

RUN npm install -g pnpm

WORKDIR /app
COPY package.json .
RUN pnpm install
COPY . .

# normally it should be start but I am doing just for testing and development so dev:poll will do
CMD ["pnpm", "dev:poll"]