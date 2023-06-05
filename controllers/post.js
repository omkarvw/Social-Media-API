const Post = require('../models/posts')
const User = require('../models/users')
const Comment = require('../models/Comment')
const { NotFoundError } = require('../errors')

const createPost = async (req, res) => {
    const { userId } = req.user
    const post = await Post.create({ createdById: userId, ...req.body })
    res.status(200).json(post)
}

const getAllPosts = async (req, res) => {
    const user = await User.findById(req.user.userId)
    const posts = await Post.find({
        createdById: req.user.userId
    }).sort({ createdAt: -1 })
    res.status(200).json({ posts, count: posts.length, username: user.username, userProfilePicture: user.userProfilePicture })
}

const getSinglePost = async (req, res) => {
    const { id: postId } = req.params
    const post = await Post.findById({
        _id: postId
    })
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
        const { _id, postID, userID, mainComment, createdAt, updatedAt } = comments[i]
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

const deletePost = async (req, res) => {
    const { id: postId } = req.params
    const post = await Post.findById(req.params.id)
    if (!post) {
        throw NotFoundError(`No post with id ${postId} exists`)
    }
    if (post.createdById != req.user.userId) return res.status(400).json("You can't delete this post.")
    await post.delete()
    res.status(200).json("Post deleted successfully.")
}

const addCommentToPost = async (req, res) => {
    const { id: postId } = req.params
    const { userId } = req.user
    const { mainComment } = req.body
    const comment = await Comment.create({ postID: postId, userID: userId, mainComment })
    res.status(200).json(comment)
}

module.exports = {
    createPost,
    likePost,
    unlikePost,
    deletePost,
    addCommentToPost,
    getSinglePost,
    getAllPosts
}