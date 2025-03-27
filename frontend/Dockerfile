FROM node:20-alpine

# set the working directory
WORKDIR /app

# copy package files first
COPY package*.json ./

# install dependencies
RUN npm install

# remove package-lock.json to avoid conflicts
RUN rm -f package-lock.json

# copy the rest of the application
COPY . .

# expose port 3000
EXPOSE 3000

# start the development server
CMD ["npm", "start"] 