const mongoose = require('mongoose')
const slugify = require('slugify')

const categorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    slug:{
        type:String,
        required:true,
        unique:true
    },
    createdAt:{
        type:Date,
        default: Date.now()
    }
})

categorySchema.pre('validate', function(){
    if(this.name){
        this.slug = slugify(this.name, { lower: true })
    }
})

module.exports = mongoose.model('Category', categorySchema)