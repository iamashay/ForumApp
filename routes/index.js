const express = require('express')
const router = express.Router()
const { body, validationResult } = require("express-validator");
const UserModel = require('../models/User')
const bcrypt = require('bcryptjs');
const passport = require('passport');

router.get('/', function(req, res){ 
    res.render('home', {user: false, posts: false})
})
router.get('/signin', function(req, res){ 
    res.render('signin', {user: false, errors: false, username: false})
})
router.post('/signin', function(req, res){ 
    passport.authenticate("local", res.redirect('/'))
})
router.get('/signup', function(req, res){ 
    res.render('signup', {user: false, errors: false, username: false, success: false})
})
router.post('/signup',   

    body("username", "Title must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("username").custom(async (username) => {
        const user = await UserModel.findOne({username})
        if (user) {
            throw new Error('Username is already in use')
        }
    }),
    body("password", "Password must be of at least 4 characters.")
        .trim()
        .isLength({ min: 4 })
        .escape(),  
    async function(req, res){ 
        const {username, password} = req.body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            console.log(errors.array())
            res.render('signup', {user: false, username, errors: errors.array(), success: false})
            return
        }
        const hashedPassword = bcrypt.hashSync(req.body.password, 10)
        const User = new UserModel({
            username,
            password: hashedPassword
        })
        await User.save()
        res.render('signup', {user: false, username: false, errors: false, success: 'Successully signed up!'})

})
module.exports = router
