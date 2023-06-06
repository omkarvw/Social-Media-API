const {
    followUser,
    unfollowUser,
    getAllFollowers,
    getAllFollowing,
    getSingleUser,
    getAllUsers,
    updateUser,
    deleteUser
} = require('../controllers/user')

const express = require('express')
const router = express.Router()

router.route('/follow/:id').post(followUser)
router.route('/unfollow/:id').post(unfollowUser)
router.route('/').get(getAllUsers).patch(updateUser)
router.route('/followers/:id').get(getAllFollowers)
router.route('/following/:id').get(getAllFollowing)
router.route('/:id').get(getSingleUser).delete(deleteUser)

module.exports = router