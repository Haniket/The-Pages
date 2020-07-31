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


mongoose.connect("mongodb+srv://admin-ayush:Team2023@cluster0.d7xf0.mongodb.net/thepagesDB?retryWrites=true&w=majority", {useNewUrlParser: true,useUnifiedTopology: true});

const userSchema = new mongoose.Schema({

  Name : String,
  email: String,
  password: String,
  Phonenumber: Number,
  googleId:String,
  faecbookId:String
});

const detailSchema = new mongoose.Schema({
  name:String,
  phonenumber:Number,
  email:String,
});

const Detail=mongoose.model("Detail",detailSchema)

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
    callbackURL: "https://tranquil-spire-40507.herokuapp.com/auth/google/books",
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// passport.use(new FacebookStrategy({
//     clientID: process.env.CLIENT_ID1,
//     clientSecret: process.env.CLIENT_SECRET1,
//     callbackURL: "http://localhost:3000/auth/facebook/books",
//   },
//   function(accessToken, refreshToken, profile, done) {
//     // console.log(profile);
//     User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//       if (err) { return done(err); }
//       done(null, user)
//     });
//   }
// ));

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
email:String,
name:String,
phonenumber:Number,
phonenumber1:Number,
name1:String
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
  actualprice:Number,
  email:String,
  name:String,
  phonenumber:Number,
  phonenumber1:Number,
  name1:String
});

const Sell = mongoose.model("Sell", SellSchema);


const OtpSchema = new mongoose.Schema({
  otp: Number,
  user:String,

});

const Otp = mongoose.model("Otp",OtpSchema);


// function findbook(search){
//    const regex = new RegExp(escapeRegex(search), 'gi');
//    Sell.find({ $or: [{BookName:regex},{subject:regex},{Writer:regex}]}, function(err, foundbook) {
//        if(err) {
//            console.log(err);
//        } else {
//          // res.render("books",{founds:foundbook})
//           console.log("i found "+foundbook);
//           return foundbook._id;
//         }})
//
//       }
// function detail(id){
//
// }



app.get(("/"),function(req,res){
//   console.log(req.query.search);
//   if (req.query.search) {
//   var found= findbook(req.query.search);
//   console.log("in get"+found);
// }
 id=Object.freeze(req.flash('id'))
// console.log("123"+req.session.name);
 // console.log("1"+req.session.email);
Detail.findOne({email:req.session.email},function(err,detail){
  if(err){
    console.log(err);
  }
  else{
    if(detail){
    var letter=detail.name.charAt(0);
    var upperLetter=letter.toUpperCase();
    // console.log(upperLetter);
    res.render("home",{detail:detail,upperLetter:upperLetter})
    // console.log("12"+detail);
  }
  else{
    // console.log("10"+detail);
    res.render("home",{detail:""});}
  }
})
// res.render("home")

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
      Otp.deleteOne({_id: otp},function(err){
        if(err){
          console.log(err);
        }
      });
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
  Detail.findOne({email:req.session.email},function(err,detail){
    if(err){
      console.log(err);
    }
    else{
      if(detail){
        var letter=detail.name.charAt(0);
        var upperLetter=letter.toUpperCase();
  res.render("signup",{msg:req.flash('msg'),detail:detail,upperLetter:upperLetter,forgetpassword:req.flash('forgetpassword')});

      // console.log("signup"+detail);
    }
    else{
      // console.log("signup1"+detail);
res.render("signup",{msg:req.flash('msg'),forgetpassword:req.flash('forgetpassword'),detail:""});
    }
    }
  })

});

app.get("/signin",function(req,res){
  Detail.findOne({email:req.session.email},function(err,detail){
    if(err){
      console.log(err);
    }
    else{
      if(detail){
        var letter=detail.name.charAt(0);
        var upperLetter=letter.toUpperCase();
        res.render("signin",{alreadyexists:req.flash('alreadyexists'),detail:detail,upperLetter:upperLetter});
      // console.log("signin"+detail);
    }
    else{
      // console.log("signin1"+detail);
res.render("signin",{alreadyexists:req.flash('alreadyexists'),detail:""});
    }
    }
  })
});

app.get("/books",function(req,res){


    if(req.query.searchBook){
    const regex = new RegExp(escapeRegex(req.query.searchBook), 'gi');
    Sell.find({ $or: [{BookName:regex},{subject:regex},{Writer:regex}]}, function(err, founds) {
        if(err) {
            console.log(err);
        } else {
          if(founds.lenght<1){
          }
          else{
            // console.log("i found book "+founds);
            Detail.findOne({email:req.session.email},function(err,detail){
              if(err){
                console.log(err);
              }
              else{
                if(detail){
                  var letter=detail.name.charAt(0);
                  var upperLetter=letter.toUpperCase();
                    res.render("books",{founds:founds,msg:req.flash('cartmsg'),qty:req.flash('cartqty'),detail:detail,upperLetter:upperLetter});
                // console.log("signin"+detail);
              }
              else{
                // console.log("signin1"+detail);
          res.render("books",{founds:founds,msg:req.flash('cartmsg'),qty:req.flash('cartqty'),detail:""});
              }
              }
            });

          }
          // res.render("books",{founds:foundbook})

         }});}
         else{
    Sell.find({},function(err,founds){
      if(err){
        console.log(err);
      }else{
        Detail.findOne({email:req.session.email},function(err,detail){
        if(err){
          console.log(err);
        }
        else{
          if(detail){
            var letter=detail.name.charAt(0);
            var upperLetter=letter.toUpperCase();
              res.render("books",{founds:founds,msg:req.flash('cartmsg'),qty:req.flash('cartqty'),detail:detail,upperLetter:upperLetter});
          // console.log("signin"+detail);
        }
        else{
          // console.log("signin1"+detail);
    res.render("books",{founds:founds,msg:req.flash('cartmsg'),qty:req.flash('cartqty'),detail:""});
        }
        }
      });
        // res.render("books",{founds:founds,msg:req.flash('cartmsg'),qty:req.flash('cartqty'),detail:""});
        // console.log(founds);
      }
    })}

  }
);

app.get("/courses",function(req,res){
    if(req.query.searchCourse){
    const regex = new RegExp(escapeRegex(req.query.searchCourse), 'gi');
    Seller.find({ $or: [{courseName:regex},{courseProvider:regex},{InstructorName:regex}]}, function(err, results) {
        if(err) {
            console.log(err);
        } else {
          if(results.lenght<1){

          }
          else{
            // console.log("i found course "+results);
            Detail.findOne({email:req.session.email},function(err,detail){
            if(err){
              console.log(err);
            }
            else{
              if(detail){
                var letter=detail.name.charAt(0);
                var upperLetter=letter.toUpperCase();
                  res.render("courses",{results:results,msg:req.flash('cartmsg'),qty:req.flash('cartqty'),detail:detail,upperLetter:upperLetter});
              // console.log("signin"+detail);
            }
            else{
              // console.log("signin1"+detail);
          res.render("courses",{results:results,msg:req.flash('cartmsg'),qty:req.flash('cartqty'),detail:""});
            }
            }
          });

          }


         }});}
         else{
    Seller.find({},function(err,results){
     if(err){
       console.log(err);
     }
        else{
          Detail.findOne({email:req.session.email},function(err,detail){
          if(err){
            console.log(err);
          }
          else{
            if(detail){
              var letter=detail.name.charAt(0);
              var upperLetter=letter.toUpperCase();
                res.render("courses",{results:results,msg:req.flash('cartmsg'),qty:req.flash('cartqty'),detail:detail,upperLetter:upperLetter});
            // console.log("signin"+detail);
          }
          else{
            // console.log("signin1"+detail);
        res.render("courses",{results:results,msg:req.flash('cartmsg'),qty:req.flash('cartqty'),detail:""});
          }
          }
        });

            // res.render("courses",{results:results,msg:req.flash('cartmsg'),qty:req.flash('cartqty'),detail:""});

        }
      });
  }
  }
);


app.post("/signup",function(req,res){
  var n = Math.random();
  n = n*8999;
  n = Math.floor(n)+1000;

var failure = "Please insert a valid Email address";
const newDetail=new Detail({
  name:req.body.NameUser,
  phonenumber:req.body.UserPhone,
  email:req.body.username,
});
newDetail.save();
  User.register({ username: req.body.username , active: false}, req.body.password , function(err, user) {
    if (err){
      console.log(err);
      req.flash('alreadyexists','User already exists try Sign In');
      res.redirect("/signin");
    } else {
passport.authenticate("local")(req, res, function(){
  var output = `
  <h2>Hi`+ ` `+ req.body.NameUser +`!</h2>
  <h3>Your Verifcation code is: `+n+`</h3>
  <h4>Thanks for Visting</h4>
  <p>Have a Good Day!</p>
  `;
  Otp.findOne({user:req.body.username},function(err,results){
    if(err){
      console.log(err);
    }
    else{
    // console.log(results);
    res.render("verify",{results:results,detail:""});
  }});
// res.redirect("/verify");

return transporter.sendMail({
to: req.body.username,
from: '"The Pages" <developerteam2023@gmail.com>',
subject: "Verification",
html: output,
});

});
    }
    const newOtp = new Otp({
      otp: n,
      user:req.body.username,

    });

    newOtp.save();
    // var name=req.body.NameUser;
    req.session.email=req.body.username;
    // req.session.name=req.body.NameUser;
    // req.session.phonenumber=req.body.UserPhone;

});



});

app.get("/forget",function(req,res){
  Detail.findOne({email:req.session.email},function(err,detail){
  if(err){
    console.log(err);
  }
  else{
    if(detail){
      var letter=detail.name.charAt(0);
      var upperLetter=letter.toUpperCase();
        res.render("forget",{detail:detail,upperLetter:upperLetter});

    // console.log("signin"+detail);
  }else{
    // console.log("signin1"+detail);
  res.render("forget",{detail:""});
  }
}});

});

app.post("/forget",function(req,res){
  User.findOneAndRemove({username:req.body.email1},function(err,proresults){
if(err){
  req.flash('forgetpassword','There is no email present in our Database');
  res.redirect("/signup");
  console.log(err);
} else{
req.flash('forgetpassword','Please signup with this email once again account deleted from our database');
res.redirect("/signup");
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

        req.session.email=req.body.username;
        res.redirect("/");

    })
  }
  })

})

app.get("/logout",function(req,res){
  req.logout();
  req.session.destroy();
  res.redirect("/");
})



app.get("/upload",function(req,res){
  if(req.isAuthenticated()){
  Detail.findOne({email:req.session.email},function(err,detail){
  if(err){
    console.log(err);
  }
  else{
    if(detail){
      var letter=detail.name.charAt(0);
      var upperLetter=letter.toUpperCase();
        res.render("upload",{success:'',detail:detail,upperLetter:upperLetter});

    // console.log("signin"+detail);
  }else{
    // console.log("signin1"+detail);
  res.render("upload",{success:'',detail:""});
  }
  }})}else{
    res.redirect("/signup");
  }
});

;

app.post("/upload",uploadImage,function(req,res){
  var success ="uploaded successfully";
  Detail.findOne({email:req.session.email},function(err,detail){
  if(err){
    console.log(err);
  }
  else{
    if(detail){
      // console.log("welcome"+detail.name);
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
        email:req.session.email,
        name:detail.name,
        // name1:req.body.name1,
        phonenumber:detail.phonenumber,
        // phonenumber1:req.body.phonenumber1
      });
      newSeller.save(function(err,result){
        if(err) {
          console.log(err);
          Detail.findOne({email:req.session.email},function(err,detail){
          if(err){
            console.log(err);
          }
          else{
            if(detail){
              var letter=detail.name.charAt(0);
              var upperLetter=letter.toUpperCase();
                res.render('upload', { success:"Oops its seems that you enter the wrong data type ",detail:detail,upperLetter:upperLetter});

            // console.log("signin"+detail);
          }
          else{
            // console.log("signin1"+detail);
            res.render('upload', { success:"Oops its seems that you enter the wrong data type ",detail:""});
          }
          }
        });

        }

      else {
        Detail.findOne({email:req.session.email},function(err,detail){
        if(err){
          console.log(err);
        }
        else{
          if(detail){
            var letter=detail.name.charAt(0);
            var upperLetter=letter.toUpperCase();
            res.render('upload', { success:success,detail:detail,upperLetter:upperLetter});
          // console.log("signin"+detail);
        }
        else{
          // console.log("signin1"+detail);
          res.render('upload', { success:success,detail:""});
        }
        }
      });


      }
      });
  }
else{
  console.log(req.body.name1);
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
    email:req.session.email,
    // name:detail.name,
    name1:req.body.name1,
    // phonenumber:detail.phonenumber,
    phonenumber1:req.body.phonenumber1
  });
  newSeller.save(function(err,result){
    if(err) {
      console.log(err);
      Detail.findOne({email:req.session.email},function(err,detail){
      if(err){
        console.log(err);
      }
      else{
        if(detail){
          var letter=detail.name.charAt(0);
          var upperLetter=letter.toUpperCase();
            res.render('upload', { success:"Oops its seems that you enter the wrong data type ",detail:detail,upperLetter:upperLetter});

        // console.log("signin"+detail);
      }
      else{
        // console.log("signin1"+detail);
        res.render('upload', { success:"Oops its seems that you enter the wrong data type ",detail:""});
      }
      }
    });

    }

  else {
    Detail.findOne({email:req.session.email},function(err,detail){
    if(err){
      console.log(err);
    }
    else{
      if(detail){
        var letter=detail.name.charAt(0);
        var upperLetter=letter.toUpperCase();
        res.render('upload', { success:success,detail:detail,upperLetter:upperLetter});
      // console.log("signin"+detail);
    }
    else{
      // console.log("signin1"+detail);
      res.render('upload', { success:success,detail:""});
    }
    }
  });


  }
  });

}


  }
});

// var courseimage =newSeller.courseName;
// var discountedPrice =newSeller.discountedPrice;
// var actualPrice =newSeller.actualPrice;
});

app.get("/upload-book",function(req,res){
  if(req.isAuthenticated()){
  Detail.findOne({email:req.session.email},function(err,detail){
  if(err){
    console.log(err);
  }
  else{
    if(detail){
      var letter=detail.name.charAt(0);
      var upperLetter=letter.toUpperCase();
        res.render("upload-book",{success:'',detail:detail,upperLetter:upperLetter});
    // console.log("signin"+detail);
  }
  else{
    // console.log("signin1"+detail);
    res.render("upload-book",{success:'',detail:""});
  }
  }
})}else{
  res.redirect("/signup");
};
});

app.post("/upload-book",uploadBook,function(req,res){

var success = "Upload successfull See in book section your product added";
Detail.findOne({email:req.session.email},function(err,detail){
if(err){
  console.log(err);
}
else{
  if(detail){


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
email:req.session.email,
name:detail.name,
phonenumber:detail.phonenumber,
});
newSell.save(function(err,found){
  if(err) {
    console.log(err);
    Detail.findOne({email:req.session.email},function(err,detail){
    if(err){
      console.log(err);
    }
    else{
      if(detail){
        var letter=detail.name.charAt(0);
        var upperLetter=letter.toUpperCase();
            res.render('upload-book', { success:"ERROR OCCURED:it seems that you have not given the correct data-type",detail:detail,upperLetter:upperLetter});
      // console.log("signin"+detail);
    }
    else{
      // console.log("signin1"+detail);
          res.render('upload-book', { success:"ERROR OCCURED:it seems that you have not given the correct data-type",detail:""});
    }
    }
  });

  }
  Detail.findOne({email:req.session.email},function(err,detail){
  if(err){
    console.log(err);
  }
  else{
    if(detail){
      var letter=detail.name.charAt(0);
      var upperLetter=letter.toUpperCase();
      res.render('upload-book', { success:success,detail:detail,upperLetter:upperLetter});
    // console.log("signin"+detail);
  }
  else{
    // console.log("signin1"+detail);
        res.render('upload-book', { success:success,detail:""});
  }
  }
});

});

var bookImage = newSell.bookImage;
}

else{
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
  email:req.session.email,
  name1:req.body.name1,
  phonenumber1:req.body.phonenumber1
  });
  newSell.save(function(err,found){
    if(err) {
      console.log(err);
      Detail.findOne({email:req.session.email},function(err,detail){
      if(err){
        console.log(err);
      }
      else{
        if(detail){
          var letter=detail.name.charAt(0);
          var upperLetter=letter.toUpperCase();
              res.render('upload-book', { success:"ERROR OCCURED:it seems that you have not given the correct data-type",detail:detail,upperLetter:upperLetter});
        // console.log("signin"+detail);
      }
      else{
        // console.log("signin1"+detail);
            res.render('upload-book', { success:"ERROR OCCURED:it seems that you have not given the correct data-type",detail:""});
      }
      }
    });

    }
    Detail.findOne({email:req.session.email},function(err,detail){
    if(err){
      console.log(err);
    }
    else{
      if(detail){
        var letter=detail.name.charAt(0);
        var upperLetter=letter.toUpperCase();
        res.render('upload-book', { success:success,detail:detail,upperLetter:upperLetter});
      // console.log("signin"+detail);
    }
    else{
      // console.log("signin1"+detail);
          res.render('upload-book', { success:success,detail:""});
    }
    }
  });

  });

}



}
});
});

app.get("/faq",function(req,res){
  Detail.findOne({email:req.session.email},function(err,detail){
  if(err){
    console.log(err);
  }
  else{
    if(detail){
      var letter=detail.name.charAt(0);
      var upperLetter=letter.toUpperCase();
        res.render("faq",{detail:detail,upperLetter:upperLetter});

    // console.log("signin"+detail);
  }
  else{
    // console.log("signin1"+detail);
    res.render("faq",{detail:""});
  }
  }
});

});



// app.route("/addtocart")
//
// .get(function(req,res){
//   res.render("addtocart",{
//   });
// });



app.get("/profile/:id",function(req,res){
  var route=req.params.id;
  Detail.findOne({_id:route},function(err,detail){
    if(err){
      console.log(err);
    }
    else{
      // console.log("09"+detail);
      if(detail){
        var letter=detail.name.charAt(0);
        var upperLetter=letter.toUpperCase();
        name=detail.name,
        email=detail.email,
        phonenumber=detail.phonenumber
      res.render("profile",{detail:detail,upperLetter:upperLetter})
      // console.log("12"+detail);
    }
    else{res.render("profile",{detail:""});}
    }
  })
  // res.render("profile");
})





app.get("/courses/detailcourses/:detailcoursesId",function(req,res){

  if(req.isAuthenticated()){

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
  name=result.name,
  phonenumber=result.phonenumber,

  Detail.findOne({email:req.session.email},function(err,detail){
  if(err){
    console.log(err);
  }
  else{
    if(detail){
      // console.log("my name"+result.name);
      var letter=detail.name.charAt(0);
      var upperLetter=letter.toUpperCase();
      res.render("detailcourses",{
      instructorName:instructorName,
      hostelNum:hostelNum,
      courseImage:courseImage,
      courseName:courseName,
      discountedPrice:discountedPrice,
      description:description,
      result:result,
      detail:detail,
      upperLetter:upperLetter,
      name:name,
      phonenumber:phonenumber,

      });

    // console.log("signin"+detail);
  }
  else{
    // console.log("hell0"+result.name);
    // console.log("signin1"+detail);
    res.render("detailcourses",{
    instructorName:instructorName,
    hostelNum:hostelNum,
    courseImage:courseImage,
    courseName:courseName,
    discountedPrice:discountedPrice,
    description:description,
    result:result,
    detail:"",
    name:name,
    phonenumber:phonenumber
    });
  }
  }
});
});
}else{
  res.redirect("/signup");
}
});

app.route("/books/detailBooks/:detailBookId")

.get(function(req,res){
  if(req.isAuthenticated()){
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
    Detail.findOne({email:req.session.email},function(err,detail){
    if(err){
      console.log(err);
    }
    else{
      if(detail){
        var letter=detail.name.charAt(0);
        var upperLetter=letter.toUpperCase();
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
          found:found,
          detail:detail,
          upperLetter:upperLetter
        });

      // console.log("signin"+detail);
    }
    else{
      // console.log("signin1"+detail);
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
        found:found,
        detail:"",
      });
    }
    }
  });
  // console.log(writer);
})}else{
  res.redirect("/signin");
};
});

app.get("/safety",function(req,res){
  Detail.findOne({email:req.session.email},function(err,detail){
  if(err){
    console.log(err);
  }
  else{
    if(detail){
      var letter=detail.name.charAt(0);
      var upperLetter=letter.toUpperCase();
        res.render("safety",{detail:detail,upperLetter:upperLetter});


    // console.log("signin"+detail);
  }
  else{
    // console.log("signin1"+detail);
      res.render("safety",{detail:""});
  }
  }
});
});
app.get('/add/:id', function(req, res, next) {
  Sell.find({_id:req.params.id},function(err,products){
  if(!err){
    // console.log(products);
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  var product = products.filter(function(item) {
    return item._id == productId;
  });
  // console.log(product);
  if(product){
  cart.add(product[0], productId);
  req.session.cart = cart;
  // console.log(cart);
  req.flash('cartmsg','added to cart');
    req.flash('cartqty',cart.totalItems);
  res.redirect('/books');
}};

});
});

app.get('/addcourse/:id', function(req, res, next) {
  Seller.find({_id:req.params.id},function(err,products){
  if(!err){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  var product = products.filter(function(item) {
    return item._id == productId;
  });
  // console.log(product);
  if(product){
  cart.add(product[0], productId);
  req.session.cart = cart;
  // console.log(cart);
  req.flash('cartmsg','added to cart');
  req.flash('cartqty',cart.totalItems)
  res.redirect('/courses');
}};

});
});


app.get('/addtocart', function(req, res, next) {
  if(req.isAuthenticated()){
  if (!req.session.cart) {
    Detail.findOne({email:req.session.email},function(err,detail){
    if(err){
      console.log(err);
    }
    else{
      if(detail){
        var letter=detail.name.charAt(0);
        var upperLetter=letter.toUpperCase();
        return res.render('addtocart', {
          products: null,
          detail:detail,
          upperLetter:upperLetter

        });

      // console.log("signin"+detail);
    }
    else{
      // console.log("signin1"+detail);
      return res.render('addtocart', {
        products: null,
        detail:"",

      });
    }
    }
  });

  }
  var cart = new Cart(req.session.cart);
  // console.log(cart.getItems());
  // console.log(cart.totalItems);
  Detail.findOne({email:req.session.email},function(err,detail){
  if(err){
    console.log(err);
  }
  else{
    if(detail){
      var letter=detail.name.charAt(0);
      var upperLetter=letter.toUpperCase();
      res.render('addtocart', {
        // title: 'NodeJS Shopping Cart',
        products: cart.getItems(),
        totalItems:cart.totalItems,
        totalPrice: cart.totalPrice,
        detail:detail,
        upperLetter:upperLetter
      });


    // console.log("signin"+detail);
  }
  else{
    // console.log("signin1"+detail);
    res.render('addtocart', {
      // title: 'NodeJS Shopping Cart',
      products: cart.getItems(),
      totalItems:cart.totalItems,
      totalPrice: cart.totalPrice,
      detail:""
    });
  }
  }
});
}else{
  res.redirect("/signup");
}
});

app.get('/remove/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.remove(productId);
  req.session.cart = cart;

  res.redirect('/addtocart');
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


app.get('/checkout',function(req,res){

  if (!req.session.cart) {
    Detail.findOne({email:req.session.email},function(err,detail){
    if(err){
      console.log(err);
    }
    else{
      if(detail){
        var letter=detail.name.charAt(0);
        var upperLetter=letter.toUpperCase();

        return res.render('checkout', {
          products: null,
          detail:detail,
          upperLetter:upperLetter

        });

      // console.log("signin"+detail);
    }
    else{
      // console.log("signin1"+detail);
      return res.render('checkout', {
        products: null,
        detail:"",

      });
    }
    }
  });

  }
  var cart = new Cart(req.session.cart);
  // console.log(cart.getItems());
  // console.log(cart.totalItems);
  Detail.findOne({email:req.session.email},function(err,detail){
  if(err){
    console.log(err);
  }
  else{
    if(detail){
      var letter=detail.name.charAt(0);
      var upperLetter=letter.toUpperCase();
      Seller.findOne({_id:cart.id},function(err,result){
        if(err){
          res.redirect("/courses");
          console.log(err);

        }
        else{
          if(result){


             console.log(cart.items);
             res.render('checkout', {
              // title: 'NodeJS Shopping Cart',
              products: cart.getItems(),
              totalItems:cart.totalItems,
              totalPrice: cart.totalPrice,
              detail:detail,
              upperLetter:upperLetter
            });}

        }
      });

      Sell.findOne({_id:cart.id},function(err,result){
        if(err){
          res.redirect("/courses");
          console.log(err);

        }
        else{
          if(result){
             // console.log(cart);
            res.render('checkout', {
              // title: 'NodeJS Shopping Cart',
              products: cart.getItems(),
              totalItems:cart.totalItems,
              totalPrice: cart.totalPrice,
              detail:detail,
              upperLetter:upperLetter
            });}

        }

      })


      // console.log(cart.getItems());



    // console.log("signin"+detail);
  }
  else{
    // console.log("signin1"+detail);
    // var letter=detail.name.charAt(0);
    // var upperLetter=letter.toUpperCase();
    Seller.findOne({_id:cart.id},function(err,result){
      if(err){
        res.redirect("/books");
        console.log(err);

      }
      else{
        if(result){


           // console.log(cart.items);
           res.render('checkout', {
            // title: 'NodeJS Shopping Cart',
            products: cart.getItems(),
            totalItems:cart.totalItems,
            totalPrice: cart.totalPrice,
            detail:"",
            // upperLetter:upperLetter
          });}

      }
    });

    Sell.findOne({_id:cart.id},function(err,result){
      if(err){
        res.redirect("/books");
        console.log(err);

      }
      else{
        if(result){
           // console.log(cart);
          res.render('checkout', {
            // title: 'NodeJS Shopping Cart',
            products: cart.getItems(),
            totalItems:cart.totalItems,
            totalPrice: cart.totalPrice,
            detail:"",
            upperLetter:upperLetter
          });}

      }

    })
  }
  }
  });

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
 console.log("server is started successfully");
});
