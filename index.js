const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');

const config = require('./config/key');

const { User } = require('./models/User');

// application/x-www-form-urlencoded
//이런 데이터를(url) 분석해서 가져올 수 있게 해주는 코드.
app.use(bodyParser.urlencoded({ extended: true }));

// application/json
//이런 타입의(json) 데이터를 분석해서 가져올 수 있게 해주는 코드.
app.use(bodyParser.json());

const mongoose = require('mongoose');
mongoose
   .connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
   })
   .then(() => console.log('MongoDB Connected!'))
   .catch(err => console.log(err));

app.get('/', (req, res) => {
   res.send('Hello World! 안녕하세요~');
});

app.post('/register', (req, res) => {
   // 회원가입 시 필요한 정보들을 client에서 가져오면
   // 그것들을 데이터베이스에 넣어준다.

   // User schema를 가져와서 담는 user이라는객체 생성
   const user = new User(req.body);

   // save: MongoDB에서 제공하는 저장시키는 메소드.
   // user객체에 저장(try-catch문 이용)
   user.save((err, userInfo) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).json({ success: true });
   });
});

app.post('/login', (req, res) => {});

app.listen(port, () => {
   console.log(`Example app listening at http://localhost:${port}!`);
});
