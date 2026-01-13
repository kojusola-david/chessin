# Dev notes: No idea how all this docker stuff works yet. Added to stuff I need to learn 😮‍💨

FROM node:20-slim

WORKDIR /app

# Copy package files from the backend directory
COPY backend/package*.json ./backend/

# Change directory to backend to install dependencies
WORKDIR /app/backend
RUN npm install

# Go back to /app and copy everything
WORKDIR /app
COPY . .

# Build from the backend directory
WORKDIR /app/backend
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]