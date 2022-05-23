const express = require('express');

const port = 3000;
const app = express();
const md5 = require('md5');
const bodyParser = require('body-parser');//body parser is called middleware
const {createClient} = require('redis');
const redisClient = createClient(
{
  socket:{
      port:6379,
      host:"127.0.0.1",
  },
}
);//this creates a connection to the redis database


app.use(bodyParser.json());//use the middleware (call it before anything else happens on each request)

app.listen(port, async ()=>{
    await redisClient.connect();//creating a TCP socket with Redis
    console.log("Listening on port: "+port);
})

const validatePassword = async (request, response)=>{
    //await redisClient.connect();//creating a TCP socket with Redis
    const requestHashedPassword = md5(request.body.password);//get the password from the body and hash it
    const redisHashedPassword= await redisClient.hmGet('passwords',request.body.userName);//read password from redis
    console.log('Redis hashed password: '+redisHashedPassword);
    const loginRequest = request.body;
    console.log("Request Body",JSON.stringify(request.body));
    //search database for username, and retrieve current password

    //compare the hashed version of the password that was sent with the hashed version from the database
    if (requestHashedPassword==redisHashedPassword){
        response.status(200);//200 means OK
        response.send("Welcome");
    } else{
        response.status(401);//401 means unauthorized
        response.send("Unauthorized");
    }

}
app.get('/',(request,response)=>{//every time something calls your API that is a request
    response.send("Hello");// a response is when the API gives the information requested
})

app.post('/login',validatePassword);