import { Schema, model, models } from 'mongoose';

// 創建一個物件實例，定義使用者資料的數據結構（數據類型與是否為必要/唯一）
const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  photo: { type: String, required: true },
});

// 使用 models.User 檢查 mongoose 當前的上下文，確認 User 這個模型是否已存在
// 如果沒有就用 model 建立一個新的 User 模型並指定它的資料結構為 UserSchema
const User = models.User || model('User', UserSchema);

export default User;
