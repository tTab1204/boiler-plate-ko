// 1. mongoose 호출
const mongoose = require('mongoose');

// 비밀번호 암호화(bcrypt)
const bcrypt = require('bcrypt');
const saltRounds = 10;

// 토큰 생성(jsonwebtoken)
const jwt = require('jsonwebtoken');

// 2. Model(=Table) 생성
const userSchema = mongoose.Schema({
   name: {
      type: String,
      maxlength: 50,
   },

   email: {
      type: String,
      trim: true,
      unique: 1,
   },

   password: {
      type: String,
   },

   lastname: {
      type: String,
      maxlength: 50,
   },

   // 관리자를 파악하는 스키마(=컬럼)
   role: {
      type: Number,
      default: 0,
   },

   image: String,

   token: {
      type: String,
   },

   // 토큰 유효기간(Token Expiration)
   tokenExp: {
      type: Number,
   },
});

//유저 정보를 저장하기 전에
userSchema.pre('save', function (next) {
   var user = this;
   // 비밀번호를 암호화 시킨다.

   // isModified => '비밀번호'가 변경될 때만 암호화 해준다.
   // 이메일, 이름 등이 바뀔 때는 암호화 하지 않음.
   if (user.isModified('password')) {
      bcrypt.genSalt(saltRounds, function (err, salt) {
         if (err) return next(err);

         bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
         });
      });
   } else {
      next();
   }
});

// UserSchema로 메소드 생성(comparePassword)
userSchema.methods.comparePassword = function (plainPassword, cb) {
   // plainPassword: 1234567
   // 암호화된 비밀번호: $2b$10$f9WHWN6D4XZLSnnzZkDAMeYhcG2bv5/4GUeLGSxQ19apxkUhUWJOe
   bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
   });
};

userSchema.methods.generateToken = function (cb) {
   var user = this;

   // jsonwebtoken을 이용해서 token을 생성하기
   // user._id를 String형식으로 바꿔주기
   var token = jwt.sign(user._id.toHexString(), 'secretToken');

   user.token = token;
   user.save(function (err, user) {
      if (err) return cb(err);
      cb(null, user);
   });
};

userSchema.statics.findByToken = function (token, cb) {
   var user = this;

   // 토큰을 복호화(decode)=verify 한다.
   jwt.verify(token, 'secretToken', function (err, decoded) {
      // 유저 아이디를 이용해서 유저를 찾은 다음에
      // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

      user.findOne(
         {
            _id: decoded,
            token: token,
         },
         function (err, user) {
            if (err) return cb(err);
            cb(null, user);
         },
      );
   });
};

const User = mongoose.model('User', userSchema);

module.exports = { User };
