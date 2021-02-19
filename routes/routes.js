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

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).send({ error: 'Email or password is wrong' });

  // Check if password is valid.
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(400).send({ error: 'Email or password is wrong' });

  return res.status(200).json('Logged in');
});

module.exports = router;
