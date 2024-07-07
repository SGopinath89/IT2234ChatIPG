const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const cors = require("cors");
const User = require("./models/User");
const Message = require("./models/message");
const Session = require("./models/Session");
const ws = require("ws");
const fs = require("fs");

const mongoUrl = process.env.MONGO_URL;
const jwtSecret = process.env.JWT_SECRET;
const clientUrl = process.env.CLIENT_URL;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use("/uploads", express.static(__dirname + "/Uploads"));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: clientUrl,
  })
);

app.use(express.json());

async function connectDB() {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  }
}

connectDB();

const isLoggedIn = async (req, res, next) => {
  const token = req.cookies?.token;
  if (token) {
    try {
      const session = await Session.findOne({ token }).populate(
        "userId",
        "Username"
      );
      if (session) {
        req.user = session.userId;
        next();
      } else {
        res.status(401).json("Invalid token");
      }
    } catch (error) {
      console.error("Database query error:", error);
      res.status(500).json("Internal server error");
    }
  } else {
    res.status(401).json("No token provided");
  }
};

async function getUserIdFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject("no token");
    }
  });
}

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  const userData = await getUserIdFromRequest(req);
  const ourUserId = userData.userId;
  const messages = await Message.find({
    sender: { $in: [userId, ourUserId] },
    recipient: { $in: [userId, ourUserId] },
  }).sort({ createdAt: 1 });
  res.json(messages);
});

app.get("/people", async (req, res) => {
  const users = await User.find({}, { _id: 1, Username: 1 });
  res.json(users);
});

app.get("/profile", isLoggedIn, (req, res) => {
  res.json({ userId: req.user._id, username: req.user.Username });
});

app.get("/profile", async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    try {
      const session = await Session.findOne({ token }).populate(
        "userId",
        "Username"
      );
      if (!session) {
        return res.status(401).json("Invalid token");
      }
      res.json({
        userId: session.userId._id,
        username: session.userId.Username,
      });
    } catch (error) {
      console.error("Database query error:", error);
      res.status(500).json("Internal server error");
    }
  } else {
    res.status(401).json("No token provided");
  }
});

app.post("/login", async (req, res) => {
  const { Username, Password } = req.body;

  if (!Username || !Password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const user = await User.findOne({ Username });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials." });
    }
    const passOk = bcrypt.compareSync(Password, user.Password);
    if (passOk) {
      const token = jwt.sign(
        { userId: user._id, Username: user.Username },
        jwtSecret,
        {}
      );
      const session = new Session({
        userId: user._id,
        token,
        expiresAt: new Date(Date.now() + 3600000),
      });
      await session.save();

      res
        .cookie("token", token, { sameSite: "none", secure: true })
        .status(200)
        .json({ id: user._id, Username: user.Username });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/register", async (req, res) => {
  const { Name, Email, Username, Password, EmplId } = req.body;

  if (!Name || !Email || !Username || !Password || !EmplId) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const hashedPassword = bcrypt.hashSync(Password, bcryptSalt);
    const createdUser = await User.create({
      Name: Name,
      Email: Email,
      Username: Username,
      Password: hashedPassword,
      EmplID: EmplId,
    });

    jwt.sign(
      { userId: createdUser.id, Username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({ id: createdUser._id });
      }
    );
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      res.status(400).json({ error: `${field} already exists.` });
    } else {
      console.error("Error during registration:", err);
      res.status(500).json({ error: "Internal server error." });
    }
  }
});

app.post("/logout", async (req, res) => {
  res
    .cookie("token", "", { sameSite: "none", secure: true })
    .json("Logged out");
});

const server = app.listen(4040);

const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  function notifyOnlinePeople() {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.userId,
            Username: c.Username,
          })),
        })
      );
    });
  }

  connection.isAlive = true;
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyOnlinePeople();
      console.log("dead");
    }, 1000);
  }, 5000);
  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const { userId, Username } = userData;
          connection.userId = userId;
          connection.Username = Username;
        });
      }
    }
  }
  connection.on("message", async (message) => {
    messageData = JSON.parse(message.toString());
    const { recipient, text, file } = messageData;
    let fileName = null;
    if (file) {
      const parts = file.name.split(".");
      const ext = parts[parts.length - 1];
      fileName = Date.now() + "." + ext;
      const pathName = __dirname + "/Uploads/" + fileName;
      const bufferData = new Buffer.from(file.data.split(",")[1], "base64");
      fs.writeFile(pathName, bufferData, () => {
        console.log("file saved: " + pathName);
      });
    }
    if (recipient && (text || file)) {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
        file: file ? fileName : null,
      });
      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              file: file ? fileName : null,
              _id: messageDoc._id,
            })
          )
        );
    }
  });
  notifyOnlinePeople();
});
