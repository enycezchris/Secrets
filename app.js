//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require ("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// // mongoose-encryption
// const secret = "Thisisourlittlesecret." ;
// encrytpedFields: ---> encypts a certain field of the document
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"]});


const User = new mongoose.model("User", userSchema);

app.get("/", function(req,res){
  res.render("home");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.get("/register", function(req,res){
  res.render("register");
});

app.post("/register", function(req,res){
  const newUser = new User({
    // req.body.username will be equal to what the user inputs as username
    email: req.body.username,
    // req.body.password will be equal to the password inputted by user
    password: req.body.password
  });
  // .save() automatically encrypts
  newUser.save(function(err){
    if(err){
      console.log(err);
    } else {
      // if successfully logged in(no error) / or registered then render the secrets page
      res.render("secrets");
    }
  });
});

app.post("/login", function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  // searches through the User collection in DB to find matching username/email
  // .find() automatically decrypts
  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    } else {
      // if found matching User (foundUser) compare the password inputted to registered password
      if(foundUser) {
        if(foundUser.password === password) {
          res.render("secrets");
        }
      }
    }
  });
});

app.listen(3000, function(){
  console.log("Server is running on port 3000");
});
