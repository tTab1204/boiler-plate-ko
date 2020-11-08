const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');

const { auth } = require('./middleware/auth');
const { User } = require('./models/User');

// application/x-www-form-urlencoded
//이런 데이터를(url) 분석해서 가져올 수 있게 해주는 코드.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.post('/api/users/register', (req, res) => {
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

app.post('/api/users/login', (req, res) => {
   // 요청된 이메일을 DB에서 있는지 찾는다.
   User.findOne({ email: req.body.email }, (err, user) => {
      if (!user)
         return res.json({
            loginSuccess: false,
            message: '제공된 이메일에 해당하는 유저가 없습니다.',
         });

      // 요청된 이메일이 DB에 있다면 비밀번호가 맞는지 확인.
      user.comparePassword(req.body.password, (err, isMatch) => {
         if (!isMatch)
            return res.json({
               loginSuccess: false,
               message: '비밀번호가 틀렸습니다.',
            });
         // 비밀번호까지 맞다면 토큰을 생성하기.
         user.generateToken((err, user) => {
            if (err) return res.status(400).send(err);

            // 토큰을 쿠키에 저장한다.
            res.cookie('x_auth', user.token).status(200).json({
               loginSuccess: true,
               userId: user._id,
            });
         });
      });
   });
});

app.get('/api/users/auth', auth, (req, res) => {
   // 여기까지 미들웨어를 통과해 왔다는 얘기는
   // 인증(Authentication)이 True라는 뜻.
   res.status(200).json({
      _id: req.user._id,
      isAdmin: req.user.role === 0 ? false : true,
      isAuth: true,
      email: req.user.email,
      name: req.user.name,
      lastname: req.user.lastname,
      role: req.user.role,
      image: req.user.image,
   });
});

app.get('/api/users/logout', auth, (res, req) => {
   User.findOneAndUpdate({ _id: req.user._id }, { token: '' }, (err, user) => {
      if (err) return res.json({ success: false, err });
      return res.json(200).send({
         success: true,
      });
   });
});

app.listen(port, () => {
   console.log(`Example app listening at http://localhost:${port}!`);
});
