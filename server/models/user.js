const mongoose = require('mongoose');   //yaha mongoose ko import kiya hai jisse hum apne database se connect kar sake aur schema create kar sake

const userSchema =new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        select : false, //jab bhi hum user ka data fetch karenge toh password field by default nahi aayega, isse security badh jayegi
    },
    profilepic:{
        type:String,
        required:false
    }
},  {timestamps:true});

module.exports = mongoose.model('user', userSchema);   //yaha 'user' collection create hoga aur userSchema ke according data store hoga