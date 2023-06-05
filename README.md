# Social-Media-API
## Description
This project is an API for a social media platform. It provides a set of endpoints to manage users, posts, comments, likes, and other social media-related functionalities. The API allows developers to integrate social media features into their applications.

Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Technologies](#technologies)

## Installation
1.Clone the repository: `git clone https://github.com/omkarvw/Social-Media-API`
2.Install dependencies: `npm install`

## Usage
1.Configure the environment variables:
  - Rename the `.env.example` file to `.env`.
  - Open the .env file and set the values for the required variables.
2.Start the server: `npm start`
3.The API will be available at `http://localhost:3000`. You can use tools like Postman or cURL to send requests to the API endpoints.

## API Endpoints
- `/api/v1/auth/register` (POST) : Register a new user.
- `/api/v1/auth/login` (POST) : Login for an existing user.
- `/api/v1/user` (GET) : Get own user profile.
- `/api/v1/user/follow/:id` (POST) : Follow user with id = `id`.
- `/api/v1/user/unfollow/:id` (POST) : Unfolllow user with id = `id`.
- `/api/v1/post/` (GET) : Get all posts
- `/api/v1/post/` (POST) : Create a post.
- `/api/v1/post/:id` (GET) : Get a single post.
- `/api/v1/post/id` (DELETE) : Delete a single post.
- `/api/v1/post/like/id` (POST) : Like post with id = `id`.
- `/api/v1/post/unlike/id` (POST) : Unlike post with id = `id`.
- `/api/v1/post/comment/:id` (POST) : Add comment to post with id = `id`.
- `/api/v1/user/followers/:id` (GET) : Get all followers of a user with user id = `id`
- `/api/v1/user/following/:id` (GET) : Get all followings of a user with user id = `id`
- `/api/v1/user/:id` (GET) : Get user with user id = `id`

## Technologies
- Node.js
- Express.js
- MongoDB 
- Mongoose (for MongoDB object modeling)
- JSON Web Tokens (JWT) (for authentication and authorization)
- bcrypt.js (for password hashing)
- dotenv (for environment variable management)


