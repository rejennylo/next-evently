import { type ClassValue, clsx } from 'clsx'; // 用於動態生成 class

import { twMerge } from 'tailwind-merge'; // 用於合併 tailwind class name
import qs from 'query-string'; // 用於處理 URL 參數查詢

import { UrlQueryParams, RemoveUrlQueryParams } from '@/types'; // 導入自定義類型

// cn 函數接受任意數量 calss ，將重複的部分合併返回新的 class 字符串
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // 使用 clsx 合併，並用 twMerge 去除重複的 class
}

// 接受一個物件並返回格式化後的日期/時間的物件
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    month: 'short', // abbreviated month name (e.g., 'Oct')
    day: 'numeric', // numeric day of the month (e.g., '25')
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // numeric year (e.g., '2023')
    day: 'numeric', // numeric day of the month (e.g., '25')
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    'en-US',
    dateTimeOptions
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    'en-US',
    dateOptions
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    'en-US',
    timeOptions
  );

  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

// 接受一個 file 對象並返回該文件數據的 URL
export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

// 格式化貨幣的顯示方式
export const formatPrice = (price: string) => {
  const amount = parseFloat(price); // 轉換成浮點數
  // new 一個 object，設置語言、樣式及單位，使用 format 方法格式化傳入的數字
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  return formattedPrice;
};

// 動態更新 URL 的查詢參數
export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  // 使用 query-string library 的 parse 方法將 params 從 string 轉為 object，方便之後訪問該參數
  const currentUrl = qs.parse(params);

  // 將 value 賦值給 key 屬性，更新或新增參數
  currentUrl[key] = value;

  // 使用 stringifyUrl 將 object 格式化成字符串，並將它加入當前頁面的路徑上
  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true } // 忽略 null 的查詢參數
  );
}

// 從當前 URL 的查詢參數移除指定的 key
export function removeKeysFromQuery({
  params,
  keysToRemove,
}: RemoveUrlQueryParams) {
  const currentUrl = qs.parse(params);

  // 迴圈刪除指定的 key
  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  // 返回刪除特定 key 後的 URL 字符串
  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

// 錯誤處理，用來記錄及拋出錯誤訊息
export const handleError = (error: unknown) => {
  console.error(error);
  throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
};
