const {
    followUser,
    unfollowUser,
    getAllFollowers,
    getAllFollowing,
    getSingleUser,
    getAllUsers
} = require('../controllers/user')

const express = require('express')
const router = express.Router()

router.route('/follow/:id').post(followUser)
router.route('/unfollow/:id').post(unfollowUser)
router.route('/').get(getAllUsers)
router.route('/followers/:id').get(getAllFollowers)
router.route('/following/:id').get(getAllFollowing)
router.route('/:id').get(getSingleUser)

module.exports = router