
This project runs an Express server that connects to MongoDB and serves lesson-related endpoints.

What you need
- Node.js and npm
- A MongoDB connection URL in `.env` as `DATABASE_URL` 
Quick start
1. From `MERN-Fullstack-Backend` run:

```powershell
npm install
node server.js
```

2. Server should log a MongoDB connection message and the listening port.

What the files do
- `server.js`: boots Express, enables `cors` and `morgan`, 
  connects to MongoDB, and mounts the routes.
- `routes/theroutes.js`:  accepts the `db` instances and returns a router mounted at `/lessons`.

Main endpoints (mounted at `/lessons`)
- `GET /` — list all lessons.
- `POST /` — add a lesson. Requires `subject`, `price`, and `icon` 
- `POST /order` — create an order (expects `parentName`, `phone`, `items`, `total`).
- `GET /order` lists the orders
- `PUT /:id` — update a lesson 


