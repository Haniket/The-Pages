const express = require('express');
const ejs = require('ejs');
const app=express();
app.set('view engine','ejs');
app.use(express.static("public"));


app.get("/",function(req,res){
res.render("home");

});




app.get("/books",function(req,res){
  res.render("books");
});



app.get("/faq",function(req,res){
  res.render("faq");
});



app.get("/addtocart",function(req,res){
  res.render("addtocart");
});



app.get("/courses",function(req,res){
  res.render("courses");
});




app.get("/detail",function(req,res){
  res.render("detail");
});



app.get("/signup",function(req,res){
  res.render("signup");
});



app.get("/safety",function(req,res){
  res.render("safety");
});


app.listen(3000,function(){
 console.log("server is started on port 3000");

});
