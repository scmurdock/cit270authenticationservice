const express = require('express');
const https = require('https');
const port = 443;//4043 or 443
const app = express();
const fs = require('fs');
const md5 = require('md5');
const bodyParser = require('body-parser');//body parser is called middleware
const {createClient} = require('redis');
const { response } = require('express');
const { fstat } = require('fs');
const redisClient = createClient(
{
  url:'redis://default@34.132.23.7:6379',
}
);//this creates a connection to the redis database


app.use(bodyParser.json());//use the middleware (call it before anything else happens on each request)

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert'),
    passphrase: 'P@ssw0rd'
}, app).listen(port, async ()=>{
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

const savePassword = async (request, response)=>{
    const clearTextPassword = request.body.password;
    const hashedTextPassword = md5(clearTextPassword);
    await redisClient.hSet('passwords',request.body.userName, hashedTextPassword);//this is wrong
    response.status(200);//status 200 means ok
    response.send({result:"Saved"});
}

/*async function savePassword(request,response){


}*/

app.get('/',(request,response)=>{//every time something calls your API that is a request
    response.send("Hello");// a response is when the API gives the information requested
})


app.post('/signup', savePassword);
app.post('/login',validatePassword);