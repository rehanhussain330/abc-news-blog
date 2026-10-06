const categoryModel = require('../models/Category.js')
const newsModel = require('../models/News.js')
const settingsModel = require('../models/Settings.js')
const nodeCache = require('node-cache')

const cache = new nodeCache()

const loadCommonData = async (req, res, next) => {

    try{

        let latestNews = cache.get('latestNewsCache')
        let categories = cache.get('categoriesCache')
        let settings = cache.get('settingsCache')

        if(!latestNews || !categories || !settings){
            settings = await settingsModel.findOne().lean()

            latestNews = await newsModel.find()
            .populate('category', { 'name':1, 'slug':1 })
            .populate('author', 'fullname')
            .sort({ createdAt: -1 }).limit(5).lean()

            const categoriesInUse = await newsModel.distinct('category')
            categories = await categoryModel.find({ '_id':{$in:categoriesInUse} }).lean()
            
            cache.set('latestNewsCache', latestNews, 60*60)
            cache.set('categoriesCache', categories, 60*60)
            cache.set('settingsCache', settings, 60*60)
        }

        res.locals.settings = settings || {}
        res.locals.latestNews = latestNews || []
        res.locals.categories = categories || []

        next()

    }catch(err){
        next(err)
    }
}

module.exports = loadCommonData