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

EXPOSE 5173

CMD /usr/bin/bash -lc '\
devMode="$(printf "%s" "${DEV_MODE:-false}" | tr "[:upper:]" "[:lower:]" | tr -d "\r")"; \
echo "Starting frontend (devMode=${devMode}, coverage=${COVERAGE:-false})"; \
npm ci && \
if [ "${devMode}" = "true" ]; then \
  echo "Mode: watch"; \
  npm run dev -- --host 0.0.0.0; \
else \
  echo "Mode: direct"; \
  npm run build && npm run preview -- --host 0.0.0.0 --port 5173; \
fi'
