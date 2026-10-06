const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum: ['author','admin'],
        required:true,
        default: 'author'
    }
})

userSchema.pre('save', async function(){
    if(!this.isModified('password')) return
    this.password = await bcrypt.hash(this.password, 12)
})
module.exports = mongoose.model('User', userSchema)