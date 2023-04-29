const express=require('express')
const app=express()
const connectDB=require('./config/db')
const bodyParser=require('body-parser')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs')
const cors=require('cors')
const User=require("./Models/User")
const Token=require("./Models/TokenInformation")
const config=require("config")
const Request=require("./Models/Request")
const TokenInformation = require('./Models/TokenInformation')
connectDB()

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))

app.get("/",(req,res) =>{
    res.send('route working')
})

app.post("/userSignup",async(req,res) => {

    try {
        const {name,email,password,metaMaskWalletAddress}=req.body
        let user=await User.findOne({email})
        if(user){
            res.status(420).json({message:'user already exists'})
            return
        }
        user=new User({
            name,email,password,metaMaskWalletAddress
        })
        const salt=await bcrypt.genSalt(10)
        user.password=await bcrypt.hash(password,salt)
        await user.save()
        res.status(200).json({message:'user successfully registered'})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})

app.get("/user/:wallet",async(req,res) => {
    try {
        const wallet=req.params.wallet
        let user=await User.find({metaMaskWalletAddress:wallet})
        res.json({user})
    } catch (error) {
        res.json({error})
    }
})

app.post("/userLogin",async(req,res) => {
    const {email,password}=req.body
    try {
        let user=await User.find({email}) 
        if(!user){
            res.status(400).json({message:'user not found'})
        }
        //res.json(partner[0].password)
        const validPassword=await bcrypt.compare(password,user[0].password)
        if(!validPassword){
            res.status(400).json({message:'wrong password'})
        }

        const payload={
            loggedInUser:{
                email
            }
        }

        jwt.sign(payload,config.get("JWTSecret"),(err,token) => {
            if(err)
                console.log(err.message)
            res.status(200).json({token,message:'logged in successfully',payload,user,
            message:"logged in successfully"})
        })

    } catch (error) {
        console.log(error)
        res.status(400).json({error:error.message})
    }
})

app.post("/mintTokens",async(req,res) => {
    const {tokenId,ownerWallet,tokenTitle,tokenDescription,img}=req.body

    let token=new Token({tokenId,ownerWallet,tokenTitle,tokenDescription,img})

    await token.save()
    res.json({status:'success',token})
})

app.get("/tokens",async(req,res) => {
    const tokens=await Token.find()
    res.json({tokens})
})

app.get("/tokens/:id",async(req,res) => {
    const id=req.params.id
    const token=await Token.find({tokenId:id})
    res.json({token})
})

app.get("/userStatus/:id",async(req,res) => {
    const walletAddress=req.body.metaMaskWalletAddress
    const tokenId=req.params.id
    try {
        const request=await Request.find({tokenId,to:walletAddress})
        request.sort((x,y) => {return y.dateTime-x.dateTime} )
        res.json({request})
    } catch (error) {
        res.json({error:error.message})
    }
    
})

app.get("/adminTokens",async(req,res) => {
    //const adminWallet="0xBbCA960ec52f315a529B5bc7FEc3C1AFDbe2A89F"
    try {
        var tokens=await Token.find({ownerWallet:"0xBbCA960ec52f315a529B5bc7FEc3C1AFDbe2A89F"})
        res.json({tokens})
    } catch (error) {
        res.json({error:error.message})
    }
    
})

app.get("/userTokens/:walletAddress",async(req,res) => {
    //const adminWallet="0xBbCA960ec52f315a529B5bc7FEc3C1AFDbe2A89F"
    const walletAddress=req.params.walletAddress
    try {
        var tokens=await Token.find({ownerWallet:walletAddress})
        res.json({tokens})
    } catch (error) {
        res.json({error:error.message})
    }
    
})

app.get("/transferToken/:id",async(req,res) => {
    const id=req.params.id
    const token=await Token.find({_id:id})
    res.json({token})
})

app.patch("/transferToken/:id",async(req,res) => {
    try {
        const id=req.params.id
        const {to,from}=req.body
        const token=await Token.find({_id:id})
        var updateObj={}
        updateObj.ownerWallet=to
        await Token.updateOne({_id:id},{$set:updateObj})
        res.json({token})
    } catch (error) {
        res.json({error:error.message})
    }
    
})


app.post("/requests",async(req,res) => {
    const {from,to,tokenId,userName}=req.body
    try {
        var request=await Request.find({from,tokenId})
        request=new Request({from,to,tokenId,isApproved:false,dateTime:new Date(Date.now()),userName})
        request.save()
        res.json({request})
    } catch (error) {
        res.json({error:error.message})
    }
})

app.get("/requests",async(req,res)=> {
    const requests=await Request.find({})
    requests.sort((x,y) => {return y.dateTime-x.dateTime} )
    res.json({requests})
})

app.patch("/requests/:id",async(req,res) => {
    const requestId=req.params.id
    try {
        var request=await Request.find({requestId})
        var updateObj={}
        updateObj.isApproved=true
        await Request.updateOne({_id:requestId},{$set:updateObj})
        res.json({request,message:'successfully updated user'})
    } catch (error) {
        res.json({message:error.message})
    }
    
})

app.listen(PORT=5000,() => {
    console.log("server started")
})