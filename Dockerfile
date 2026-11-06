FROM node:20-alpine
WORKDIR /app
COPY server.js ./
COPY public ./public
COPY tools ./tools
# /data gehört dem Benutzer node; ein neues benanntes Volume übernimmt diese Rechte
RUN mkdir -p /data && chown -R node:node /data
USER node
ENV PORT=8000 DATA_DIR=/data
EXPOSE 8000
CMD ["node", "server.js"]
