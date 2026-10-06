const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const userModel = require('../models/User.js')
const newsModel = require('../models/News.js')
const categoryModel = require('../models/Category.js')
const settingsModel = require('../models/Settings.js')
const fs = require('fs')
const path = require('path')
const { validationResult } = require('express-validator')

dotenv.config()

const loginPage = async (req, res) => {
    res.render('admin/login', {
        layout: false
    })  
}

const adminLogin = async (req, res, next) => {

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.render('admin/login', {
        layout: false,
        errors: errors.array().map(e => e.msg)
    })
    }

    const { username, password } = req.body
    try{
        const user = await userModel.findOne({ username })
        if(!user){
            return res.status(401).send("Invalid username or password")
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(401).send("Invalid username or password")
        }

        const token = jwt.sign({ id: user._id, fullname: user.fullname, role: user.role }, process.env.JWT_SECRET, { expiresIn:'1h' })
        res.cookie('token', token, { httpOnly: true, maxAge: 60*60*1000})
        res.redirect('/admin/dashboard')
    }catch(err){
        next(err)
    }
}

const logout = async (req, res) => {
    res.clearCookie('token')
    res.redirect('/admin/')
}

const dashboard = async (req, res, next) => {
    try{
        
        let articleCount;
        if(req.role == 'author'){
            articleCount = await newsModel.countDocuments({ author: req.id })
        }else{
            articleCount = await newsModel.countDocuments()
        }
        
        const categoryCount = await categoryModel.countDocuments()
        const userCount = await userModel.countDocuments()

        res.render('admin/dashboard', { 
            role: req.role, 
            fullname: req.fullname,
            articleCount,
            categoryCount,
            userCount 
        })
    }catch(err){
        next(err)
    }
}

const settings = async (req, res, next) => {
    try{
        const settings = await settingsModel.findOne()
        res.render('admin/settings', { role: req.role, settings })
    }catch(err){
        next(err)
    }
}

const saveSettings = async (req, res, next) => {
    try{
        const settings = await settingsModel.findOne()
        let updateData = {
            website_title: req.body.website_title,
            footer_description: req.body.footer_description
        }

        if(req.file){
            if(settings && settings.website_logo){
                const oldPath = path.join(__dirname, '../public/uploads', settings.website_logo)
                try{
                    if(fs.existsSync(oldPath)){
                        await fs.promises.unlink(oldPath)
                    }
                }catch(err){
                    res.status(500).send("Old Image deleting error:",err)
                }
            }
        updateData.website_logo = req.file.filename
        }

        if(!settings){
            await settingsModel.create(updateData)
        }else{
            await settingsModel.findByIdAndUpdate(settings._id, updateData)
        }

        res.redirect('/admin/settings')
    }catch(err){
        next(err)
    }
}

const allUser = async (req, res) => {
    const users = await userModel.find()
    res.render('admin/users', { users, role:req.role })
}

const addUserPage = async (req, res) => {
    res.render('admin/users/create', { role: req.role, errors:0 })
}

const addUser = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.render('admin/users/create', {
        role:req.role,
        errors: errors.array().map(e => e.msg)
    })
    }
    await userModel.create(req.body)
    res.redirect('/admin/users')
}

const updateUserPage = async (req, res, next) => {
    const id = req.params.id
    try{
        const user = await userModel.findById(id)
        if(!user) return res.status(404).send("User not found")
        res.render('admin/users/update', { user, role: req.role, errors:0 })
    }catch(err){
        next(err)
    }
}

const updateUser = async (req, res, next) => {
    const id = req.params.id
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.render('admin/users/update', {
        user:req.body,
        role:req.role,
        errors: errors.array().map(e => e.msg)
    })
    }
    const { fullname, password, role } = req.body
    try{
        const user = await userModel.findById(id)
        if(!user) return res.status(404).send("User not found")

        user.fullname = fullname || user.fullname
        if(password){
        user.password = password
        }
        user.role = role || user.role

        await user.save()

        res.redirect('/admin/users')
    }catch(err){
        next(err)
    }
}

const deleteUser = async (req, res, next) => {
    const id = req.params.id
    try{
        const user = await userModel.findById(id)
        if(!user) return res.status(404).send("user not found")

        const article = await newsModel.findOne({ author: id })
        if(article){
            return res.status(400).json({ success:false, message:'User is associated with article' })
        }
        
        await user.deleteOne()

        res.json({ success: true })
    }catch(err){
        next(err)
    }
}


module.exports = {
    loginPage,
    adminLogin,
    logout,
    allUser,
    addUserPage,
    addUser,
    updateUserPage,
    updateUser,
    deleteUser,
    dashboard,
    settings,
    saveSettings
}

