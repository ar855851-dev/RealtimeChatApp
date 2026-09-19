const router = require('express').Router();
const User = require('./../models/user');
const bcrypt = require('bcryptjs');
const jwt= require('jsonwebtoken');



router.post('/signup', async (req, res) => {
    try{
        // check user already exists
        const user = await User.findOne({email: req.body.email})


        //if user exite send an error message
        if(user){
        return res.send({
            message:"User already exists",
            success:false
        })
    }
        //  for password encrpytion
        const hashedPassword = await bcrypt.hash(req.body.password,10);
        req.body.password = hashedPassword;

        // create new user in database
        const newUser = new User(req.body);
        await newUser.save();
        res.send({
            message:"User created successfully",
            success:true
        });


    }catch(error){ //agar koi error aata hai to usko catch block me handle karega
        res.send({
            message:error.message,
            success:false
        })
    }
})

router.post('/login', async (req, res) => {
    try{
        // check user already exists
        const user = await User.findOne({email: req.body.email}).select("+password");
        console.log("User found:", user);   // cmd me user ki information print karega
        if(!user){
            return res.send({
                message:"User does not exist",
                success:false
            })
        }
        if (!user.password) {
        return res.status(400).send({
        message: "User password not found in DB",
        success: false
    });
}

        // compare password if user exist
        const isvalid = await bcrypt.compare(req.body.password, user.password)
        if(!isvalid){
            return res.send({
                message:"Invalid password",
                success:false
            })
        }
        // if password is valid then create a token and send to client
        console.log("SECRET_KEY:", process.env.SECRET_KEY); // cmd me SECRET_KEY ki value print karega
        const token = jwt.sign({userId : user._id}, process.env.SECRET_KEY, {expiresIn: '1d'});
        res.send({
            message: 'User Logged-in successfully',
            success: true,
            token: token
        });
    } catch(error) { //agar koi error aata hai to usko catch block me handle kareg
        res.status(400).send({
            message:error.message,
            success:false
        })
   
    }

})


module.exports = router;