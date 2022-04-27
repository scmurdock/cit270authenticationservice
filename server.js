const express = require('express');
const port = 3000;
const app = express.application;

app.listen(port, ()=>{
    console.log("Listening on port: "+port);
})