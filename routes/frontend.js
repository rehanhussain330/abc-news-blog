const express = require('express')
const router = express.Router()

const siteController = require('../controllers/siteController.js')
const loadCommonData = require('../middleware/loadCommonData.js')


router.use(loadCommonData)

router.get('/', siteController.index)
router.get('/category/:name', siteController.articleByCategory)
router.get('/single/:id', siteController.singleArticle)
router.get('/search', siteController.search)
router.get('/author/:name', siteController.author)
router.post('/single/:id/comment', siteController.addComment)
router.get('/testing', siteController.testing)

// 404 middleware

router.use((req, res, next) => {
    res.status(404).render('404', {
        message: 'Page Not Found!'
    })
})  


router.use((err, req, res, next) => {
    const status = err.status || 500

    res.status(status).render('errors', {
        message:err.message || 'Something Went Wrong',
        status
    })
})

module.exports = router