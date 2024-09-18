import express from 'express'
import mongoose from 'mongoose'
import path from 'path'
import multer from 'multer';
import { User } from './Models/User.js';
import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({ 
    cloud_name: 'dozxzuctl', 
    api_key: '638645829269966', 
    api_secret: '4jq8dQeymHYkeKDVXnF7vp2pgPI' 
});


const app=express();

app.use(express.urlencoded({extenden:true}));

//use multer for handling file
const storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname))
    }
  }) 
  const upload = multer({ storage: storage })

//for register page
app.get('/register',(req,res)=>{
    res.render("register.ejs")
})

// create user
app.post('/register',upload.single('file'),async(req,res)=>{
    const file=req.file.path;
    const {name,email,password}=req.body
    try{
        const cloudinaryRes =await cloudinary.uploader.upload(file,{folder:'Authentication_Project'})
        //store data in db
        const user= await User.create({
            profileImg:cloudinaryRes.secure_url,
            name,email,password
        })
        res.redirect('/');
        console.log(cloudinaryRes,name,email,password)
    }
    catch(error){
        res.send("error occured")
    }
})


//for login page
app.get('/',(req,res)=>{        //'/' is used for home page as login by default
    res.render("login.ejs")    
})

// login user
app.post('/login',async(req,res)=>{
    const {email,password}=req.body;

    try {
        let user=await User.findOne({email})

        console.log("getting user details",user);

        if(!user)res.render("login.ejs",{msg:'User not found'})
        else if(user.password!=password)res.render("login.ejs",{msg:'Invalid Password'})
        else{
            res.render("profile.ejs",{user})
        }
    } catch (error) {
        // res.send("error occured")
    }
})

//all users
app.get('/users',async(req,res)=>{
    let users=await User.find().sort({createdAt:-1});
    res.render("users.ejs",{users})
})



mongoose.connect("mongodb+srv://amitkasaudhan3103:CiEpHUPAPpj7jsTa@cluster0.4zrbb.mongodb.net/",{
    "dbName":"Authentication_Project"
}).then(()=>console.log("MongoDb Connected")).catch((error)=>console.log("error"));

const port=3000;
app.listen(port,()=>console.log(`server is running on port ${port}`));

