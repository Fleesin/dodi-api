const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../database/models/Users.model');

router.post('/register', async (req, res) => {
  // Verificar si el correo ya existe.
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send({ error: 'El email existe' });

  // Hash password
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Crear un nuevo usuario
  const user = new User({
    name: req.body.name,
    lName: req.body.lName,
    email: req.body.email,
    password: hashedPassword,
    direction: req.body.direction,
    tId: req.body.tId,
    id: req.body.id,
    phone: req.body.phone,
    pet: req.body.pet,

  });

  // Guardar usuariio en la base de datos.
  const savedUser = await user.save();

  // Se manda al cliente que se hizo la operacion exitosamente (Status: 200);
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

  return res.status(200).json(user);
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ error });
  }
});
module.exports = router;
