const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const newsSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true,
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',  
        required:true
    },
    image:{
        type:String,
        required:true
    },
    createdAt:{ 
        type:Date,
        default:Date.now()
    }
})

newsSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('News', newsSchema)