const  mongoose = require("mongoose");


const connectToMongo =  async function main() {
    
 await mongoose.connect("mongodb://0.0.0.0:27017/inotebookDB", {
        useNewUrlParser: true
      })
    
      
    console.log("connected")
} 

module.exports = connectToMongo;