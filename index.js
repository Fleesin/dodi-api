//paquetes
var mongodb = require('mongodb');
var ObjectID = mongodb.ObjectID;
var crypto = require('crypto');
var express = require('express');
var bodyParser = require('body-parser'); 

//utilidades para password

var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex')           /*convierte a hexadecimal la contra*/
        .slice(0,length);
};

var sha512 = function(password,salt){
    var hash = crypto.createHmac('sha512',salt);
    hash.update(password);
    var value = hash.digest('hex');
    return{
        salt:salt,
        passwordHash:value
    };
};

function saltHashPassword(userPassword){
    var salt = genRandomString(16); //crea 16 carácteres random
    var passwordData = sha512(userPassword,salt);
    return passwordData;
}

function checkHashPassword (userPassword,salt){
    var passwordData = sha512(userPassword,salt);
    return passwordData;
}

//Servicios para Express

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//MongoDB client
var MongoClient = mongodb.MongoClient;
app.set('port', process.env.PORT || 3000)
//URL

var url = 'mongodb+srv://dodiadm:propet2020@clusterdodi0.88y2o.mongodb.net/dodi?retryWrites=true&w=majority'


MongoClient.connect(url, {useNewUrlParser: true,  useUnifiedTopology: true}, function(err, client){
    if(err)
        console.log('No es posible conectarse con server mongoDB.ERROR', err);
        else{

            //registro
            app.post('/register', (request,response,next)=>{
                var post_data = request.body;

                var plaint_password = post_data.password;
                var hash_data = saltHashPassword(plaint_password);

                var password = hash_data.passwordHash; 
                var salt = hash_data.salt;
                var name = post_data.name;
                var email = post_data.email;
                var insertJson = {
                    'email': email,
                    'password': password,
                    'salt': salt,
                    'name': name
                };
                var db = client.db('dodi');
                //Revisa email creados

                db.collection('users')
                    .find ({'email': email}).count(function(err,number){
                        if(number != 0)
                        {
                            response.json('Este Correo ya existe');
                            console.log('Este Correo ya existe');
                        }
                        else
                        {
                            //insert data
                            db.collection('users')
                                .insertOne(insertJson,function(error,res){
                                    response.json('Registro exitoso');
                                    console.log('Registro exitoso');
                                })
                        }
                    })
            });
            
            app.post('/login', (request,response,next)=>{
                var post_data = request.body;

                
                var email = post_data.email;
                var userPassword = post_data.password;

                
                var db = client.db('dodi');
                //Revisa email creados

                db.collection('users')
                    .find ({'email': email}).count(function(err,number){
                        if(number == 0)
                        {
                            response.json('Este Correo no existe');
                            console.log('Este Correo no existe');
                        }
                        else
                        {
                            //insert data
                            db.collection('users')
                                .findOne({'email': email}, function(err, user){
                                    var salt = user.salt;
                                    var hashed_password = checkHashPassword(userPassword,salt).passwordHash;
                                    var encrypted_password = user.password;
                                    if(hashed_password == encrypted_password)
                                    {
                                        response.json('Ingreso exitoso');
                                        console.log('Ingreso exitoso');
                                    }
                                    else
                                    {
                                        response.json('Contraseña incorrecta');
                                        console.log('Contraseña incorrecta');
                                    }
                                })
                        }
                    })
            });

            app.listen(app.get('port'),()=>{
                console.log('Se ha conectado con server MongoDB, WebService está ejecutandose en el puerto 3000');
            })
        }
});