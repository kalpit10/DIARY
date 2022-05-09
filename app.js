//jshint esversion:6


require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const passport = require("passport"); //For authentication
const LocalStrategy = require("passport-local");//authenticates users using a username and password.
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const session = require("express-session");

const homeStartingContent = "HI GUYS! WELCOME TO YOUR PERSONAL DIARY! IF YOU WANT TO ADD SOME CONTENT IN IT CLICK ON COMPOSE BUTTON";
const aboutContent = "THIS IS OUR ABOUT PAGE";
const contactContent = "THIS IS OUR CONTACT PAGE";

const app = express();
app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

//app.use(
  //session({
    //secret: "node js mongodb",
    //resave: false,
    //saveUninitialized: false
  //})
//);

//app.use(passport.initialize());
//app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/diaryDB", {useNewUrlParser: true});

//mongoose.connect("mongodb+srv://kalpit10:Nvidiagtx1650@cluster0.sqktt.mongodb.net/diaryDB?retryWrites=true&w=majority/", {useNewUrlParser: true});


//const userSchema = new mongoose.Schema({
  //name: String,
  //password: String,
  //email: String
//});

//userSchema.plugin(passportLocalMongoose);
//userSchema.plugin(findOrCreate);


//const User = new mongoose.model("User", userSchema);

//passport.use(User.createStrategy());

//passport.serializeUser(function(User, done) {
  //  done(null, User.id);
//});

//passport.deserializeUser(function(id, done) {
  //  User.findById(id, function(err, User) {
    //    done(err, User);
    //});
//});

//passport.use(new LocalStrategy(passport.authenticate()));




//app.use(cookieParser());

//app.use(cookieSession({
//  name: 'session',
//  keys: [process.env.COOKIE_SECRET],

  // Cookie Options
//  maxAge: 24 * 60 * 60 * 1000 // 24 hours
//}))



const postSchema = { //schema to describe
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);//mongoose model

app.get("/", function(req, res){
  //res.render('register', {   //for showing login page
    //title: "Registeration Page",
    //name: "",
    //email: "",
    //password: ""
    //})
    Post.find({}, function(err, posts){ //We’ll need to find all the posts in the posts collection and render that in the home.ejs file.
      res.render("home", {
        firstContent: homeStartingContent,
        posts: posts
      });
    });
});








//Showing Secret Page
app.get("/home", function(req, res){
  res.render("home");
});


//Showing register form
//app.get("/register", function(req, res){
  //res.render("register");
//});

//Handling User Signup
//app.post("/register", function(req, res){

  //User.register({username: req.body.username}, req.body.password, function(err, user){
    //if (err) {
      //console.log(err);
      //res.redirect("/register");
    //} else {
      //passport.authenticate("local")(req, res, function(){
        //res.redirect("/home");
      //});
    //}
  //});

//});

//Showing Login form
//app.get("/login", function(req, res){
  //  res.render("login");
//});

//Handling User login
//app.post("/login", function(req, res){

  //const user = new User({
    //username: req.body.username,
    //password: req.body.password
  //});

  //req.login(user, function(err){
  //  if (err) {
    //  console.log(err);
    //} else {
      //passport.authenticate("local")(req, res, function(){
        //res.redirect("/home");
      //});
    //}
  //});

//});


//Handling User Logout
//app.get("/logout", function(req, res){
  //req.logout();
  //res.redirect("/");
//});



app.get("/Compose", function(req, res){
  res.render("Compose");
})

app.post("/Compose", function(req, res){

const post = new Post({  //for taking both title and body in the command line, we created a js object
  title:req.body.postTitle,
  content:req.body.postBody,
});
  post.save(function(err){
    if(!err){
      res.redirect("/");
    }
  });
});



app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;//constant for storing postId parameter value

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });
});


app.post("/delete", function(req,res){

const idDelete= req.body.button;
Post.findByIdAndRemove(idDelete,function(err){
  if(!err){
    console.log("successfully deleted");
  }
  res.redirect("/");
});

});



app.get("/about", function(req, res){
  res.render("about", {secondContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {thirdContent: contactContent});
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server has started successfully.");
});
