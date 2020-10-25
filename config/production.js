// production환경에서 mongoDB를 사용할 때 (heroku환경에서)
module.exports = {
   // MONGO_URI: Heroku에 있음
   mongoURI: process.env.MONGO_URI,
};
