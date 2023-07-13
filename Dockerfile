FROM node:16.19.0

WORKDIR /workspace

COPY ./pnpm-lock.yaml ./

RUN npm install -g pnpm \
    && pnpm fetch

# 将整个项目复制下来
COPY . .

RUN pnpm -r install --offline

VOLUME ["workspace", "/workspace/node_modules/", "/workspace/backend/node_modules/", "/workspace/frontend/node_modules/", "/workspace/.pnpm-store/"]

# 启动admin项目的开发环境
CMD pnpm run start