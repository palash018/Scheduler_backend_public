# Scheduler_backend_public
## DB design

<a href="https://drive.google.com/uc?export=view&id=1zMvOmEYGjFiee2VKsFlzh7rCElFuZSo0"><img src="https://drive.google.com/uc?export=view&id=<FILEID>" style="width: 650px; max-width: 100%; height: auto" title="Click to enlarge picture" />
  ```
  const cardSchema=new mongoose.Schema({
   name:{
    type:String,
    required:true,
   },
   startTime:{
    type:Date,
    required:true
   },
   endTime:{
    type:Date,
    required:true
   },
   description:{
    type:String,
   }
})
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:false
    },
    cards:{
        type:[{type:mongoose.Schema.Types.ObjectId,ref:'Cards'}],
        default:[]
    }

}
);
 ```
Function to check if username and email is available is also in db,
 db model and function can be found in [user.js](https://github.com/palash018/Scheduler_backend_public/blob/master/models/user.js)

