# Dev Environment
This is the example on how to create a dev environment using Docker and Docker Compose

## Setup
We still need to install the vs code extension: Dev Containers
then we can press f1 and attach to running containers to install dev extensions
we will have a running linux machine and we can open our code navigating to the root and then click on the code folder

### Prerequisites

- Docker
- Docker Compose

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Run the Docker Compose file

### Usage

1. Access the API at `http://localhost:80`

### Commands

1. Build with Compose
```bash
docker-compose up --build -d
```
2. Stop the container
```bash
docker-compose down
```