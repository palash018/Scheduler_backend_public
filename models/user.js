const mongoose=require('mongoose');
const { model } = require('mongoose');
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
const user={
    username:'',
    email:'',
    password:'',
    cards:[],
    status:false,
}

userSchema.statics.doThisUserExist=async function(username,email){
    try{
        const email_notavailable= await this.findOne({email});
        const user_notavailable=await this.findOne({username});
        if(user_notavailable||email_notavailable){
            if(user_notavailable){
                
                return 'username not available';
            }
            else{
                return 'email not available';
            }
        }
        else{
            return false;
        }
    }
    catch(err){
        console.log(err);
        return false;
    }
}


module.exports={Users:mongoose.model('Users',userSchema),Cards:mongoose.model('Cards',cardSchema)};

