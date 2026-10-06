const commentModel = require('../models/Comment.js')
const newsModel = require('../models/News.js')
const { validationResult } = require('express-validator')


const allComments = async (req, res) => {

    try{

        let comments;
        if(req.role === 'admin'){
             comments = await commentModel.find()
            .populate('article', 'title')
            .sort({createdAt:-1})
        }else{
            const news = await newsModel.find({ author:req.id })
            const newsIds = news.map(news => news._id)

            comments = await commentModel.find({ article:{ $in: newsIds } })
            .populate('article', 'title')
            .sort({createdAt:-1})
        }
        
        res.render('admin/comments', { comments, role: req.role })

    }catch(err){
        console.error('Error fetching comments:', err)
        res.status(500).send("Error fetching comments")
    }
}


const updateCommentStatus = async (req, res) => {
    try {
        const validStatuses = ['pending', 'approved', 'rejected']
        const { status } = req.body

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid comment status' })
        }

        const comment = await commentModel.findById(req.params.id)
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' })
        }

        const article = await newsModel.findById(comment.article)
        if (!article || article.author.toString() !== req.id) {
            return res.status(403).json({ message: 'You can only update comments on your own articles' })
        }

        comment.status = status
        await comment.save()

        return res.status(200).json({ message: 'Comment status updated successfully' })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Unable to update comment status' })
    }
}

const deleteComment = async (req, res) => {
    try {
        const comment = await commentModel.findById(req.params.id)
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' })
        }

        const article = await newsModel.findById(comment.article)
        if (!article || article.author.toString() !== req.id) {
            return res.status(403).json({ message: 'You can only delete comments on your own articles' })
        }

        await comment.deleteOne()

        return res.status(200).json({ message: 'Comment deleted successfully' })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Unable to delete comment' })
    }
}

module.exports = { allComments, updateCommentStatus, deleteComment }