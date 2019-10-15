const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')
const multer = require('multer')

// Create Task
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })

  try {
    await task.save()
    res.status(200).send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

const upload = multer({
  dest: 'images',
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(doc|docx)$/)) {
      callback(new Error('File must be in doc or docx format!'))
    }
    callback(undefined, true)
  }
})

// Upload Task Image
router.post('/users/me/images', upload.single('images'), (req, res) => {
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({error: error.message})
})

// Get Tasks
router.get('/tasks', auth, async (req, res) => {
  const _id = req.user._id
  const query = req.query.completed || false
  const sort = {}

  const match = {}

  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split('_')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    // const tasks = await Task.find({ owner: _id, completed: query })
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    res.send(req.user.tasks)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Get Task
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
    const task = await Task.findOne({ _id, owner: req.user._id })
    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (e) {
    res.send(500).send(e)
  }
})

// Update Task
router.patch('/tasks/:id', async (req, res) => {
  const allowedUpdates = ['description', 'completed']
  const updates = Object.keys(req.body)

  for (let i = 0; i < updates.length; i += 1) {
    const update = updates[i]

    if (!allowedUpdates.includes(update)) {
      return res.status(400).send({ error: 'Invalid Updates!' })
    }
  }

  try {
    const task = await Task.findOne({ _id: req.params.id })

    if (!task) {
      res.status(404).send();
    }

    updates.forEach((update) => task[update] = req.body[update])
    await task.save()
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Delete Task
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

    if (!task) {
      return res.status(404).send()
    }
    
    res.send(task)
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router