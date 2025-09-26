# Movify

Movify is a Node.js and Express-based web application for managing a collection of movies. Users can add, edit, view, and delete movies, as well as upload images for each movie. The app uses EJS for server-side rendering and supports image uploads and form validation.

## Features
- Add, edit, and delete movies
- Upload and display movie images
- View detailed information for each movie
- Form validation for movie entries
- Responsive UI with EJS templates and custom CSS

## Folder Structure
```
app.js                # Main application entry point
models/               # Mongoose models for movies
routes/               # Express route handlers
views/                # EJS templates for UI
public/               # Static assets (CSS, JS, uploads)
uploads/              # Uploaded movie images
image/                # Sample images
```

## Installation
1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd Movify
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the application:
   ```sh
   node app.js
   ```
4. Open your browser and go to `http://localhost:3000` (or the port specified in your app)

## Dependencies
- Node.js
- Express
- EJS
- Mongoose
- Multer (for file uploads)

## Usage
- Add a new movie using the form on the homepage
- Edit or delete existing movies
- Upload images for each movie
- View movie details by clicking on a movie


