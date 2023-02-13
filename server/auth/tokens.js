const jwt = require('jsonwebtoken')
const _ = require('lodash')
const helper = require('../helpers/serialize')
const models = require('../models')

const SECRET = 'secretik'

const createTokens = async (user) => {
  const createToken = await jwt.sign(
    {
      user: _.pick(user, 'id')
    },
    SECRET,
    {
      expiresIn: '10s'
    },
  )

  const createRefreshToken = await jwt.sign(
    {
      user: _.pick(user, 'id')
    },
    SECRET,
    {
      expiresIn: '2m'
    },
  )

  const verifyToken = jwt.decode(createToken, SECRET)
  const verifyRefresh = jwt.decode(createRefreshToken, SECRET)

  return {
    accessToken: createToken,
    refreshToken: createRefreshToken,
    accessTokenExpiredAt: verifyToken.exp * 1000,
    refreshTokenExpiredAt: verifyRefresh.exp * 1000 
  }
}

const refreshTokens = async (refreshToken) => {
  const user = await getUserByToken(refreshToken)
  if (user) {
    return {
      ...helper.serializeUser(user),
      ...(await createTokens(user, SECRET))
    }
  } else {
    return {}
  }
}

const getUserByToken = async (token) => {
  let userId = -1
  try {
    userId = jwt.verify(token, SECRET).user.id
  } catch (err) {
    return {}
  }
  const user = await models.getUserById(userId)
  return user
}

module.exports = {
  createTokens,
  refreshTokens,
  getUserByToken
}