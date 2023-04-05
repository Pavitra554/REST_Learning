const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')

// GET /tasks?complete=false 
// GET /tasks?limit=2&skip=1 
// GET /tasks?sort=createdAt:desc or aesc 
router.get('/tasks', auth, async (req, res) => {
    const match = {
        owner: req.user._id,
    }
    const sort = {
    }
    if (req.query.complete) {
        match.complete = req.query.complete === 'true' ? true : false
    }
    if (req.query.sortBy) {
        const issort = req.query.sortBy.split(':')
        sort[issort[0]] = issort[1] === 'desc' ? -1 : 1
    }
    try {
        const tasks = await Task.find(match).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip)).sort(sort)
        res.send(tasks)

    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id
    try {
        const tasks = await Task.findOne({ _id, owner: req.user._id })
        if (!tasks) {
            throw new Error('Empty')
        }
        res.send(tasks)

    } catch (e) {
        res.status(500).send(e)
    }

})

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)

    } catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updateKeys = Object.keys(req.body)
    const validKeys = ["description", "complete"]

    const isValidUpdate = updateKeys.every((e) => validKeys.includes(e))
    if (!isValidUpdate) {
        return res.status(400).send({ invalid: "invalid update field" })
    }

    try {
        // const task = await Task.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true})
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }
        updateKeys.forEach((e) => task[e] = req.body[e])
        await task.save()
        res.send(task)


    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router
