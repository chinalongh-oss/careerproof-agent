# CareerProof Agent — 安全检查清单

## 1. API Key 是否只在服务端
- [ ] `DEEPSEEK_API_KEY` 只在 `.env.local` 中定义，无 `NEXT_PUBLIC_` 前缀
- [ ] `DEEPSEEK_API_KEY` 仅由 `src/lib/ai.ts` 等服务端模块使用
- [ ] 客户端代码中不存在 API Key 引用

## 2. SUPABASE_SERVICE_ROLE_KEY 是否只在服务端
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 只在 `.env.local` 中定义，无 `NEXT_PUBLIC_` 前缀
- [ ] `serviceClient` 仅在 `server-only` 模块中使用
- [ ] `serviceClient` 使用 `SUPABASE_SERVICE_ROLE_KEY`（绕过 RLS）
- [ ] 浏览器端 Supabase 客户端使用 `NEXT_PUBLIC_SUPABASE_ANON_KEY`（受 RLS 限制）

## 3. /admin 是否有密码保护
- [ ] `middleware.ts` 拦截所有 `/admin` 和 `/admin/*` 路径
- [ ] 未登录访问 `/admin` 自动跳转 `/admin/login`
- [ ] 登录 cookie `admin_token` 使用 HMAC-SHA256 签名
- [ ] Cookie 属性: `httpOnly=true`, `sameSite=lax`, `secure=true`（production）
- [ ] 使用 session cookie（浏览器关闭即失效）

## 4. /api/cases/** 是否有后台保护
- [ ] `middleware.ts` 拦截所有 `/api/cases/*` 路径
- [ ] 未登录返回 401 JSON `{ "error": "Unauthorized" }`
- [ ] API 路由自身不再做额外鉴权（已由 middleware 统一保护）

## 5. /p/[slug] 未发布是否 404
- [ ] `public_pages` RLS 策略: anon/authenticated 只能 SELECT `is_published=true` 的行
- [ ] 页面查询 `.eq("is_published", true).single()`，未发布返回 `notFound()`
- [ ] 不存在通过 URL 参数绕过发布状态的路径

## 6. password_hash 主页是否需要密码
- [ ] `public_pages.password_hash` 非空时展示密码输入页
- [ ] 密码使用 `bcryptjs` hash 存储，不存明文
- [ ] 密码 cookie `page_access_{slug}` 使用 HMAC-SHA256 签名
- [ ] 签名包含 `slug` + `password_hash`，密码变更后旧 cookie 自动失效
- [ ] 密码 cookie 属性: `httpOnly=true`, `sameSite=lax`, `secure=true`（production）

## 7. PDF signed URL 是否短时有效
- [ ] `createSignedUrl(storagePath, 3600)` 签名 1 小时有效
- [ ] Signed URL 仅返回给已登录的 admin 用户
- [ ] `export_artifacts` 记录包含 `sha256` 用于完整性校验

## 8. Storage bucket exports 是否 private
- [ ] Supabase Storage bucket `exports` 应为 private（非 public）
- [ ] 文件仅通过 signed URL 访问
- [ ] 不暴露 bucket 的公开访问 URL

## 9. 是否存在 debug/test API 暴露风险
- [ ] `/api/health/supabase` 仅返回数据库连接状态，不泄露数据
- [ ] 无 `/api/debug` 或 `/api/test` 等调试端点
- [ ] `scripts/smoke-ai.ts` 不暴露为 HTTP 端点
- [ ] 前端不包含 console.log 输出敏感信息

## 10. 环境变量检查清单
- [ ] `.env.local` 在 `.gitignore` 中（`.env*.local`）
- [ ] `.env.local.example` 不含真实密码或密钥
- [ ] `ADMIN_PASSWORD` 已设置
- [ ] `DEEPSEEK_API_KEY` 已设置
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 已设置
- [ ] `APP_URL` 已设置
- [ ] 部署平台（Vercel 等）的环境变量已配置
