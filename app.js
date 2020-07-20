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
Email: String,
Password: String,
Phonenumber: Number
});


userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


var storage=multer.diskStorage({
destination:"./public/uploads/",
filename:(req,file,cb)=>{
cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));

}
});

var uploadImage=multer({
  storage:storage
}).single('courseImage');

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

// var imageData =.find({});


app.route("/")

.get(function(req,res){
res.render("home");
});




app.get("/signup",function(req,res){
  res.render("signup");
});


app.get("/books",function(req,res){

  if(req.isAuthenticated()){
    res.render("books");
  }else{
    res.redirect("/signup");
  }

})


app.post("/signup",function(req,res){

  User.register({Email: res.body.UserEmail}, res.body.UserPassword , function(err, user) {
    if (err){
      console.log(err);
      res.redirect("/signup");
    } else {
passport.authenticate("local")(req, res, function(){
  res.redirect("/books");
})
    }
});
});


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
// console.log(success);
// console.log(newSeller);
// console.log("course image name "+courseimage+" "+discountedPrice+" "+actualPrice);
});



app.get("/faq",function(req,res){
  res.render("faq");
});



app.route("/addtocart")

.get(function(req,res){
  res.render("addtocart",{
  });
});

app.get("/courses",function(req,res){
 Seller.find({},function(err,results){
if(err){
  console.log(err);
}
   else{
       res.render("courses",{results:results});
      // console.log(results);
   }
 })


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


app.get("/signin",function(req,res){
  res.render("signin");
});



app.get("/verify",function(req,res){
  res.render("verify");
});


app.listen(3000,function(){
 console.log("server is started on port 3000");

});
