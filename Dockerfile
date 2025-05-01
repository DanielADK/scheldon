FROM node:22-alpine
LABEL authors="Daniel Adámek"
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]