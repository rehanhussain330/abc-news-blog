const slugify = require('slugify')
const newsModel = require('../models/News.js')
const categoryModel = require('../models/Category.js')
const { validationResult } = require('express-validator')

const allCategory = async (req, res) => {
    const categories = await categoryModel.find()
    res.render('admin/categories', { categories, role: req.role })
}

const addCategoryPage = async (req, res) => {
    res.render('admin/categories/create', { role: req.role, errors:0 })
}

const addCategory = async (req, res, next) => {

    const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.render('admin/categories/create', {
            role:req.role,
            errors: errors.array().map(e => e.msg)
        })
        }

    const { name, description } = req.body
    
    try{
        const slug = slugify(name, { lower: true, strict: true })
        const existing = await categoryModel.findOne({ slug })
        if(existing){
            await categoryModel.findByIdAndDelete(existing._id)
        }
        const category = new categoryModel({ name, description, slug })
        await category.save()
        res.redirect('/admin/category')
    }catch(err){
        next(err)
    }
}

const updateCategoryPage = async (req, res, next) => {
    const id = req.params.id 
    try{
        const category = await categoryModel.findById(id)
        if(!category){
            return res.status(404).send("Category not found")
        }
        res.render('admin/categories/update', { category, role: req.role, errors:0 })
    }catch(err){
        next(err)
    }
}

const updateCategory = async (req, res, next) => {
    const id = req.params.id
    const errors = validationResult(req)
        if(!errors.isEmpty()){
            const category = await categoryModel.findById(id)
            return res.render('admin/categories/update', {
            category,
            role:req.role,
            errors: errors.array().map(e => e.msg)
        })
        }
    try{
        const {name, description} = req.body
        const slug = slugify(name, { lower: true, strict: true })
        const existing = await categoryModel.findOne({ slug, _id: {$ne:id} })
        if(existing){
            await categoryModel.findByIdAndDelete(existing._id)
        }
        const category = await categoryModel.findByIdAndUpdate(id, {name, description, slug})
        if(!category){
            return res.status(404).send("Category not found")
        }
        res.redirect("/admin/category")
    }catch(err){
        next(err)
    }
}

const deleteCategory = async (req, res, next) => {
    const id = req.params.id
    try{
    const category = await categoryModel.findById(id)
    if(!category){
        return res.status(404).send("Category not found")
    }

    const article = await newsModel.findOne({ category: id })
    if(article){
        return res.status(400).json({ success:false, message:'Category is associated with article' })
    }

    await category.deleteOne()
    res.json({ success:true })
    }catch(err){
        next(err)
    }
}

module.exports = {
    allCategory,
    addCategoryPage,
    addCategory,
    updateCategoryPage,
    updateCategory,
    deleteCategory
}
