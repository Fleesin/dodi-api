const mongoose = require('mongoose');

const { log } = console;

mongoose.set('useFindAndModify', false);

module.exports.connect = async () => {
  await mongoose
    .connect(
      'mongodb+srv://dodiadm:propet2020@clusterdodi0.88y2o.mongodb.net/dodi?retryWrites=true&w=majority'
    )
    .then(() => log('Conectado a Atlas'))
    .catch((error) => console.log(error));
};
