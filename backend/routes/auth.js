const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const fetchuser = require("../middleware/fetchuser");
const { response } = require('express');

const JWT_SECRET = 'Rajeshisagoodb$oy';

//Route:1 creating user using: POST /api/auth/createuser .No login required
router.post('/createuser', [
    body('name', 'Enter valid name').isLength({ min: 3 }),
    body('email', 'Enter valid email').isEmail(),
    body('password', 'Password length must be greater than 5').isLength({ min: 5 }),
], async (req, res) => {
    let success = false
    //if there are errors then return bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    //chceck whether the user with this email already exist
    try {
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ success, error: "the user with this email already exist" })
        }

        const salt = await bcrypt.genSalt(10);
        const securedPass = await bcrypt.hash(req.body.password, salt);
        //crearing user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: securedPass
        });
        const data = {
            user: user.id
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        // res.json(user)
        success = true
        res.json({ success, authtoken })
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error");
    }
})

//Route2: authenticating user using: POST /api/auth/login .No login required
router.post('/login', [
    body('email', 'Enter valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {
    let success = false;
    //if there are errors then return bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            success = false;
            return res.status(400).send({ success, error: 'Please try to login with correct credentials' });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).send({ success, error: 'Please try to login with correct credentials' });
        }
        const data = {
            user: user.id
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.send({ success, authtoken });
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error");
    }
})

//Route3: get loggedin user details using: POST api/auth/getuser .Login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error");
    }
})

//Router4: get all the users 
router.get('/getalluser', async (req, res) => {
    const user = await User.find({});
    res.send(user);
})

module.exports = router;