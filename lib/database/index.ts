import mongoose from 'mongoose'; // 引入 mongoDB ODM library

const MONGODB_URI = process.env.MONGODB_URI; // 從環境變數中連結 mongDB URI

// 初始化緩存：如果在全域環境中已有 mongoose 則使用該值
// 否則建立個新物件，其中包含 conn 和 promise，兩者的值皆為 null
let cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn; // 如果 cached.conn 為 true 則返回該值，以防止重複連接資料庫

  if (!MONGODB_URI) throw new Error('MONGODB_URI is missing'); // 如果 MONGODB_URI 不存在就拋出錯誤，確保程式碼不會在沒有連接資料庫的情況下啟動

  // 如果 cached.promise 已存在，則使用緩存繼續執行程式碼
  // 如果 cached.promise （初次連接）尚未被設置，則使用 mongoose 的 connect 方法建立一個新的 connect promise
  // 這個方法建立一個物件：dbName 指定連接資料庫名稱 ＆ bufferCommands 告訴 mongoose 在資料庫尚未連接前不要緩衝任何資料庫指令
  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URI, { dbName: 'evently', bufferCommands: false });

  cached.conn = await cached.promise; // 等待 promise 完成後將連接結果賦值給 cached.conn

  return cached.conn; // 返回更新後的資料庫連接，緩存在 cached 中方便重複使用
};
