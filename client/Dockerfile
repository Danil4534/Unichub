FROM node:18-alpine as build

WORKDIR /client
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine as production
COPY --from=build /client/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]