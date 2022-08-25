const express = require("express");
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");

// Import Routes
const authRoute = require("./routes/auth")
const postsRoute = require("./routes/posts")

const PORT = 4000;

const app = express();

dotenv.config()
// Connect to DB
mongoose.connect(process.env.DB_CONNECT)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully to DB!");
});

// Middlewares
app.use(express.json())

// Routes Middlewares
app.use('/api/user', authRoute)
// app.use('/api/posts', autenticateToken, postsRoute)

// function autenticateToken(req, res, next) {
//     const authHeader = req.headers['authorization']
//     if (authHeader === undefined) res.send(400)
//     const token = authHeader.split(' ')[1]
//     if (!token) res.status(401)

//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//         if (err) res.send(403)
//         req.user = user
//         next()
//     })
// }

app.listen(PORT, () => console.log(`Auth server Up and Running at ${PORT}`))