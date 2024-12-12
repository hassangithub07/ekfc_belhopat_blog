# Blogging Platform with Real-Time Analytics

This project is a robust blogging platform built with **Node.js** and **Express**, featuring user and blog services with optional real-time analytics using **Socket.IO**. The services are containerized using **Docker**, providing a scalable and efficient architecture.

---

## Features

### Core Features
1. **User Service**:
   - User registration and login.
   - Profile update functionality.
2. **Blog Service**:
   - Create, read, update, and delete blog posts. Additionally like blog, comment blog with text message or image file, reply comments, like comments with user details in      pagination. Admin portal to monitor blog.
3. **Database**:
   - Choose between **MongoDB** for storage.
4. **Containerization**:
   - Dockerized microservices with seamless inter-service communication.
5. **Security**:
   - Secured API endpoints with **JWT Authentication**.
   - Input sanitization to prevent common vulnerabilities.
6. **API Documentation**:
   - Endpoints documented using tools like Postman for accessibility and ease of use.

### Optional Features
- **Real-Time Analytics Service**:
  - **Interest-Based Notifications**: Users receive real-time updates for new blog posts matching their interests categories.
  - **Admin Monitoring Dashboard**: List all the blogs and all user details with deleted blogs and deleted accounts as well.

---

## Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **Docker** and **Docker Compose**
- A database (**MongoDB**)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/hassangithub07/ekfc_belhopat_blog.git
   cd blogging-platform
   ```
2. Install dependencies for each service:
   ```bash
   cd user-service
   npm install
   cd ../blog-service
   npm install
   ```

### Environment Variables
Create `.env` files in the root directories of each service with the following variables:

**For User Service:**
```
PORT=4001
DATABASE_URL=<your_database_connection_string>
JWT_SECRET=<your_jwt_secret>
```

**For Blog Service:**
```
PORT=4101
DATABASE_URL=<your_database_connection_string>
JWT_SECRET=<your_jwt_secret>
```

### Run Locally
1. Start the User Service:
   ```bash
   cd user-service
   npm run dev
   ```
2. Start the Blog Service:
   ```bash
   cd blog-service
   npm run dev
   ```

### Run with Docker
1. Build and start all services:
   ```bash
   docker-compose up --build
   ```
2. Stop all services:
   ```bash
   docker-compose down
   ```

---

## Project Structure
```
ekfc_belhopat_blog/
|-- user-service/
|   |-- src/
|   |   |-- v1/
|   |   |   |-- config/
|   |   |   |-- constants/
|   |   |   |-- controllers/
|   |   |   |-- middlewares/
|   |   |   |-- models/
|   |   |   |-- routes/
|   |   |   |-- services/
|   |   |   |-- utils/
|   |   |   |-- validations/
|   |   |   |-- app.js
|   |   |   |-- index.js
|   |-- Dockerfile
|   |-- .gitignore
|-- blog-service/
|   |-- src/
|   |   |-- v1/
|   |   |   |-- config/
|   |   |   |-- constants/
|   |   |   |-- controllers/
|   |   |   |-- middlewares/
|   |   |   |-- models/
|   |   |   |-- routes/
|   |   |   |-- services/
|   |   |   |-- utils/
|   |   |   |-- validations/
|   |   |   |-- app.js
|   |   |   |-- index.js
|   |-- Dockerfile
|   |-- .gitignore
|-- docker-compose.yaml
```

---

## API Documentation
API documentation is available for all services.
- **Postman UI**:
- User Service - https://documenter.getpostman.com/view/40329071/2sAYHwJQCq
- Blog Service - https://documenter.getpostman.com/view/40329071/2sAYHwJQCx

Make sure to update Auth_token and Refresh_token of Blog Service collection once user logged in from User Service collection

---

## Notes
- Ensure you configure your `.env` files correctly for a smooth setup.
- Use environment variables for sensitive data.
- Focus on completing core features before adding optional functionality.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Acknowledgements
- Node.js and Express for the backend framework.
- MongoDB for data persistence.
- Docker for containerization.
- Socket.IO for real-time analytics.

---