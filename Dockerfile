FROM node:18.15.0-slim

# install pnpm
RUN npm i -g pnpm@8.8.0

# prepare packages
COPY . /repo
WORKDIR /repo
RUN pnpm install

# set entrypoint
ENTRYPOINT ["pnpm"]

