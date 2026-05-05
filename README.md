
---

# User and Company Management API

This is a REST API developed with **Node.js**, **Express**, and **MongoDB**. It manages the complete lifecycle of a user, including registration, email validation, company onboarding, and session management via JWT.

## Installation

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory and configure the following parameters:
   
```env
   PORT=3000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_access_token_secret
   JWT_REFRESH_SECRET=your_refresh_token_secret
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
   ```

3. **Testing Environment Setup:**
   To run tests, copy the example environment file and customize it:
   
```bash
   cp tests/setupEnv.example.js tests/setupEnv.js
   ```

4. **File System Preparation:**
   Create the folder for uploads:
   ```bash
   mkdir uploads
   ```

---

## Execution & Testing

### Development Mode
```bash
npm run dev
```

### Run Tests
To verify the logic in your controllers and check coverage:
```bash
# Run all tests
npm test

# Generate coverage report
npm run test:coverage
```
*Current Goal: 70% Statement and Branch coverage.*

---

## API Endpoints and Testing Order

Follow this specific order in Postman to ensure a successful testing flow.

### 1. Registration and Security
* **POST `/api/user/register`**: Creates a new account. The verification code is printed in the terminal.
* **PUT `/api/user/validation`**: Submit the 6-digit code to verify the email.
* **POST `/api/user/login`**: Authenticate and receive `accessToken` and `refreshToken`.

### 2. Onboarding (Requires JWT Token)
* **PUT `/api/user/register`**: Update personal profile data.
* **PATCH `/api/user/company`**: Register company details (First user becomes Admin).
* **PATCH `/api/user/logo`**: Upload the company logo (use `form-data` with key `logo`).

### 3. Management and Administration
* **GET `/api/user`**: Retrieve full user profile.
* **POST `/api/user/invite`**: Admin only. Invite members via email.
* **POST `/api/user/refresh`**: Refresh access token.
* **POST `/api/user/logout`**: Invalidate session.

### 4. Deletion (T6 Pattern)
* **DELETE `/api/user?soft=true`**: Logical delete (`deleted: true`).
* **DELETE `/api/user`**: Physical database removal.

### 5. Client Management
* **POST `/api/client`**: Create a new client profile.
* **GET `/api/client`**: List all clients associated with the company.
* **GET `/api/client/:id`**: Retrieve specific client details.
* **PUT `/api/client/:id`**: Update client information.
* **DELETE `/api/client/:id`**: Remove a client.

### 6. Project Management
* **POST `/api/project`**: Create a new project for a specific client.
* **GET `/api/project`**: List all company projects.
* **GET `/api/project/:id`**: Get detailed project information.
* **PATCH `/api/project/:id`**: Update project status or details.
* **DELETE `/api/project/:id`**: Remove a project.

### 7. Delivery Notes (Logistics)
* **POST `/api/deliverynote`**: Generate a new delivery note for a project.
* **GET `/api/deliverynote`**: Fetch all delivery notes.
* **GET `/api/deliverynote/:id`**: View a specific delivery note.
* **PUT `/api/deliverynote/:id`**: Edit delivery note details.
* **DELETE `/api/deliverynote/:id`**: Delete a delivery note.

---

## Technical Specifications
* **Authentication**: Stateless JWT implementation.
* **Event Driven**: Uses `EventEmitter` for post-registration logic.
* **File Handling**: `Multer` middleware for multipart/form-data.
* **Security**: Password hashing with `bcryptjs`.
* **Code Quality**: Testing suite with Istanbul/NYC coverage reporting.
```