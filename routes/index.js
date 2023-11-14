const express = require('express')
const router = express.Router()
const { body, validationResult } = require("express-validator");
const UserModel = require('../models/User')
const PostModel = require('../models/Post')
const bcrypt = require('bcryptjs');
const passport = require('../authentication');

router.get('/', async function(req, res){ 
    const posts = await PostModel.find().sort({createdAt: -1}).populate('user_id').exec()
    res.render('home', {user: req.user, posts})
})

router.get('/signin', function(req, res){ 
    const user = req.user
    if (user) return res.redirect('/')
    res.render('signin', {user: false, errors: req.session.messages || [], username: false})
    req.session.destroy()
})

router.post(
    '/signin', 
    passport.authenticate("local", {
        successRedirect: '/',
        failureMessage: 'Invalid username or password',
        failureRedirect: "/signin"
    })
)

router.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
});

router.get('/signup', function(req, res){
    const user = req.user
    if (user) return res.redirect('/')
    res.render('signup', {user: false, errors: false, username: false, success: false})
})
router.post('/signup',   

    body("username")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Title must not be empty.")
        .isAlphanumeric()
        .withMessage("Username should contain only alphabets and numbers")
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

router.post(
    '/post', 
    body('title')
        .notEmpty()
        .withMessage('Title shouldn\'nt be empty')
        .escape(), 
    body('body')
        .notEmpty()
        .withMessage('Body shouldn\'nt be empty')
        .escape(), 
    async (req, res) => {
        const user = req.user
        if (!user) return res.redirect('/signin')
        const {title, body} = req.body
        const errors = validationResult(req)
        if (!errors.isEmpty()){
            return res.render('home', {username: user.username, errors, title, body})
        }
        const Post = new PostModel({
            title,
            body,
            user_id: user.id
        })
        await Post.save()
        res.redirect('/')
})

module.exports = router
