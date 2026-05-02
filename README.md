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

3. **File System Preparation:**
   You must manually create the folder where logos will be stored for the upload middleware to function:
   ```bash
   mkdir uploads
   ```

## Execution

To start the server in development mode (using `nodemon`):

```bash
npm run dev
```
The server will be available at: `http://localhost:3000`

---

## API Endpoints and Testing Order

Follow this specific order in Postman to ensure a successful testing flow.

### 1. Registration and Security
* **POST `/api/user/register`**: Creates a new account. The verification code is printed in the **VS Code terminal**.
* **PUT `/api/user/validation`**: Submit the 6-digit code to verify the email.
* **POST `/api/user/login`**: Authenticate and receive `accessToken` and `refreshToken`.

### 2. Onboarding (Requires JWT Token)
* **PUT `/api/user/register`**: Update personal profile data (`name`, `lastName`, `nif`).
* **PATCH `/api/user/company`**: Register company details. The first user to register the company is assigned the **Admin** role.
* **PATCH `/api/user/logo`**: Upload the company logo using `form-data` with the key `logo`.

### 3. Management and Administration
* **GET `/api/user`**: Retrieve the full user profile with populated company information.
* **POST `/api/user/invite`**: Allows an **Admin** to invite new members via email.
* **POST `/api/user/refresh`**: Generate a new access token using the refresh token.
* **POST `/api/user/logout`**: Terminate the session and invalidate tokens.

### 4. Deletion (T6 Pattern)
* **DELETE `/api/user?soft=true`**: Performs a logical delete by setting `deleted: true`.
* **DELETE `/api/user`**: Performs a physical delete from the database.

---

## Technical Specifications
* **Authentication**: Stateless JWT implementation with Access and Refresh tokens.
* **Event Driven**: Uses `EventEmitter` to handle post-registration logic (e.g., logging verification codes).
* **File Handling**: `Multer` middleware for processing multipart/form-data.
* **Security**: Password hashing with `bcryptjs` and role-based access control (RBAC).
