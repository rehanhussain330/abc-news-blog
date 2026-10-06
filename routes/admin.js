const express = require('express')
const router = express.Router()

const articleController = require('../controllers/articleController.js')
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')
const userController = require('../controllers/userController.js')
const isLoggedin = require('../middleware/isLoggedin.js')
const isAdmin = require('../middleware/isAdmin.js')
const upload = require('../middleware/multer.js')
const isValid = require('../middleware/validation.js')

// login routes
router.get('/', userController.loginPage)
router.post('/index', isValid.loginValidation, userController.adminLogin)
router.get('/logout', userController.logout)
router.get('/dashboard', isLoggedin, userController.dashboard)
router.get('/settings', isLoggedin, isAdmin, userController.settings)
router.post('/save-settings', isLoggedin, isAdmin, upload.single('website_logo'), userController.saveSettings)

// user routes
router.get('/users', isLoggedin, isAdmin, userController.allUser)
router.get('/add-user', isLoggedin, isAdmin, userController.addUserPage)
router.post('/add-user', isLoggedin, isAdmin, isValid.userValidation, userController.addUser)
router.get('/update-user/:id', isLoggedin, isAdmin, userController.updateUserPage)
router.post('/update-user/:id', isLoggedin, isAdmin, isValid.userUpdateValidation, userController.updateUser)
router.delete('/delete-user/:id', isLoggedin, isAdmin, userController.deleteUser)

// category routes
router.get('/category', isLoggedin, isAdmin, categoryController.allCategory)
router.get('/add-category', isLoggedin, isAdmin, categoryController.addCategoryPage)
router.post('/add-category', isLoggedin, isAdmin, isValid.categoryValidation, categoryController.addCategory)
router.get('/update-category/:id', isLoggedin, isAdmin, categoryController.updateCategoryPage)
router.post('/update-category/:id', isLoggedin, isAdmin, isValid.categoryValidation, categoryController.updateCategory)
router.delete('/delete-category/:id', isLoggedin, isAdmin, categoryController.deleteCategory)

// article routes
router.get('/article', isLoggedin, articleController.allArticle)
router.get('/add-article', isLoggedin, articleController.addArticlePage)
router.post('/add-article', isLoggedin, upload.single('image'), isValid.articleValidation, articleController.addArticle)
router.get('/update-article/:id', isLoggedin, articleController.updateArticlePage)
router.post('/update-article/:id', isLoggedin, upload.single('image'), isValid.articleValidation, articleController.updateArticle)
router.delete('/delete-article/:id', isLoggedin, articleController.deleteArticle)

// comment routes
router.get('/comments', isLoggedin, commentController.allComments)
router.put('/update-comment-status/:id', isLoggedin, commentController.updateCommentStatus)
router.delete('/delete-comment/:id', isLoggedin, commentController.deleteComment)


// 404 middleware

router.use((req, res, next) => {
    res.status(404).render('admin/404', { 
        message: 'Page Not Found!',
        role:req.role 
    })
})

// 500 error handler
router.use(isLoggedin, (err, req, res, next) => {
    const status = err.status || 500
    const view = status === 400 ? 'admin/404' : 'admin/500'
    res.status(status).render(view, { 
        message: err.message || 'Something Went Wrong',
        role:req.role 
    })
})

module.exports = router