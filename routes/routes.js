const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../database/models/Users.model');

router.post('/register', async (req, res) => {
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send({ error: 'El email existe' });

  // Hash password
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });

  const savedUser = await user.save();
  return res.status(200).send({ message: 'User created', id: savedUser._id });
});
