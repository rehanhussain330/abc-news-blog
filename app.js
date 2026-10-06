const express = require("express")

const app = express()

const mongoose = require('mongoose')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const minifyHTML = require('express-minify-html-terser')
const compression = require('compression')

require('dotenv').config()

const port = process.env.PORT || 3000

// middleware

app.use(express.json())
app.use(express.urlencoded({ extended: true })) 
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
app.use(
    "/tabulator",
    express.static( 
        path.join(__dirname, "node_modules/tabulator-tables/dist")
    )
)
app.use(expressLayouts)
app.set('layout', 'layout')
app.use(compression({ level:9, threshold: 10 * 1024 }))
app.use(minifyHTML({
    override: true,
    exception_pages: [],
    htmlMinifier: {
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: false,
        collapseWhitespace: true,
        conservativeCollapse: false,
        decodeEntities: true,
        html5: true,
        minifyCSS: true,
        minifyJS: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        sortAttributes: true,
        sortClassName: true,
        trimCustomFragments: true,
        useShortDoctype: true,
    },
}))

// view engine

app.set('view engine', 'ejs')

// database connection

mongoose.connect(process.env.MONGODB_URI)

// routes

app.use('/admin', (req, res, next) => {
    res.locals.layout = 'admin/layout'
    next()
})

app.use('/admin', require('./routes/admin.js'))


app.use('/', require('./routes/frontend.js'))


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})