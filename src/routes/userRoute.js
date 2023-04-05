const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp');
const { sendWelcomeMail, sendCanellationMail } = require('../emails/account');


const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload jpg, jpeg or png'))
        }
        cb(undefined, true)
    }
})



//GET
router.get('/users/me', auth, async (req, res) => {
    res.status(200).send(req.user);
})

//POST
router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        const token = await user.GenerateToken()
        await user.save();
        sendWelcomeMail(user.email)
        res.status(201).send({ user, token });

    } catch (e) {
        res.status(400).send(e);
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({height:250,width:250}).png().toBuffer();
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error('Not Found')
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch (e) {
        res.status(404).send({error:'error'})
    }
})



router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.GenerateToken()
        res.send({ user, token });
    } catch (e) {
        res.status(400).send("nope");
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((e) => {
            return e.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send();
    }
})
router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send();
    }
})


//PATCH

router.patch('/users/me', auth, async (req, res) => {
    const updateKeys = Object.keys(req.body);
    const vaildKeys = ["name", "age", "password", "email"];

    const isValidUpdate = updateKeys.every((e) => vaildKeys.includes(e));

    if (!isValidUpdate) {
        return res.status(400).send({ invalid: "invalid properties" })
    }

    try {

        updateKeys.forEach((e) => req.user[e] = req.body[e])
        await req.user.save()
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e)
    }
})

//DELETE

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCanellationMail(req.user.email)
        res.send(req.user);
    } catch (e) {
        res.status(400).send();
    }
})

module.exports = router;