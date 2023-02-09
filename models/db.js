const mongoose=require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
    console.log('succesfully connected');
  }).catch((err)=>{
    console.log(err);
  })