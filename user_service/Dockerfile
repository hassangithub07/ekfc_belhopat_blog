# 1. Use Node.js as the base image
FROM node:22

# 2. Set a working directory inside the container
WORKDIR /app

# 3. Copy the app's dependencies files
COPY package*.json ./

# 4. Install the dependencies
RUN npm install

# 5. Copy the rest of the app's code
COPY . .

# 6. Expose the app's port
EXPOSE 4001

# 7. Command to run the app
CMD ["npm", "run", "dev"]