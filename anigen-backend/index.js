const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

console.log(process.env.DBURL);

mongoose
  .connect(process.env.DBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  avatarUrl: {
    type: String,
    default: "",
  },
  filename: {
    type: [String],
    default: ["default"],
  },
});
const User = new mongoose.model("User", userSchema);
//Routes
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log("Login");
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      if (password === user.password) {
        res.send({ message: "LogIn successful", user: user });
      } else {
        res.send({ message: "Password did not match", user: user });
      }
    } else {
      res.send({ message: "User not found", user: user });
    }
  });
});

app.get("/TTS/:email/filenames", (req, res) => {
  const email = req.params.email;
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      res.send({ filenames: user.filename });
    } else {
      res.send({ message: "User not found" });
    }
  });
});

app.get("/ThreeScene/:email/avatarurl", (req, res) => {
  const email = req.params.email;
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      res.send({ avatarurl: user.avatarUrl });
    } else {
      res.send({ message: "User not found" });
    }
  });
});

app.post("/TTS/:email", (req, res) => {
  const email = req.params.email;
  console.log(req.body);
  const { filename } = req.body;
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      user.filename.push(filename);
      user.save((err) => {
        if (err) {
          console.log(err);
          res.send({ message: "Error updating user" });
        } else {
          res.send({ message: "Filename added successfully" });
        }
      });
    } else {
      res.send({ message: "User not found" });
    }
  });
});

app.post("/avatar", (req, res) => {
  const { email, avatarUrl } = req.body;
  if (avatarUrl === "") {
    console.log("empty");
    res.send({ message: "Avatar URL is empty" });
  } else {
    console.log("Updating avatar for user with email:", email);
    console.log("New avatar URL:", avatarUrl);
    User.findOne({ email: email }, (err, user) => {
      if (user) {
        user.avatarUrl = avatarUrl;
        user.save((err) => {
          if (err) {
            console.log(err);
            res.send({ message: "Error updating user" });
          } else {
            res.send({ message: "Avatar URL updated successfully" });
          }
        });
      } else {
        res.send({ message: "User not found" });
      }
    });
  }
});

app.post("/r", (req, res) => {
  const { name, email, password } = req.body;
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      res.send({ message: "User already registered" });
    } else {
      const user = new User({
        name,
        email,
        password,
      });
      user.save((err) => {
        console.log(err);
        if (err) {
          res.send({ message: "Error" });
        } else {
          res.send({ message: "Successfully Registered" });
        }
      });
    }
  });
});

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log("Connected to port " + port);
});
