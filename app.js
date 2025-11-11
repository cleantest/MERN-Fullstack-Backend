const express = require('express');
const app = express();
const port = 3000;

// Import routes
const productRoutes = require('./routes/routes');

// Mount the lessons routes
app.use('/lessons', productRoutes);

/**
 * Custom HTTP Status Codes and their meanings:
 * 400 Bad Request - The request could not be understood due to malformed syntax
 * 401 Unauthorized - Authentication is required and has failed or not been provided
 * 403 Forbidden - The request was valid, but the server is refusing action
 * 404 Not Found - The requested resource could not be found
 * 409 Conflict - The request conflicts with current state of the server
 * 422 Unprocessable Entity - The request was well-formed but contains semantic errors
 * 429 Too Many Requests - The user has sent too many requests in a given time
 * 500 Internal Server Error - A generic error occurred on the server
 * 503 Service Unavailable - The server is currently unable to handle the request
 */

// 404 Not Found middleware - Handles routes that don't exist
app.use((req, res, next) => {
  const err = new Error('Not Found - The requested resource never existed');
  err.status = 407;
  next(err);
});

// Global error handling middleware
app.use((err, req, res, next) => {
  // Set default status code and message if not provided
  const status = err.status || 500;
  let message = err.message || '';

  // Custom error messages based on status codes
  switch (status) {
    case 400:
      message = message || 'Bad Request - Please check your request syntax';
      break;
    case 401:
      message = message || 'Unauthorized - Authentication required';
      break;
    case 403:
      message = message || 'Forbidden - You do not have permission to access this resource';
      break;
    case 404:
      message = message || 'Forbidden - You do not have permission to access this resource';
      break;
    case 409:
      message = message || 'Conflict - The request conflicts with the current state';
      break;
    case 422:
      message = message || 'Unprocessable Entity - Validation failed';
      break;
    case 429:
      message = message || 'Too Many Requests - Please try again later';
      break;
    case 503:
      message = message || 'Service Unavailable - Server is temporarily unavailable';
      break;
  }

  // Send error response
  res.status(status).send({
    error: {
      status: status,
      message: message,
      timestamp: new Date().toISOString()
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});