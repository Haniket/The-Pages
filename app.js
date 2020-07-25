require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const ejs = require("ejs");
const mongoose = require('mongoose');
var flash = require('connect-flash');
var Cart = require('./cart.js');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const fs = require('fs')
const multer  = require('multer');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-find-or-create');
const nodemailer = require("nodemailer");
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(
sendgridTransport({
auth: {
  api_key:
  process.env.API_KEY,

},
})
);


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
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/thepagesDB", {useNewUrlParser: true,useUnifiedTopology: true});

const userSchema = new mongoose.Schema({

  Name : String,
  email: String,
  password: String,
  Phonenumber: Number,
  googleId:String,
  faecbookId:String
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

passport.use(new FacebookStrategy({
    clientID: process.env.CLIENT_ID1,
    clientSecret: process.env.CLIENT_SECRET1,
    callbackURL: "http://localhost:3000/auth/facebook/books",
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      if (err) { return done(err); }
      done(null, user)
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
  subject: String,
  BookName: String,
  Hostel: Number,
  Room: Number,
  bookImage: String,
  discountedPrice:Number,
  actualprice:Number
});

const Sell = mongoose.model("Sell", SellSchema);


const OtpSchema = new mongoose.Schema({
  otp: Number,
  user:String,

});

const Otp = mongoose.model("Otp",OtpSchema);





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

  app.get("/auth/facebook",
    passport.authenticate('facebook')
);

  app.get("/auth/facebook/books",
    passport.authenticate('faecbook', { failureRedirect: "/login" }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/books');
    });


// app.get("/verify",function(req,res){
//   Otp.findOne({user:req.body.username},function(err,results){
//     if(err){
//       console.log(err);
//     }
//     else{
//     console.log(results);
//     res.render("verify",{results:results});
//   }});
// });

app.post("/verify/:id",function(req,res){
  let otp = req.params.id;
  Otp.findOne({_id: otp},function(err,otpps){
    // console.log("in above otp"+otpps.otp);
    // console.log("in above verify"+req.body.OTP);
    if(err){
      console.log(err);
      // console.log(otpps.otp);
      // console.log(req.body.OTP);
      res.redirect("/signup");
    }else if(otpps.otp==req.body.OTP){
      // console.log("noterror"+otpps.otp);
      // console.log("noterr"+req.body.OTP);
      res.redirect("/books");

      Otp.deleteOne({_id: otp},function(err){
        if(err){
          console.log(err);
        }
      })
    }
    else if(otpps.otp!=req.body.OTP){
      Otp.deleteOne({_id: otp},function(err){
        if(err){
          console.log(err);
        }
      });
      User.deleteOne({username:otpps.user},function(err){
        if(err){
          console.log(err);
        }
      });
      req.flash('msg','wrong otp Please signup again');
      res.redirect("/signup");
    }
  })
})


app.get("/signup",function(req,res){
  res.render("signup",{msg:req.flash('msg')});
});

app.get("/signin",function(req,res){
res.render("signin",{alreadyexists:req.flash('alreadyexists')});
});

app.get("/books",function(req,res){

  if(req.isAuthenticated()){
    Sell.find({},function(err,founds){
      if(err){
        console.log(err);
      }else{
        res.render("books",{founds:founds,msg:req.flash('cartmsg')});
        // console.log(founds);
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
           // console.log(results);
        }
      });
  }else{
    res.redirect("/signup");
  }
});


app.post("/signup",function(req,res){
  var n = Math.random();
  n = n*8999;
  n = Math.floor(n)+1000;
var failure = "Please insert a valid Email address";
  User.register({ username: req.body.username , active: false}, req.body.password , function(err, user) {
    if (err){
      console.log(err);
      req.flash('alreadyexists','User already exists try Sign In');
      res.redirect("/signin");
    } else {
passport.authenticate("local")(req, res, function(){

  Otp.findOne({user:req.body.username},function(err,results){
    if(err){
      console.log(err);
    }
    else{
    // console.log(results);
    res.render("verify",{results:results});
  }});
// res.redirect("/verify");

return transporter.sendMail({
to: req.body.username,
from: '"The Pages" <developerteam2023@gmail.com>',
subject: "Sigup Successfully",
html: "<h2>Your Verification code:"+n+"<h2>",
});

});
    }
    const newOtp = new Otp({
      otp: n,
      user:req.body.username,

    });
    // console.log(req.body.username);


    newOtp.save();

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
  var success ="uploaded successfully";
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
  if(err) {
    console.log(err);
    res.render('upload', { success:"Oops its seems that you enter the wrong data type "});
  }

else {
res.render('upload', { success:success});
}
});
// var courseimage =newSeller.courseName;
// var discountedPrice =newSeller.discountedPrice;
// var actualPrice =newSeller.actualPrice;
});

app.get("/upload-book",function(req,res){
  res.render("upload-book",{success:''});
});

app.post("/upload-book",uploadBook,function(req,res){

var success = "Upload successfull See in book section your product added";
var newSell = new Sell({
Writer: req.body.WriterName,
Something: req.body.Something,
subject: req.body.subject,
BookName: req.body.BookName,
Hostel: req.body.Hostel,
Room : req.body.Room,
bookImage : req.file.filename,
discountedPrice:req.body.discountedPrice,
actualprice:req.body.actualprice,
});
newSell.save(function(err,found){
  if(err) {
    console.log(err);
    res.render('upload-book', { success:"ERROR OCCURED:it seems that you have not given the correct data-type"});
  };
res.render('upload-book', { success:success});
});

var bookImage = newSell.bookImage;
});

app.get("/faq",function(req,res){
  res.render("faq");
});



// app.route("/addtocart")
//
// .get(function(req,res){
//   res.render("addtocart",{
//   });
// });



app.get("/profile",function(req,res){
  res.render("profile");
})



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

app.route("/books/detailBooks/:detailBookId")

.get(function(req,res){
    var route = req.params.detailBookId;
    // console.log(route);
  Sell.findOne({_id:route},function(err,found){
    writer= found.Writer,
    something= found.Something,
    subject= found.subject,
    bookName= found.BookName,
    hostel= found.Hostel,
    room =found.Room,
    bookImage = found.bookImage,
    discountedPrice = found.discountedPrice,
    actualprice=found.actualprice

  res.render("detailBooks",{
    writer: writer,
    something: something,
    subject: subject,
    bookName: bookName,
    hostel: hostel,
    room : room,
    bookImage :bookImage,
    discountedPrice:discountedPrice,
    actualprice:actualprice,
  });
  // console.log(writer);
});
});

app.get("/safety",function(req,res){
  res.render("safety");
});




app.get('/add/:id', function(req, res, next) {
  Sell.find({_id:req.params.id},function(err,products){
  if(!err){console.log(products);
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  var product = products.filter(function(item) {
    return item._id == productId;
  });
  console.log(product);
  if(product){
  cart.add(product[0], productId);
  req.session.cart = cart;
  req.flash('cartmsg','added to cart')
  res.redirect('/books');
}};

});
});

app.get('/addtocart', function(req, res, next) {
  if (!req.session.cart) {
    return res.render('addtocart', {
      products: null

    });
  }
  var cart = new Cart(req.session.cart);
  console.log(cart.getItems());
  res.render('addtocart', {
    // title: 'NodeJS Shopping Cart',
    products: cart.getItems(),

    totalPrice: cart.totalPrice
  });
});

app.get('/remove/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.remove(productId);
  req.session.cart = cart;

  res.redirect('/addtocart');
});





app.listen(3000,function(){
 console.log("server is started on port 3000");
});
