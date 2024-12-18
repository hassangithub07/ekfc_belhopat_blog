const express = require('express')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const compression = require('compression')
const cors = require('cors')
const timeout = require('connect-timeout')
const httpStatus = require('http-status')
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const config = require('./config/config')
const v1Routes = require('../v1/routes')
const { errorConverter, errorHandler } = require('./middlewares/error')
const ApiError = require('./utils/ApiError')
const app = express()

// const passport = require('passport')
// const morgan = require('./config/morgan')
// const { jwtStrategy } = require('./config/passport')

// if (config.env !== 'test') {
//   app.use(morgan.successHandler)
//   app.use(morgan.errorHandler)
// }

// set security HTTP headers
app.use(helmet())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))
// enable cors
app.use(cors())
app.options('*', cors({
  origin: '*',
  credentials: true
}))
app.use(timeout('60s'))
// for uploading files. This enables to see req.files
app.use(fileUpload({ useTempFiles: false, limits: { fileSize: 50 * 1024 * 1024 } }))

// parse json request body
app.use(express.json({ limit: '50mb' }))

// parse urlencoded request body
app.use(express.urlencoded({ limit: '50mb', extended: false }))

// sanitize request data - DISABLED FOR NOW. BUT WE MUST APPLY XSS TO PREVENT ATTACKS
// app.use(xss());
app.use(mongoSanitize())

// gzip compression
app.use(compression())

app.disable('x-powered-by')
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept,Authorization',
  )
  res.header('X-Frame-Options', 'DENY') // if its required to change, update it to SAMEORIGIN and retest
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('X-Content-Type-Options', 'nosniff')
  res.header('X-XSS-Protection', '1; mode=block')
  res.header('Strict-Transport-Security', 'max-age=15552000; includeSubDomains')
  res.header('X-DNS-Prefetch-Control', 'Off')
  res.header('X-Download-Options', 'noopen')
  res.header(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'",
  )
  return next()
})

// jwt authentication
// app.use(passport.initialize())
// passport.use('jwt', jwtStrategy)

// v1 api routes
app.get('/', (req, res) => {
  res.send("Hey, it's ekfc belhopat blog chat app backend API")
})
app.use('/v1', v1Routes)

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'))
})

// convert error to ApiError, if needed
app.use(errorConverter)

// handle error
app.use(errorHandler)

module.exports = app