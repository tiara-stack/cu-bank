FROM node:24-bookworm-slim

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node server.js ./
COPY --chown=node:node config/db.js ./config/db.js
COPY --chown=node:node controllers ./controllers
COPY --chown=node:node middleware ./middleware
COPY --chown=node:node models ./models
COPY --chown=node:node routes ./routes

ENV NODE_ENV=production
ENV PORT=4000
USER node
EXPOSE 4000
CMD ["node", "server.js"]
