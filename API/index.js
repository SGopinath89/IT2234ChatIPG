const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const cors = require("cors");
const User = require("./models/User");
const Session = require("./models/Session");

const mongoUrl = process.env.MONGO_URL;
const jwtSecret = process.env.JWT_SECRET;
const clientUrl = process.env.CLIENT_URL;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
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
      const session = await Session.findOne({ token }).populate('userId', 'Username');
      if (session) {
        req.user = session.userId; // Set the user data in the request object
        next(); // Call the next middleware or route handler
      } else {
        res.status(401).json('Invalid token');
      }
    } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json('Internal server error');
    }
  } else {
    res.status(401).json('No token provided');
  }
};

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.get('/profile', isLoggedIn, (req, res) => {
  res.json({ userId: req.user._id, username: req.user.Username });
});

app.get('/profile', async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    try {
      const session = await Session.findOne({ token }).populate('userId', 'Username'); // Populate the user data
      if (!session) {
        return res.status(401).json('Invalid token');
      }
      res.json({ userId: session.userId._id, username: session.userId.Username });
    } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json('Internal server error');
    }
  } else {
    res.status(401).json('No token provided');
  }
});

app.post("/login", async (req, res) => {
  const { Username, Password } = req.body;

  // Input validation
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
      }); // Session expires after 1 hour
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

app.post("/logout", (req, res) => {
  res.clearCookie("token", { sameSite: "none", secure: true });
  res.json({ message: "Logged out" });
});

app.listen(4040, () => {
  console.log("Server started on port 4040");
});
