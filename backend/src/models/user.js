import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
  username: String,
  hashedPassword: String,
});

// 인스턴스 메서드 정의
// 모델을 통해 만든 문서 인스턴스에서 사용할 수 있는 함수
// this에 접근해야 하기 때문에 화살표 함수가 아닌 function 키워드 사용
// 여기서 this는 문서 인스턴스

UserSchema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

UserSchema.methods.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result; // boolean
};

// hashedPassword 필드를 클라이언트에 응답하지 않도록 하기 위한 함수
UserSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
};

UserSchema.methods.generateToken = function () {
  const token = jwt.sign(
    {
      _id: this.id,
      username: this.username,
    }, // 파라미터 1 : 토큰 안에 넣고 싶은 데이터
    process.env.JWT_SECRET, // 파라미터 2 : JWT 암호
    {
      expiresIn: '7d', // 파라미터 3 : 유효기간 (여기서는 7일 동안 유효함)
    },
  );
  return token;
};

// 스태틱 메서드 정의
// 모델에서 바로 사용할 수 있는 함수
// 여기서 this는 모델(User)

UserSchema.statics.findByUsername = function (username) {
  return this.findOne({ username });
};

const User = mongoose.model('User', UserSchema);
export default User;
