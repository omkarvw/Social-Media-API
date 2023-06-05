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
} = require('../controllers/post')
const { multerUploads } = require('../middleware/multer')

router.route('/').post(multerUploads, createPost).get(getAllPosts)
router.route('/:userId').get(getAllPostsByUser)
router.route('/:id').get(getSinglePost).delete(deletePost)
router.route('/like/:id').post(likePost)
router.route('/unlike/:id').post(unlikePost)
// most probably will shift comment routes to diff doc once comment model is created
router.route('/comment/:id').post(addCommentToPost)

module.exports = router