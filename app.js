const express = require('express');
const ejs = require('ejs');
const app=express();
app.set('view engine','ejs');
app.use(express.static("public"));


app.get("/",function(req,res){
res.render("home");

})
app.get("/books",function(req,res){
  res.render("books");
})



app.listen(3000,function(){
 console.log("server is started on port 3000");

});
