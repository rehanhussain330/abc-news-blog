const fs = require('fs')
const path = require('path')
const categoryModel = require('../models/Category.js')
const newsModel = require('../models/News.js')
const userModel = require('../models/User.js')
const createError = require('../utils/error-message.js')
const { validationResult } = require('express-validator')

const allArticle = async (req, res, next) => {
    try{
        let articles;
        if(req.role === 'admin'){
            articles = await newsModel.find().populate('category','name').populate('author','fullname')
        }else{
            articles = await newsModel.find({ author:req.id }).populate('category','name').populate('author','fullname')
        }
        res.render('admin/articles', { role: req.role, articles })
    }catch(err){
        next(err)
    }
}


const addArticlePage = async (req, res) => {
    const categories = await categoryModel.find()
    res.render('admin/articles/create', { role: req.role, categories, errors:0 })
}


const addArticle = async (req, res, next) => {

    const errors = validationResult(req)
        if(!errors.isEmpty()){
            const categories = await categoryModel.find()
            return res.render('admin/articles/create', {
            categories,
            role:req.role,
            errors: errors.array().map(e => e.msg)
        })
        }

    try{
        const { title, content, category } = req.body 
        const article = new newsModel({
        title, content, category, author: req.id, image:req.file.filename
        })
        await article.save()
        res.redirect('/admin/article')
    }catch(err){
        next(err)
    }
}


const updateArticlePage = async (req, res, next) => {
    const id = req.params.id
    try{
        const article = await newsModel.findById(id).populate('category','name').populate('author','fullname')
        if(!article){
            // return res.status(404).send("Article not found")
            return next(createError('Article not found', 404))
        }

        if(req.role === 'author'){
            if(req.id != article.author._id){
                return res.status(401).send("Unauthorized")
            }
        }

        const categories = await categoryModel.find()
        res.render('admin/articles/update', { role: req.role, article, categories, errors:0 })
    }catch(err){
        next(err)
    }
    
}


const updateArticle = async (req, res, next) => {

    const id = req.params.id 

    const errors = validationResult(req)
        if(!errors.isEmpty()){
            const categories = await categoryModel.find()
            return res.render('admin/articles/update', {
            article:req.body,
            categories,
            role:req.role,
            errors: errors.array().map(e => e.msg)
        })
        }

    try{

        const { title, content, category } = req.body
        const article = await newsModel.findById(id)

        if(!article){
            return res.status(404).send("Article not found")
        }

        if(req.role === 'author'){
            if(req.id != article.author._id){
                return res.status(401).send("Unauthorized")
            }
        }

        article.title = title
        article.content = content
        article.category = category

        if(req.file){
            try{
                const imagePath = path.join(__dirname, '../public/uploads', article.image)
                await fs.promises.unlink(imagePath)
            }catch(err){
                console.log("Error deleting image:", err.message)
            }
            article.image = req.file.filename
        }

        await article.save()
        res.redirect('/admin/article')

    }catch(err){
        next(err)
    }
}


const deleteArticle = async (req, res, next) => {
    const id = req.params.id 
    try{
        const article = await newsModel.findById(id)
        if(!article){
            // return res.status(404).send("Article not found")
            return next(createError('Article not found', 404))
        }

        if(req.role === 'author'){
            if(req.id != article.author._id){
                return res.status(401).send("Unauthorized")
            }
        }

        try{
            const imagePath = path.join(__dirname, '../public/uploads',article.image)
            await fs.promises.unlink(imagePath)
        }catch(err){
            console.log("Error deleting image:", err.message)
        }

        await article.deleteOne()
        
         res.json({success:true})
    }catch(err){
        next(err)
    }
}


module.exports = {
    allArticle,
    addArticlePage,
    addArticle,
    updateArticlePage,
    updateArticle,
    deleteArticle
}