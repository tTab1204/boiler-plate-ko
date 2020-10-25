// 1. mongoose 호출
const mongoose = require('mongoose') 

// 2. Model(=Table) 생성
const userSchema = mongoose.Schema({

    name: {
        type: String,
        maxlength: 50
    },
    
    email: {
        type: String,
        trim: true,
        unique: 1
    },

    password: {
        type: String,
        minlength: 50
    },

    lastname: {
        type: String,
        maxlength: 50
    },

    // 관리자를 파악하는 스키마(=컬럼)
    role: {
        type: Number,
        default: 0
    },

    image: String,
    token: {
        type: String
    },

    // 토큰 유효기간(Token Expiration)
    tokenExp: {
        type: Number
    }
})

const User = mongoose.model('User', userSchema)

module.exports = {User}