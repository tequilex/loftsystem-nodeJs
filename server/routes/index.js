const express = require('express')
const router = express.Router()
const passport = require('passport')
const tokens = require('../auth/tokens')
const helper = require('../helpers/serialize') 
const formidable = require('formidable')
const db = require('../models')
const path = require('path')
const fs = require('fs')
const Jimp = require('jimp')

const auth = (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (!user || err) {
      return res.status(401).json({
        code: 401,
        message: 'Unauthorized'
      })
    }
    req.user = user
    // const u = {...helper.serializeUser(user)}
    // console.log(u);
    next()
  })(req, res, next)
}


router.post('/registration', async (req, res, next) => {
  const {username} = req.body

  const user = await db.getUserByName(username)
  if (user) {
    return res.status(409).json({
      message: `Пользователь ${username} существует`
    })
  }
  try {
    const newUser = await db.createUser(req.body)
    const token = await tokens.createTokens(newUser)
    res.json({
      ...helper.serializeUser(newUser),
      ...token
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message
    })
    
  }
})

router.post('/login', async (req, res, next) => {
  passport.authenticate(
    'local',
    {session: false},
    async (err, user, info) => {
      if (err) {
        return next(err)
      }
      if (!user) {
        return res.status(400).json({
          message: 'Не правильный логин или пароль'
        })
      }
      if (user) {
        const token = await tokens.createTokens(user)
        // console.log(token)
        res.json({
          ...helper.serializeUser(user),
          ...token
        })
      }
    }
  )(req, res, next)
})

router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.headers['authorization']
  const data = await tokens.refreshTokens(refreshToken)
  res.json({...data})
})

router.get('/profile', auth, async (req, res, next) => {
    const user = req.user
    res.json({
      ...helper.serializeUser(user)
    })
  })

  const validation = (fields, files) => {
    if (fields.newPassword === '' && fields.oldPassword !== '') {
      return {status: 'Не указан новый пароль', err: true}
    }

    if (fields.newPassword !== '' && fields.oldPassword === '') {
      return {status: 'Не указан старый пароль', err: true}
    }

    if (fields.firstName === '') return {status: 'Поле имя пустое', err: true}
    if (fields.surName === '') return {status: 'Поле фамилия пустое', err: true}
    if (fields.middleName === '') return {status: 'Поле отчество пустое', err: true}

    return {status: 'Ok', err: false}
  }


  //////////////////
router.patch('/profile', auth, async (req, res, next) => {
  const user = req.user

  const form = new formidable.IncomingForm({ keepExtensions: true })
  form.uploadDir = path.join(process.cwd(), 'upload')
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return next(err)
    }

    const valid = validation(fields, files)
    const pathToImage = path.join(process.cwd(), 'upload', files.avatar.newFilename)

    if (valid.err) {
      if (files.avatar) {
        fs.unlinkSync(pathToImage)
        return res.status(409).json({message: valid.status})
      }
    }

    if (files.avatar) {
      const image = await Jimp.read(pathToImage)
      await image.resize(384, 384)
      await image.writeAsync(pathToImage)
      const dirImage = path.join('./', files.avatar.newFilename)

      fields.image = dirImage
    }

    const newUser = await db.updateUserById(user._id, fields)
    
    if (!newUser) {
      return res.status(409).json({message: 'Проверьте старый пароль'})
    }

    if (newUser.oldImage) {
      fs.unlinkSync(path.join(process.cwd(), 'upload', newUser.oldImage))
    }

      res.json({
    ...helper.serializeUser(newUser)
  })
})
})
////////////////////

router.get('/users', auth, async (req, res) => {
  const users = await db.getUsers()
  const cutUsers = users.map(user => helper.serializeUser(user))
  res.json(cutUsers)
})

router.delete('/users/:id', auth, async (req, res) => {
  const user = await db.deleteUserById(req.params.id)
  res.json(user)
})

router.patch('/users/:id/:permission', auth, async (req, res, next) => {
  if(req.params.permission === 'permission') {
    const user = await db.changeUserPermissions(req.params.id, req.body.permission)
    res.json(user)
  } else next()
})




router.get('/news', auth, async (req, res) => {
  const news = await db.getNews()
  const cutNews = news.map(newz => helper.serializeNews(newz))
  res.json(cutNews)
})

router.post('/news', auth, async (req, res) => {
  const news = await db.createNews(req.user, req.body); ///////////!!!!!!!
  const cutNews = news.map(newz => helper.serializeNews(newz))
  console.log(req.user);
  res.json(cutNews)
})

router.patch('/news/:id', auth, async (req, res) => {
  const news = await db.updateNewsById(req.params.id, req.body)
  const cutNews = news.map(newz => helper.serializeNews(newz))
  res.json(cutNews)
})

router.delete('/news/:id', auth, async (req, res) => {
  const news = await db.deleteNewsById(req.params.id)
  const cutNews = news.map(newz => helper.serializeNews(newz) )
  res.json(cutNews)    
})

module.exports = router