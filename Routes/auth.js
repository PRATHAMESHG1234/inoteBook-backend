const express = require('express');
const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fetchUser = require('../middleware/fetchUser');
const router = express.Router();

const JWT_SECRET = 'prathamesh';
/////////////////////////////////////Route 1: Create a User using : POST "/api/auth/createuser" no login required///////////////////////////////
router.post(
  '/createuser',
  [
    body('name', 'enter a valid name').isLength({ min: 5 }),
    body('email', 'enter a valide email').isEmail(),
    body('password', 'enter valied password').isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    //if there error return bad requast and error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      //check user with this enmail exits already

      let user = await User.findOne({ email: req.body.email });
      if (user) {
        if (!req.body.name) {
          res.status(400).send('Name is required');
        }
        return res.status(400).json({
          success,
          errors: 'sorry user with this email already exists',
        });
      }
      const salt = await bcrypt.genSalt(10);
      const securedPassword = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securedPassword,
      });
      //   .then(user => res.json(user))
      //   .catch(err =>{console.log(err)
      // res.json({error:"please enter a unique value"})})
      // res.json(user)
      console.log('user id', user);
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Intarnal server Error Occured');
    }
  }
);

///////////////////////////////////Route2: Login a User using : POST "/api/auth/login" no login required///////////////////////////////////////
router.post(
  '/login',
  [
    body('email', 'enter a valid email').isEmail(),
    body('password', 'enter valid password').isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({ errors: 'Please Enter correct credentials' });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res.status(400).json({
          success,
          error: 'Please try to login with correct credentials',
        });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Intarnal server Error Occured');
    }
  }
);

/////////////////////////////////////Route3: get logined user details of  a User using : POST "/api/auth/getuser" login required//////////////////////////////////////
router.post('/getuser', fetchUser, async (req, res) => {
  try {
    const userid = req.user.id;
    const user = await User.findById(userid).select('-password');
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Intarnal server Error Occured');
  }
});
module.exports = router;
