FROM node:20-alpine

WORKDIR /app

# 1. Copy and install the shared folder
COPY shared /shared
RUN cd /shared && npm install

# 2. Copy backend config
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# 3. Link the shared types to the backend
RUN cd backend && npm link /shared

# 4. Copy everything else
COPY . .

WORKDIR /app/backend
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]