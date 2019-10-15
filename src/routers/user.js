const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, cancelEmail } = require('../emails/account')

// Create User
router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save() // If successful, next line will run. Else it will throw an error in which case catch block would run
    const token = await user.generateAuthToken()
    sendWelcomeEmail(user.email, user.name)
    res.status(201).send({user: user, token})
  } catch (e) {
    res.status(400).send(e)
  }
})

const upload = multer({
  limits: {
    fileSize: 2000000
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error('File must be a JPEG or PNG file!'))
    }
    callback(undefined, true)
  }
})

// Upload User Avatar
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

  const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
  req.user.avatar = buffer // only without desc 
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({error: error.message})
})

// Login User
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({user, token})
  } catch (e) {
    res.status(400).send()
  }
})

// Logout User
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
    await req.user.save()

    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

// Get Users
router.get('/users', auth, async (req, res) => {

  try {
    const users = await User.find({})
    res.send(users)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Get own profile
router.get('/users/me', auth, (req, res) => {
  res.send(req.user)
})

// Update User
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid Updates!'})
  }

  try {
    const user = req.user

    updates.forEach((update) => user[update] = req.body[update])
    await user.save() // middleware gets save -> auth

    res.send(user)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Delete User
router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    cancelEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch (e) {
    res.status(500).send()
  }
})

// Delete User Avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

// Get image
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user || !user.avatar) {
      throw new Error('No user Found!')
    }

    // Sets the response header
    res.set('Content-Type', 'image/png')
    res.send(user.avatar)

  } catch (e) {
    res.status(404).send()
  }
})

module.exports = router