const dotenv = require('dotenv')
const path = require('path')
const Joi = require('joi')

dotenv.config({ path: path.join(__dirname, '../../../.env.' + process.env.NODE_ENV) })

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid('production', 'development', 'qa')
      .required(),
    PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string().required().description('Mongo DB url'),
    CLIENT_URL: Joi.string().required().description('Client Portal url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    BUCKET_NAME: Joi.string().required().description('AWS bucket name'),
    AWS_ACCESS_KEY: Joi.string().required().description('AWS access key id'),
    AWS_SECRET_KEY: Joi.string().required().description('AWS secret access key'),
    AWS_REGION: Joi.string().required().description('AWS region'),
    ENCRYPTION_KEY: Joi.string().required().description('Encryption key'),
  })
  .unknown()

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  clientUrl: envVars.CLIENT_URL,
  mongoose: {
    url: envVars.DATABASE_URL,
    options: {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    //   useFindAndModify: false,
    //   useCreateIndex: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  aws: {
    bucketName: envVars.BUCKET_NAME,
    accessKeyId: envVars.AWS_ACCESS_KEY,
    secretAccessKey: envVars.AWS_SECRET_KEY,
    region: envVars.AWS_REGION,
  },
  encryption_key: envVars.ENCRYPTION_KEY,
}
