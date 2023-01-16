const { findById } = require('../models/users')
const User = require('../models/users')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')


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
        // return res.status(400).json('You are already following this user.')
        throw new BadRequestError(`You already follow ${followinguser.username}`)
    }
    followeruser.following.push(followingId)
    followinguser.followers.push(followerId)
    await followeruser.save()
    await followinguser.save()
    res.status(200).json(`You are now following ${followinguser.username}`)

}

const unfollowUser = async (req, res) => {
    // res.send('unfollow user')
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

const getUserProfile = async (req, res) => {
    // res.json(req.user)
    const { id: userId } = req.params
    // res.send('all followers')
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

const getAllFollowers = async (req, res) => {
    const { id: userId } = req.params
    // res.send('all followers')
    const user = await User.findById(userId)
    if (!user) {
        throw new NotFoundError(`No user with id ${followingId}`)
    }
    // console.log(user.followers[0]);
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

const getAllFollowing = async (req, res) => {
    const { id: userId } = req.params
    // res.send('all following')
    const user = await User.findById(userId)
    if (!user) {
        throw new NotFoundError(`No user with id ${followingId}`)
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

module.exports = {
    followUser,
    unfollowUser,
    getUserProfile
    , getAllFollowers,
    getAllFollowing,
    getSingleUser
}