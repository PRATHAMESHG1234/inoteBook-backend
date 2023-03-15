const mongoose = require('mongoose');

const connectToMongo = async function main() {
  await mongoose.connect(
    'mongodb+srv://Prathamesh2002:Prathamesh2002@cluster0.yszwa96.mongodb.net/?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
    }
  );

  console.log('connected');
};

module.exports = connectToMongo;
