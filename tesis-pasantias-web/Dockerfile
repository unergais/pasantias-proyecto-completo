Attaching to backend-1, frontend-1
frontend-1  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
frontend-1  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
frontend-1  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
frontend-1  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
frontend-1  | 10-listen-on-ipv6-by-default.sh: info: Enabled listen on IPv6 in /etc/nginx/conf.d/default.conf
frontend-1  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
frontend-1  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
frontend-1  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
frontend-1  | /docker-entrypoint.sh: Configuration complete; ready for start up
frontend-1  | 2025/11/05 03:22:26 [notice] 1#1: using the "epoll" event method
frontend-1  | 2025/11/05 03:22:26 [notice] 1#1: nginx/1.28.0
frontend-1  | 2025/11/05 03:22:26 [notice] 1#1: built by gcc 14.2.0 (Alpine 14.2.0) 
frontend-1  | 2025/11/05 03:22:26 [notice] 1#1: OS: Linux 6.8.0-85-generic
frontend-1  | 2025/11/05 03:22:26 [notice] 1#1: getrlimit(RLIMIT_NOFILE): 1048576:1048576
frontend-1  | 2025/11/05 03:22:26 [notice] 1#1: start worker processes
frontend-1  | 2025/11/05 03:22:26 [notice] 1#1: start worker process 30
frontend-1  | 2025/11/05 03:22:26 [notice] 1#1: start worker process 31
frontend-1  | 2025/11/05 03:22:26 [notice] 1#1: start worker process 32
frontend-1  | 2025/11/05 03:22:26 [notice] 1#1: start worker process 33
frontend-1  | 2025/11/05 03:22:26 [notice] 1#1: start worker process 34
frontend-1  | 2025/11/05 03:22:26 [notice] 1#1: start worker process 35
frontend-1  | 2025/11/05 03:22:26 [notice] 1#1: start worker process 36
frontend-1  | 2025/11/05 03:22:26 [notice] 1#1: start worker process 37
backend-1   | ⚠️  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217
backend-1   | Server listening 4000
# Frontend Dockerfile - build with Node, serve with nginx
FROM node:20-bullseye-slim AS build

WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy source and build
COPY . .
# Accept VITE build args and expose them as env so Vite picks them up during build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

RUN npm run build

FROM nginx:stable-alpine
# Remove default nginx index
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
