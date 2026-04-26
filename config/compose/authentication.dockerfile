FROM ubuntu:26.04

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

RUN apt-get update \
  && apt-get install -y curl ca-certificates gnupg \
  && mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_24.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
  && apt-get update \
  && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD /usr/bin/bash -lc '\
coverage="$(printf "%s" "${COVERAGE:-false}" | tr "[:upper:]" "[:lower:]" | tr -d "\r")"; \
devMode="$(printf "%s" "${DEV_MODE:-false}" | tr "[:upper:]" "[:lower:]" | tr -d "\r")"; \
echo "Starting authentication server (coverage=${coverage}, devMode=${devMode})"; \
if [ "${coverage}" = "true" ]; then \
  echo "Mode: coverage"; \
  NODE_OPTIONS="--loader @istanbuljs/esm-loader-hook" node --import tsx src/authentication.server.ts; \
elif [ "${devMode}" = "true" ]; then \
  echo "Mode: watch"; \
  npm run watch -- src/authentication.server.ts; \
else \
  echo "Mode: direct"; \
  node --import tsx src/authentication.server.ts; \
fi'
