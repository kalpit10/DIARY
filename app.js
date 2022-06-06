//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport"); //For authentication
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const GoogleStrategy = require('passport-google-oauth20').Strategy;



const app = express();
app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded(
  {extended: true}));

  app.use(session({    //check documentation
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
  }));

  app.use(passport.initialize());  //we tell our app to initialize passport package
  app.use(passport.session());   //and to also use passport for dealing with the sessions


mongoose.connect("mongodb://localhost:27017/diaryDB", {useNewUrlParser: true});

// mongoose.connect("mongodb+srv://kalpit10:Nvidiagtx1650@cluster0.sqktt.mongodb.net/diaryDB?retryWrites=true&w=majority/", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({  //new definition because of mongoose encryption
  email: String,
  password: String,
  googleID: {
    type: String,
      require: true,
      index:true,
      unique:true,
      sparse:true
  }
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


passport.use(new GoogleStrategy({  //documentation for passportjs oauth20
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/diary"   //redirected url link that we created in credentials
  },
  function(accessToken, refreshToken, profile, cb){  //accessToken allows to get data related to that user,refreshToken allows to use the data for a longer period of time and their profile
          console.log(profile);
          //install and require find or create to make following function work
          User.findOrCreate({    //we first find the google id of that profile if it is there then bingo! if not then create one.
              googleId: profile.id,
              username: profile.displayName //changes here from udemy doubts section
          }, function(err, user){
              return cb(err, user);  //findOrCreate is a made up function made by passportjs and we will not be able to find the documentation for the same. there is a npm package so that this function works we need to install it.
          });
      }
  ));




const homeStartingContent = "HI GUYS! WELCOME TO YOUR PERSONAL DIARY! IF YOU WANT TO ADD SOME CONTENT IN IT CLICK ON COMPOSE BUTTON";
const aboutContent = "THIS IS OUR ABOUT PAGE";
const contactContent = "THIS IS OUR CONTACT PAGE";



const postSchema = { //schema to describe
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);//mongoose model


app.get("/", function(req, res){
  res.render("home");
});


app.get("/diary", function(req, res){

    Post.find({}, function(err, posts){ //We’ll need to find all the posts in the posts collection and render that in the home.ejs file.
      res.render("diary", {
        firstContent: homeStartingContent,
        posts: posts
      });
    });
});


app.get("/Compose", function(req, res){
  res.render("Compose");
});

//type of authentication is GoogleStrategy and scope tells us that we want user's profile
app.route("/auth/google")
  .get(passport.authenticate('google', { scope: ['profile']
  }));


app.get("/auth/google/diary",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect("/diary");
  });



app.post("/Compose", function(req, res){

const post = new Post({  //for taking both title and body in the command line, we created a js object
  title:req.body.postTitle,
  content:req.body.postBody,
});
  post.save(function(err){
    if(!err){
      res.redirect("/diary");
    }
  });
});



app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;//constant for storing postId parameter value

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content,
    });
  });
});


app.post("/delete", function(req,res){

const idDelete= req.body.button;
Post.findByIdAndRemove(idDelete,function(err){
  if(!err){
    console.log("successfully deleted");
  }
  res.redirect("/diary");
});

});



app.get("/about", function(req, res){
  res.render("about", {secondContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {thirdContent: contactContent});
});

app.get("/logout", function (req, res){
  req.session.destroy(function (err) {
    res.redirect("/"); //Inside a callback… bulletproof!
  });
});


app.post("/register", function(req, res){

User.register({username: req.body.username}, req.body.password, function(err, user){
  if(err){
    console.log(err);
    res.redirect("/");
  }else{
    passport.authenticate("local")(req, res, function(){ //type of authentication is local and callback function is triggerred when authentication is a success
      res.redirect("/diary");
    });
  }
}); //register method comes with passportLocalMongoose package.

});

app.post("/login", function(req, res){

const user = new User({
  username: req.body.username,
  password: req.body.password
});

req.login(user, function(err){
  if(err){
    console.log(err);
  }else{
    passport.authenticate("local")(req, res, function(){  //if we login successfully we are going to send the cookie and tell our browser to hold on to that cookie, cookie tells that user is authorized
      res.redirect("/diary");
    });
  }
});

});




// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 8000;
// }

app.listen(8000, function () {
  console.log("Server has started successfully.");
});
