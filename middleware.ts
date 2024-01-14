import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [ // 不需身份驗證就可訪問的公開路由
    '/',
    '/events/:id',
    '/api/webhook/clerk',
    '/api/webhook/stripe',
    '/api/uploadthing',
  ],
  ignoredRoutes: [ // 設定要被 middleware 忽略的路由
    '/api/webhook/clerk',
    '/api/webhook/stripe',
    '/api/uploadthing',
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
