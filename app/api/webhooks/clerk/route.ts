import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser, updateUser, deleteUser } from '@/lib/actions/user.actions';
import { clerkClient } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // 從環境變數中讀取 webhook 密鑰
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  // 檢查密鑰是否存在，不存在就拋出錯誤
  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    );
  }

  // 從請求中獲取 HTTP headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // 如果其中一個 header 不存在，返回 400 狀態碼
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // 從請求中讀取並解析主體
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // 使用密鑰創建一個 Svix Webhook 實例
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // 驗證 Webhook 請求的有效性
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // 取得 ID 和 type
  const { id } = evt.data;
  const eventType = evt.type;

  // 處理用戶創建事件
  if (eventType === 'user.created') {
    const { id, email_addresses, image_url, first_name, last_name, username } =
      evt.data;

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username!,
      firstName: first_name,
      lastName: last_name,
      photo: image_url,
    };

    // 創建新用戶
    const newUser = await createUser(user);

    // 如果用戶創建成功，則更新 Clerk 中的用戶元數據
    if (newUser) {
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: newUser._id,
        },
      });
    }

    // 返回 JSON 響應
    return NextResponse.json({ message: 'OK', user: newUser });
  }

  // 處理用戶更新事件
  if (eventType === 'user.updated') {
    const { id, image_url, first_name, last_name, username } = evt.data;

    const user = {
      clerkId: id,
      username: username!,
      firstName: first_name,
      lastName: last_name,
      photo: image_url,
    };

    // 更新用戶資訊
    const updatedUser = await updateUser(id, user);

    return NextResponse.json({ message: 'OK', user: updatedUser });
  }

  // 處理用戶刪除事件
  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    // 刪除用戶
    const deletedUser = await deleteUser(id!);

    return NextResponse.json({ message: 'OK', user: deletedUser });
  }

  // 如果事件類型不匹配，則返回一個空的 200 OK 響應
  return new Response('', { status: 200 });
}
