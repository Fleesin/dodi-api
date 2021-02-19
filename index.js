// paquetes
const mongodb = require('mongodb');

const { ObjectID } = mongodb;
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');

// utilidades para password

const genRandomString = function (length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex') /* convierte a hexadecimal la contra */
    .slice(0, length);
};

const sha512 = function (password, salt) {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  const value = hash.digest('hex');
  return {
    salt,
    passwordHash: value,
  };
};

function saltHashPassword(userPassword) {
  const salt = genRandomString(16); // crea 16 carácteres random
  const passwordData = sha512(userPassword, salt);
  return passwordData;
}

function checkHashPassword(userPassword, salt) {
  const passwordData = sha512(userPassword, salt);
  return passwordData;
}

// Servicios para Express

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB client
const { MongoClient } = mongodb;
app.set('port', process.env.PORT || 3000);
// URL

const url =
  'mongodb+srv://dodiadm:propet2020@clusterdodi0.88y2o.mongodb.net/dodi?retryWrites=true&w=majority';

MongoClient.connect(
  url,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    if (err)
      console.log('No es posible conectarse con server mongoDB.ERROR', err);
    else {
      // registro
      app.post('/register', (request, response, next) => {
        const post_data = request.body;

        const plaint_password = post_data.password;
        const hash_data = saltHashPassword(plaint_password);

        const password = hash_data.passwordHash;
        const { salt } = hash_data;
        const { name } = post_data;
        const { email } = post_data;
        const insertJson = {
          email,
          password,
          salt,
          name,
        };
        const db = client.db('dodi');
        // Revisa email creados

        db.collection('users')
          .find({ email })
          .count((err, number) => {
            if (number != 0) {
              response.json('Este Correo ya existe');
              console.log('Este Correo ya existe');
            } else {
              // insert data
              db.collection('users').insertOne(insertJson, (error, res) => {
                response.json('Registro exitoso');
                console.log('Registro exitoso');
              });
            }
          });
      });

      app.post('/login', (request, response, next) => {
        const post_data = request.body;

        const { email } = post_data;
        const userPassword = post_data.password;

        const db = client.db('dodi');
        // Revisa email creados

        db.collection('users')
          .find({ email })
          .count((err, number) => {
            if (number == 0) {
              response.json('Este Correo no existe');
              console.log('Este Correo no existe');
            } else {
              // insert data
              db.collection('users').findOne({ email }, (err, user) => {
                const { salt } = user;
                const hashed_password = checkHashPassword(userPassword, salt)
                  .passwordHash;
                const encrypted_password = user.password;
                if (hashed_password == encrypted_password) {
                  response.json('Ingreso exitoso');
                  console.log('Ingreso exitoso');
                } else {
                  response.json('Contraseña incorrecta');
                  console.log('Contraseña incorrecta');
                }
              });
            }
          });
      });

      app.listen(app.get('port'), () => {
        console.log(
          'Se ha conectado con server MongoDB, WebService está ejecutandose en el puerto 3000'
        );
      });
    }
  }
);
