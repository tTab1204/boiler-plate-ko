// 1. mongoose 호출
const mongoose = require('mongoose');

// 비밀번호 암호화(bcrypt)
const bcrypt = require('bcrypt');
const saltRounds = 10;

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
      maxlength: 50,
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
   let user = this;
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

const User = mongoose.model('User', userSchema);

module.exports = { User };
