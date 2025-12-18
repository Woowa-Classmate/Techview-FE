# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build
WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install && \
    rm -rf node_modules package-lock.json && \
    npm install && \
    npm cache clean --force

# 소스 복사
COPY . .

# 환경변수
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false

# React 빌드
RUN npm run build

# 빌드 산출물 난독화
RUN npx --yes javascript-obfuscator dist/assets/*.js \
    --output dist/assets \
    --compact true \
    --control-flow-flattening true \
    --dead-code-injection true \
    --dead-code-injection-threshold 0.4 \
    --disable-console-output true \
    --identifier-names-generator mangled \
    --self-defending true \
    --string-array true \
    --string-array-encoding base64 \
    --string-array-threshold 0.75

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
