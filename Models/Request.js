const mongoose=require("mongoose")

const RequestSchema=new mongoose.Schema({
    from:{
        type:String
    },
    to:{
        type:String
    },
    tokenId:{
        type:String
    },
    isApproved:{
        type:Boolean,
        default:false
    },
    dateTime:{
        type:Date
    },
    userName:{
        type:String
    }
})

module.exports=Request=mongoose.model('request',RequestSchema)