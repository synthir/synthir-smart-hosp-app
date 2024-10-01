# Use an official node image as a base
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app for production
RUN npm run build


# Stage 2: Serve the React app with Nginx

# Nginx stage to serve the built app
FROM nginx:alpine


# Copy the built app to Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Custom Nginx configuration to handle client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port on which Nginx will run
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
