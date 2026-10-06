const categoryModel = require('../models/Category.js')
const newsModel = require('../models/News.js')
const userModel = require('../models/User.js')
const commentModel = require('../models/Comment.js')
const settingsModel = require('../models/Settings.js')
const paginate = require('../utils/paginate.js')
const createError = require('../utils/error-message.js')

const index = async (req, res) => {

    const news = await paginate(newsModel, {}, req.query, {
        populate:[
            { path: 'category', select: 'name slug' },
            { path: 'author', select: 'fullname' }
        ],
        sort:'-createdAt'
    })

    res.render('index', { news, query: req.query })
}

const articleByCategory = async (req, res, next) => {

    const category = await categoryModel.findOne({ slug:req.params.name })
    if(!category){
        return next(createError('Category Not Found!', 404))
    }

    const news = await paginate(newsModel, { category:category._id }, req.query, {
        populate:[
            { path: 'category', select: 'name slug' },
            { path: 'author', select: 'fullname' }
        ],
        sort:'-createdAt'
    })

    res.render('category', { news, category, query: req.query })
}

const singleArticle = async (req, res, next) => {
    const singleNews = await newsModel.findById(req.params.id)
    .populate('category', { 'name':1, 'slug':1 })
    .populate('author', 'fullname')
    .sort({ 'createdAt': -1 })

    if(!singleNews) return next(createError('Article Not Found!', 404))

    const comments = await commentModel.find({ article:req.params.id, status:'approved' })
    .sort('-createdAt')

    res.render('single', { singleNews, comments })
}

const search = async (req, res) => {

    const searchQuery = req.query.search

    const news = await paginate(newsModel, {
        $or:[
            { title: { $regex: searchQuery, $options:'i' } },
            { content: { $regex: searchQuery, $options:'i' } }
        ]
    }, 
    req.query, {
        populate:[
            { path: 'category', select: 'name slug' },
            { path: 'author', select: 'fullname' }
        ],
        sort:'-createdAt'
    })

    res.render('search', { news, searchQuery, query: req.query })
}

const author = async (req, res, next) => {
    const author = await userModel.findOne({ _id:req.params.name })
    if(!author){
        return next(createError('Author Not Found!', 404))
    }

     const news = await paginate(newsModel, { author: req.params.name }, req.query, {
        populate:[
            { path: 'category', select: 'name slug' },
            { path: 'author', select: 'fullname' }
        ],
        sort:'-createdAt'
    })

    res.render('author', { news, author, query: req.query })
}

const addComment = async (req, res) => {
    try{
        const { name, email, content } = req.body
        const comment = new commentModel({ name, email, content, article: req.params.id })
        await comment.save()
        res.redirect(`/single/${req.params.id}`)
    }catch(err){
        return next(createError('Error Adding Comment!', 500))
    }
}


const testing = async (req, res) => {
    const news = await newsModel.find()
    res.json(news)
}

module.exports = {
    index,
    articleByCategory,
    singleArticle,
    search,
    author,
    addComment,
    testing
}

