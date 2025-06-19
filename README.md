# Real-Time Chat Application ✨

This is a full-stack real-time chat application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with additional support for real-time messaging via Socket.IO, caching with Redis, and state management using Recoil.

---

## 🚀 Features at a Glance

* **Real-time Messaging**: Instant message delivery using WebSockets (Socket.IO) for a fluid chat experience.
* **User Authentication**: Secure user registration and login to protect user data.
* **Persistent Chat History**: All messages are stored reliably in MongoDB, ensuring you never lose your conversations.
* **Redis Caching**: Enhances performance through efficient message delivery and potential session management.
* **Recoil State Management**: Provides predictable and efficient state management for a highly performant React frontend.
* **Group Chats**: (Optional, can be extended) Create and manage dynamic group conversations.
* **Private Chats**: Enjoy secure and seamless one-on-one messaging.
* **Responsive UI**: Optimized for various screen sizes, ensuring a great user experience on any device.

---

## 🛠️ Technologies Under the Hood

### Backend

* **Node.js**: The powerful JavaScript runtime environment.
* **Express.js**: A robust and flexible web application framework for Node.js.
* **MongoDB**: Our chosen NoSQL database for storing messages and user data efficiently.
* **Mongoose**: An elegant ODM (Object Data Modeling) library for MongoDB.
* **Socket.IO**: The go-to library for real-time, bidirectional event-based communication.
* **Redis**: An incredibly fast in-memory data store, leveraged for caching and Pub/Sub for Socket.IO.
* **JWT (JSON Web Tokens)**: For secure and stateless user authentication.
* **Bcrypt**: Used for strong password hashing, ensuring user password security.

### Frontend

* **React.js**: The leading JavaScript library for building interactive user interfaces.
* **Recoil**: A cutting-edge state management library tailored for React applications.
* **Axios**: A popular promise-based HTTP client for making efficient API requests.
* **Tailwind CSS**: A utility-first CSS framework for rapid and responsive UI development.

---

## 📦 Setup Procedure: Get Started!

Follow these simple steps to get the application up and running on your local machine.

### Prerequisites

Before you dive in, make sure you have the following essential tools installed:

* **Node.js & npm/yarn**: Download and install from [nodejs.org](https://nodejs.org/).
* **MongoDB**: Download and install from [mongodb.com](https://www.mongodb.com/try/download/community). Crucially, ensure your MongoDB server is running.
* **Redis**: Download and install from [redis.io](https://redis.io/download/). Verify that your Redis server is actively running.

    * **For macOS (using Homebrew):**
        ```bash
        brew install redis
        brew services start redis
        ```
    * **For Ubuntu/Debian:**
        ```bash
        sudo apt update
        sudo apt install redis-server
        sudo systemctl enable redis-server
        sudo systemctl start redis-server
        ```
    * **For Windows:**
        Follow the detailed instructions on the [Redis GitHub page](https://github.com/microsoftarchive/redis/releases).

### 1. Clone the Repository

First things first, grab a copy of this repository by cloning it to your local machine:

```bash
git clone https://github.com/Pikachu-345/real-time-chat
cd real-time-chat
```

### 2. Backend Setup 🧑‍💻

Navigate into the backend directory to set up the server:

```bash
cd server
```

#### Install Dependencies

Install all the necessary backend packages:

```bash
npm install
```

#### Environment Variables

Create a `.env` file in the `server` directory. This file will hold your sensitive configuration or can refer to `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chat_app
JWT_SECRET=your_jwt_secret_key
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

> - **MONGO_URI**: Your MongoDB connection string. If you're using MongoDB Atlas (cloud database), update this with your Atlas connection string. Otherwise, `mongodb://localhost:27017/chat_app` is standard for local MongoDB.
> - **JWT_SECRET**: Generate a strong, unique, and random string for signing your JSON Web Tokens.
> - **REDIS_HOST**: The host address for your Redis instance (typically `127.0.0.1` for local).
> - **REDIS_PORT**: The port your Redis server is listening on (default is `6379`).

#### Run the Backend

Kick off the backend server:

```bash
node index.js
```

The backend server will gracefully start and listen for requests on `http://localhost:8001` (or the custom port you specified in `.env`).

---

### 3. Frontend Setup 🖥️

Open a new terminal window or tab, and then navigate into the frontend directory:

```bash
cd ../client
```

#### Install Dependencies

Install all the required frontend packages:

```bash
npm install
```

#### Run the Frontend

Start the React development server:

```bash
npm run dev
```

The frontend application will typically open automatically in your default web browser at `http://localhost:5173` (or another available port assigned by Vite).

---

### 4. Open in Browser 🌐

With both your backend and frontend servers humming along, simply open your web browser and navigate to:

```
http://localhost:5173
```

You're all set! You should now be able to:

- ✅ Register a new user
- ✅ Securely log in
- ✅ Enjoy real-time chatting instantly!

---

🌟 **Happy Chatting!** 🌟  
We hope you enjoy building and using this application.