const mongoose=require('mongoose')

const tokenSchema= new mongoose.Schema({
    tokenId:{
        type:Number,
        required:true
    },
    ownerWallet:{
        type:String,
        required:true
    },
    tokenTitle:{
        type:String,
        required:true
    },
    tokenDescription:{
        type:String,
        required:true
    },
    img:{
        type:String,
        required:true
    }
})

module.exports=mongoose.model('Token',tokenSchema)