// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const mongo = require("mongodb").MongoClient;
const urlParser = require("url");
const url = process.env.URL;
const base_url = "https://shade-rate.glitch.me/short/";

app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/short/:short", (req, res)=>{

 const shortened_url = req.params.short;
 
   mongo.connect(url, (err, client)=>{
   
   if(err){
   throw err
   }
     
   client.db("urlshortener").collection("shortend").find({shortened_url : shortened_url}).toArray((err,doc)=>{
     
     if(err){
     throw err;
     }
     const redirect_url = doc[0].original_url;
     res.status(301).redirect(redirect_url);
   
   });
    
 
 }) 
  
});


app.use("/new/:url*", (req, res, next)=>{

  const original_url = req.params.url;
  const found = original_url.match(/(http:[/][/])|(https:[/][/])+(www.)?([A-Z,a-z,1-9]*)+[.]+([A-Z,a-z]*)/g);
  
  if(found.length){
  
    next();
  
  }
  else{
    
  res.end(
    
    'Please ensure you have formatted your url in the format "http://www.example.com"'
  
  );
  
  next();
  }
});


// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.get('/new/:url*',  (req, res) => {
  
  res.writeHead(200, {"Content-Type": "application/json"});
  
  const original_url = urlParser.parse(req.url).path.slice(5);
  let shortened_url= Math.floor(original_url.length+3200*Math.random()).toString(16); 
  
  mongo.connect(url, (err, client)=>{
   
   if(err){
   res.end("err");
   }
   function checkDuplicates(shortened){
   return client.db("urlshortener").collection("shortend").find({shortened_url: shortened}).limit(1).size()>0
   }
    
     
   client.db("urlshortener").collection("shortend").insert({ shortened_url, original_url});
  
  res.end(JSON.stringify({shortened_url:base_url+shortened_url, original_url}));
    client.close();
 
 }) 
  

  
 
  
});

// Simple in-memory store for now

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
