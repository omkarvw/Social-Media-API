const express = require('express')
const router = express.Router()

const {
    createPost,
    likePost,
    unlikePost,
    deletePost,
    addCommentToPost,
    getSinglePost,
    getAllPosts,
    getAllPostsByUser,
    deleteComment
} = require('../controllers/post')

router.route('/').post(createPost).get(getAllPosts)
router.route('/:userId').get(getAllPostsByUser)
router.route('/:id').get(getSinglePost).delete(deletePost)
router.route('/like/:id').post(likePost)
router.route('/unlike/:id').post(unlikePost)
router.route('/comment/:id').post(addCommentToPost)
router.route('/comment/:commentId').delete(deleteComment)

module.exports = router