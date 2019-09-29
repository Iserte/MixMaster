require('dotenv/config');

const mysql = {
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  define: {
    timestamps: true,
  },
};
const mongo = {
  url: process.env.DB_MONGO_URL,
  params: {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  },
};

module.exports = { mysql, mongo };
