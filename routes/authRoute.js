const express = require('express')
const router = express.Router()
const { loginController, registerController, logoutController, refreshController } = require('../controllers/auth')

router.route('/login').post(loginController)
router.route('/logout').post(logoutController)
router.route('/register').post(registerController)
router.route('/refresh').get(refreshController)


module.exports = router
