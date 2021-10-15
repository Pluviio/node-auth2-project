const router = require("express").Router();
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');
const { JWT_SECRET } = require("../secrets"); // use this secret!
const bcrypt = require('bcryptjs');
const buildToken = require('../secrets/token-builder')
const Users = require('../users/users-model.js')

router.post("/register", validateRoleName, (req, res, next) => {
  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */

    const { username, password } = req.body
    

    const hash = bcrypt.hashSync(password, 8)
    Users.add({ username, password: hash, role_name: req.role_name })
      .then(newUser => {
        res.status(201).json(newUser)
      })
      .catch(next)
});


router.post("/login", checkUsernameExists, (req, res, next) => {
  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status 200
    {
      "message": "sue is back!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    The token must expire in one day, and must provide the following information
    in its payload:

    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
   */
    const { password } = req.body 
    if (bcrypt.compareSync(password, res.user.password)) {
      const token = buildToken(res.user)

      res.status(200).json({

      message: `${res.user.username} is back!`,
      token,

      })
    } else {
      res.status(401).json({message: 'Invalid credentials'})
    }
});

module.exports = router;
