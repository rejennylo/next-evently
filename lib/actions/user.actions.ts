'use server';

import { revalidatePath } from 'next/cache';

import { connectToDatabase } from '@/lib/database';
import User from '@/lib/database/models/user.model';
import Order from '@/lib/database/models/order.model';
import Event from '@/lib/database/models/event.model';
import { handleError } from '@/lib/utils';

import { CreateUserParams, UpdateUserParams } from '@/types';

// 創建新用戶
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase(); // 連接到資料庫

    // 使用 mongoose 的 create 方法創建新用戶
    const newUser = await User.create(user);
    // 將取的的文檔轉成 JSON 字串，去除不必要的函式與屬性，再將 JSON 字串轉成普通的 JS 物件
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error); // 錯誤處理
  }
}

// 根據 ID 取得用戶
export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId); // 用 ID 查找用戶

    if (!user) throw new Error('User not found'); // 如果使用者不存在就拋出錯誤
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

// 更新用戶資訊
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    // 根據 clerkId 找到匹配的用戶並更新資料（找查條件, 更新內容的物件, 設置 new: true 才會更新）
    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error('User update failed');
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

// 刪除用戶
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    // 查詢數據庫找到要刪除的使用者
    const userToDelete = await User.findOne({ clerkId });

    // 如果沒有找到用戶就拋出錯誤
    if (!userToDelete) {
      throw new Error('User not found');
    }

    // 使用 Promise.all 同時執行多個數據庫更新操作，確保所有操作都已完成才執行下一步
    await Promise.all([
      // 將使用者從 'event' collection 中移除關聯
      // updateMany 是 mongoose 的方法，用於更新符合特定條件的文檔
      Event.updateMany(
        { _id: { $in: userToDelete.events } }, // 定義要被更新的文檔
        { $pull: { organizer: userToDelete._id } } // 更新的操作
      ),

      // 將使用者從 'orders' collection 中移除關聯
      Order.updateMany(
        { _id: { $in: userToDelete.orders } },
        { $unset: { buyer: 1 } }
      ),
    ]);

    // 刪除使用者
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath('/'); // 重新驗證頁面路徑，更新緩存

    // 刪除成功回傳解析後的 JSON 文檔，不成功則返回 null
    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}
