export default {
  port: process.env.PORT || 3000,
  db: {
    uri: process.env.DB_URI 
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'secret_refresh_key',
    refreshExpiresIn: '7d'
  }
};