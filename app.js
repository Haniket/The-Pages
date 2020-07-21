require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const fs = require('fs')
const multer  = require('multer');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-find-or-create');



var path=require('path');
const app = express();
var router=express.Router();

mongoose.set('useCreateIndex', true);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "ThePages gone wild.",
  resave: false,
  saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/thepagesDB", {useNewUrlParser: true,useUnifiedTopology: true});

const userSchema = new mongoose.Schema({

  Name : String,
  email: String,
  password: String,
  Phonenumber: Number,
  googleId:String
});



userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/books",
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



var storage=multer.diskStorage({
destination:"./public/uploads/",
filename:(req,file,cb)=>{
cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));

}
});

var uploadImage=multer({
  storage:storage
}).single('courseImage');

var uploadBook=multer({
  storage:storage
}).single('bookImage');


const SellerSchema = new mongoose.Schema({
InstructorName: String,
time: Number,
courseProvider:  String,
HostelNum: Number,
RoomNum: Number,
courseImage:String,
courseName:String,
discountedPrice:Number,
actualPrice:Number,
description:String,
});

const Seller = mongoose.model("Seller", SellerSchema);

const SellSchema =  new mongoose.Schema({
  Writer : String,
  Something: String,
  Subject: String,
  BookName: String,
  Hostel: Number,
  Room: Number,
  bookImage: String
});

const Sell = mongoose.model("Sell", SellSchema);


app.get(("/"),function(req,res){
res.render("home");
});


app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/books",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/books');
  });


app.get("/verify",function(req,res){
  res.render("verify");
});

app.get("/signup",function(req,res){
  res.render("signup");
});

app.get("/signin",function(req,res){
res.render("signin");
});

app.get("/books",function(req,res){

  if(req.isAuthenticated()){
    Sell.find({},function(err,founds){
      if(err){
        console.log(err);
      }else{
        res.render("books",{founds:founds});
        console.log(founds);
      }
    })
  }else{
    res.redirect("/signup");
  }

});

app.get("/courses",function(req,res){

  if(req.isAuthenticated()){
    Seller.find({},function(err,results){
     if(err){
       console.log(err);
     }
        else{
            res.render("courses",{results:results});
           console.log(results);
        }
      });
  }else{
    res.redirect("/signup");
  }
});


app.post("/signup",function(req,res){

  User.register({ username: req.body.username , active: false}, req.body.password , function(err, user) {
    if (err){
      console.log(err);
      res.redirect("/signup");
    } else {
passport.authenticate("local")(req, res, function(){
  res.redirect("/verify");
});
    }
});
});

app.post("/signin",function(req,res){

  const user = new User({
    username: req.body.username,
    password:  req.body.password
  });
  req.login(user, function(err){
    if(err){
      console.log(err);
      res.redirect("/signup");
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/");
    })
  }
  })

})

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
})

app.route("/upload")

.get(function(req,res){
  res.render("upload",{success:''});
});

app.post("/upload",uploadImage,function(req,res){
  var success =" uploaded successfully";
var newSeller= new Seller({
  InstructorName: req.body.InstructorName,
  time: req.body.time,
  courseProvider: req.body.courseProvider,
  HostelNum:req.body.HostelNum,
  RoomNum: req.body.RoomNum,
  courseImage:req.file.filename,
  courseName:req.body.courseName,
  discountedPrice:req.body.discountedPrice,
  actualPrice:req.body.actualPrice,
  description:req.body.description,
});
newSeller.save(function(err,result){
if(err) throw err;

res.render('upload', { success:success});

});
var courseimage =newSeller.courseName;
var discountedPrice =newSeller.discountedPrice;
var actualPrice =newSeller.actualPrice;
});

app.get("/upload-book",function(req,res){
  res.render("upload-book",{success:''});
});

app.post("/upload-book",uploadBook,function(req,res){

var success = "Upload successfull See in book section your product added";
var newSell = new Sell({
Writer: req.body.WriterName,
Something: req.body.Something,
Subject: req.body.subject,
BookName: req.body.BookName,
Hostel: req.body.Hostel,
Room : req.body.Room,
bookImage : req.file.filename
});
newSell.save(function(err,found){
if(err) throw err;

res.render('upload-book', { success:success});
});

var bookImage = newSell.bookImage;
});

app.get("/faq",function(req,res){
  res.render("faq");
});



app.route("/addtocart")

.get(function(req,res){
  res.render("addtocart",{
  });
});



app.route("/detailBooks")

.get(function(req,res){
  res.render("detailBooks");
});




app.route("/courses/detailcourses/:detailcoursesId")

.get(function(req,res){
    var route = req.params.detailcoursesId;
  Seller.findOne({_id:route},function(err,result){
  instructorName= result.InstructorName,
  time = result.time,
  courseProvider =result.courseProvider,
  hostelNum=  result.HostelNum,
  roomNum  =result.RoomNum,
  courseImage=  result.courseImage,
  courseName = result.courseName,
  discountedPrice=  result.discountedPrice,
  actualPrice = result.actualPrice,
  description=result.description,


  res.render("detailcourses",{
  instructorName:instructorName,
  hostelNum:hostelNum,
  courseImage:courseImage,
  courseName:courseName,
  discountedPrice:discountedPrice,
  description:description,
  });
});
});

app.get("/safety",function(req,res){
  res.render("safety");
});


app.listen(3000,function(){
 console.log("server is started on port 3000");
});
