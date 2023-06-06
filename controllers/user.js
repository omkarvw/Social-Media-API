const { findById } = require('../models/users')
const User = require('../models/users')
const Post = require('../models/posts')
const Comment = require('../models/Comment')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')
const { th } = require('date-fns/locale')

// adds user to following array of logged in user
const followUser = async (req, res) => {
    // res.send('follow user')
    const { userId: followerId } = req.user
    const { id: followingId } = req.params
    const followeruser = await User.findById(followerId)
    const followinguser = await User.findById(followingId)
    if (!followinguser) {
        throw new NotFoundError(`No user with id ${followingId}`)
    }
    if (followeruser.following.includes(followingId)) {
        throw new BadRequestError(`You already follow ${followinguser.username}`)
    }
    followeruser.following.push(followingId)
    followinguser.followers.push(followerId)
    await followeruser.save()
    await followinguser.save()
    res.status(200).json(`You are now following ${followinguser.username}`)

}

// removes user from following array of logged in user
const unfollowUser = async (req, res) => {
    const { userId: followerId } = req.user
    const { id: followingId } = req.params
    const followeruser = await User.findById(followerId)
    const followinguser = await User.findById(followingId)
    if (!followeruser || !followinguser) {
        throw new NotFoundError(`No user with id ${followingId}`)
    }
    if (!followeruser.following.includes(followingId)) {
        throw new BadRequestError(`You do not follow ${followinguser.username}`)
    }
    followeruser.following = followeruser.following.filter(following => following != followingId)
    followinguser.followers = followinguser.followers.filter(follower => follower != followerId)
    await followeruser.save()
    await followinguser.save()
    res.status(200).json(`You are no longer following ${followinguser.username}`)
}

// get all users
// allowed only if logged in user is admin
const getAllUsers = async (req, res) => {
    const users = await User.find().lean()
    const roles = req.user.roles
    if (!roles.includes('admin')) {
        throw new UnauthenticatedError('You are not authorized to view all users')
    }
    usersToBeSent = []
    users.map(user => {
        const { _id, username, name, userProfilePicture, from, followers, following } = user
        usersToBeSent.push({
            _id, username, name, userProfilePicture, from, followers: followers.length, following: following.length
        })
    })
    res.json({ users: usersToBeSent })
}

// gets all followers of a user
// allowed only if logged in user is following the user
const getAllFollowers = async (req, res) => {
    const { id: userId } = req.params
    const user = await User.findById(userId)
    if (!user) {
        throw new NotFoundError(`No user with id ${userId}`)
    }
    const loggedInUserIsFollower = user.followers.includes(req.user.userId)
    if (!loggedInUserIsFollower) {
        throw new UnauthenticatedError(`You are not a follower of ${user.username}. Please follow to see the followers of ${user.username}`)
    }
    const userFollowers = []
    for (let i = 0; i < user.followers.length; i++) {
        const follower = await User.findById(user.followers[i])
        const toBePushed = {
            userId: follower._id,
            username: follower.username,
            name: follower.name,
            userProfilePicture: follower.userProfilePicture,
            from: follower.from,
            followers: follower.followers.length,
            following: follower.following.length
        }
        userFollowers.push(toBePushed)
    }
    res.status(200).json({ msg: `The user ${userId} is followed by following users`, userFollowers })
}

// gets all following of a user
// allowed only if logged in user is following the user
const getAllFollowing = async (req, res) => {
    const { id: userId } = req.params
    const user = await User.findById(userId)
    if (!user) {
        throw new NotFoundError(`No user with id ${followingId}`)
    }
    const loggedInUserIsFollowing = user.followers.includes(req.user.userId)
    if (!loggedInUserIsFollowing) {
        throw new UnauthenticatedError(`You are not following ${user.username}. Please follow to see the following of ${user.username}`)
    }
    const userFollowings = []
    for (let i = 0; i < user.following.length; i++) {
        const following = await User.findById(user.following[i])
        const toBePushed = {
            userId: following._id,
            username: following.username,
            name: following.name,
            userProfilePicture: following.userProfilePicture,
            from: following.from,
            followers: following.followers.length,
            following: following.following.length
        }
        userFollowings.push(toBePushed)
    }
    res.status(200).json({ msg: `Followers of the id ${userId} are as follows`, userFollowings, })
}

// gets profile of a single user
const getSingleUser = async (req, res) => {
    const { id: userId } = req.params
    const user = await User.findById(userId)
    if (!user) {
        throw new NotFoundError(`No user with id ${userId}`)
    }
    const { followers, following, name, username, from, userProfilePicture } = user
    res.json({
        username,
        name,
        userProfilePicture,
        followers: followers.length,
        following: following.length,
        from
    })
}

// update the info of logged in user
const updateUser = async (req, res) => {
    if (req.files && req.files.image) {
        const file = req.files.image
        cloudinaryConfig()
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "test",
        })
        req.body.userProfilePicture = result.secure_url
    }
    const { userId } = req.user
    const { name, from, profession, userProfilePicture, password } = req.body
    const user = User.findById(userId)
    if (!user) {
        throw new NotFoundError(`No user with id ${userId}`)
    }
    user.name = name
    user.from = from
    user.profession = profession
    user.userProfilePicture = userProfilePicture
    user.password = password
    await user.save()
    res.status(200).json({ msg: 'User updated successfully' })
}

// allowed only for admin and the user itself
const deleteUser = async (req, res) => {
    const { id } = req.params
    const { loggedUserId } = req.user
    const roles = req.user.roles
    if (!roles.includes('admin') && loggedUserId != req.params.id) {
        throw new UnauthenticatedError('You are not authorized to delete this user')
    }
    try {
        await User.findByIdAndDelete(id)
        await Post.deleteMany({ createdById: id })
        await Comment.deleteMany({ userId: id })
    }
    catch (err) {
        throw new BadRequestError('Something went wrong')
    }
    res.status(200).json({ msg: 'User deleted successfully' })
}

module.exports = {
    followUser,
    unfollowUser,
    getAllUsers
    , getAllFollowers,
    getAllFollowing,
    getSingleUser,
    updateUser, deleteUser
}