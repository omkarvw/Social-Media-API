const Post = require('../models/posts')
const User = require('../models/users')
const Comment = require('../models/Comment')
const { NotFoundError } = require('../errors')
const { cloudinaryConfig } = require('../config/cloudinary')
const cloudinary = require('cloudinary').v2
const fs = require('fs')

// uploads post picture to cloudinary
// creates post in db
const createPost = async (req, res) => {

    const { userId } = req.user
    if (req.files && req.files.image) {
        const file = req.files.image
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
            throw new BadRequestError('Only jpg and png files are allowed')
        }
        cloudinaryConfig()
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "test",
        })
        req.body.postPicturePath = result.secure_url
    }
    const dir = './tmp'
    fs.rm(dir, { recursive: true }, (err) => {
        if (err) {
            throw err;
        }
        console.log('deleted');
    })
    const post = await Post.create({ createdById: userId, ...req.body })
    res.status(200).json(post)
}

// gets all posts by the logged in user
const getAllPostsByUser = async (req, res) => {
    const user = await User.findById(req.user.userId).lean()
    const posts = await Post.find({
        createdById: req.user.userId
    }).sort({ createdAt: -1 }).lean()
    res.status(200).json({ posts, count: posts.length, username: user.username, userProfilePicture: user.userProfilePicture })
}

// gets all posts by users followed by the logged in user
const getAllPosts = async (req, res) => {
    const { userId } = req.user
    const user = await User.findById(userId)
    const following = user.following
    const posts = await Post.find(
        {
            createdById: { $in: [...following] }
        }
    ).sort({ createdAt: -1 }).lean()
    const postsWithUser = await Promise.all(posts.map(
        async post => {
            const user = await User.findById(post.createdById).lean()
            return { ...post, username: user.username, userProfilePicture: user.userProfilePicture }
        }
    ))
    res.status(200).json(postsWithUser)
}

// gets a single post by id
const getSinglePost = async (req, res) => {
    const { id: postId } = req.params
    const post = await Post.findById({
        _id: postId
    }).lean()
    if (!post) {
        throw NotFoundError(`No post with id ${postId} exists`)
    }
    const user = await User.findById(post.createdById)
    const comments = await Comment.find({
        postID: postId,
    })
    commentsToBeSent = []
    for (let i = 0; i < comments.length; i++) {
        const commentUser = await User.findById(comments[i].userID)
        const { _id, userID, mainComment, createdAt, } = comments[i]
        const toBePushed = {
            _id, userID, mainComment, createdAt
        }
        commentsToBeSent.push({
            comment: toBePushed,
            username: commentUser.username,
            userProfilePicture: commentUser.userProfilePicture
        })
    }
    res.status(200).json({ post, username: user.username, userProfilePicture: user.userProfilePicture, commentsToBeSent })
}

// likes a post
const likePost = async (req, res) => {
    const { id: postId } = req.params
    const post = await Post.findById(req.params.id)
    if (!post) {
        throw NotFoundError(`No post with id ${postId} exists`)
    }
    if (post.likes.includes(req.user.userId)) return res.status(400).json("You already liked this post.")
    post.likes.push(req.user.userId)
    await post.save()
    res.status(200).json("You liked this post.")
}

// unlikes a post
const unlikePost = async (req, res) => {
    const { id: postId } = req.params
    const post = await Post.findById(req.params.id)
    if (!post) {
        throw NotFoundError(`No post with id ${postId} exists`)
    }
    post.likes = post.likes.filter(like => like != req.user.userId)
    await post.save()
    res.status(200).json("You unliked this post.")
}

// deletes a post
const deletePost = async (req, res) => {
    const { id: postId } = req.params
    const post = await Post.findById(req.params.id)
    if (!post) {
        throw NotFoundError(`No post with id ${postId} exists`)
    }
    const roles = req.user.roles
    if (!roles.includes("admin") && post.createdById != req.user.userId) {
        throw new UnauthenticatedError('You are not authorized to delete this post')
    }
    await post.delete()
    res.status(200).json("Post deleted successfully.")
}

// adds a comment to a post
const addCommentToPost = async (req, res) => {
    const { id: postId } = req.params
    const { userId } = req.user
    const { mainComment } = req.body
    const comment = await Comment.create({ postID: postId, userID: userId, mainComment })
    res.status(200).json(comment)
}

// deletes a comment
// only the user who created the comment or an admin can delete a comment
const deleteComment = async (req, res) => {
    const { commentId } = req.params
    const comment = await Comment.findById(req.params.id)
    if (!comment) {
        throw NotFoundError(`No comment with id ${commentId} exists`)
    }
    const roles = req.user.roles
    if (roles.includes("admin") || comment.userID == req.user.userId) {
        await comment.delete()
        res.status(200).json("Comment deleted successfully.")
    }
    else {
        throw new UnauthenticatedError('You are not authorized to delete this comment')
    }
}
module.exports = {
    createPost,
    likePost,
    unlikePost,
    deletePost,
    addCommentToPost,
    getSinglePost,
    getAllPosts,
    getAllPostsByUser,
    deleteComment
}