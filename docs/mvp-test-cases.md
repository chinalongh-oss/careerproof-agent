# CareerProof Agent MVP — 手工回归测试用例

## 测试前提
- 启动 `pnpm dev`
- 确保 Supabase 连接正常
- 确保 LLM API Key 有效
- 准备一份测试简历文本和一份 JD 文本

---

## 1. 提交 Case
- [ ] 访问 `/submit`
- [ ] 填写候选人姓名、邮箱、当前岗位、目标方向、目标岗位
- [ ] 粘贴简历文本
- [ ] 粘贴 JD 文本
- [ ] 点击提交
- [ ] **期望**：跳转到成功页面，显示 caseId

## 2. 解析简历
- [ ] 在 admin 工作流面板点击「解析简历」
- [ ] **期望**：状态更新为 `parsed`，candidate_profiles 表有记录
- [ ] 查看 `/admin/cases/{caseId}` 的文档编辑区，简历文本存在

## 3. 生成项目证据卡
- [ ] 点击「生成项目证据卡」
- [ ] **期望**：状态更新为 `evidence_ready`，project_cards 表有记录
- [ ] 查看 `/admin/cases/{caseId}/evidence`，项目卡片显示

## 4. 解析 JD
- [ ] 点击「解析 JD」
- [ ] **期望**：状态更新为 `jd_ready`，job_descriptions 表有记录
- [ ] 查看 `/admin/cases/{caseId}/jd`，JD 解析结果显示

## 5. 生成职业指纹
- [ ] 点击「生成职业指纹」
- [ ] **期望**：状态更新为 `fingerprint_ready`，career_fingerprints 表有记录

## 6. 生成定位
- [ ] 点击「生成职业定位」
- [ ] **期望**：状态更新为 `positioning_ready`，positionings 表有多个记录
- [ ] 查看 `/admin/cases/{caseId}/positioning`
- [ ] **期望**：显示多个定位策略可选

## 7. 选择定位
- [ ] 点击其中一个定位的「选择」按钮
- [ ] **期望**：toast 显示"已选择此定位策略"，该定位标记为 selected=true

## 8. 生成简历和主页
- [ ] 点击「生成简历和主页」
- [ ] **期望**：状态更新为 `outputs_ready`
- [ ] 查看 `/admin/cases/{caseId}/outputs`
- [ ] **期望**：resume_markdown 和 profile_page 都有内容

## 9. 风险审查
- [ ] 点击「运行风险审查」
- [ ] **期望**：状态更新为 `risk_reviewed`
- [ ] 查看 `/admin/cases/{caseId}/risk`
- [ ] **期望**：显示风险列表，包含 risk_type、risk_level、suggestion

## 10. PDF 导出
- [ ] 在 `/admin/cases/{caseId}/outputs` 的 resume 标签页点击「导出 PDF」
- [ ] **期望**：显示下载链接，`export_artifacts` 表有记录
- [ ] 验证 export_artifact 包含 `sha256`、`storage_path`、`source_output_id`
- [ ] **期望**：签名 URL 1 小时内有效

## 11. 发布个人主页
- [ ] 在 outputs 的 profile 标签页选择主题
- [ ] 输入 slug
- [ ] 点击「发布公开主页」
- [ ] **期望**：toast 显示"公开主页已发布"
- [ ] 点击链接打开公开主页
- [ ] **期望**：页面正常渲染，显示候选人信息

## 12. 设置主页密码
- [ ] 在 outputs 的 profile 标签页找到密码管理区域
- [ ] 输入密码并点击「设置密码」
- [ ] **期望**：toast 显示"主页密码已设置"
- [ ] 在无痕窗口中访问公开主页
- [ ] **期望**：显示密码输入页
- [ ] 输入正确密码点击「查看主页」
- [ ] **期望**：页面正常加载
- [ ] 输入错误密码
- [ ] **期望**：显示 "密码错误"

## 13. 生成面试准备包
- [ ] 点击工作流面板的「生成面试准备包」
- [ ] **期望**：状态更新为 `interview_ready`
- [ ] 查看 `/admin/cases/{caseId}/interview`
- [ ] **期望**：显示整体面试策略、风险及应对、准备清单、项目追问
- [ ] 点击「重新生成」按钮
- [ ] **期望**：版本 +1，内容重新生成

## 14. 标记交付
- [ ] 在 `/admin/cases/{caseId}/outputs` 的 delivery 标签页点击「标记已交付」
- [ ] **期望**：
  - 如果缺少 resume_markdown → 错误提示
  - 如果缺少 PDF 导出 → 错误提示
  - 如果缺少 interview_pack → 错误提示
  - 如果风险未审查 → 错误提示
  - 如果主页未发布 → 错误提示
- [ ] 满足所有条件后点击「标记已交付」
- [ ] **期望**：toast "已标记为已交付"，状态更新为 `delivered`

## 15. 未登录访问 admin
- [ ] 清除浏览器 cookie 后访问 `/admin`
- [ ] **期望**：自动跳转到 `/admin/login`
- [ ] 访问 `/admin/cases`
- [ ] **期望**：自动跳转到 `/admin/login`

## 16. 未登录访问 export API
- [ ] 清除浏览器 cookie 后直接访问 `/api/cases/{caseId}/export-pdf`
- [ ] **期望**：返回 401 `{"error":"Unauthorized"}`

## 17. 未登录访问打印页
- [ ] 清除浏览器 cookie 后直接访问 `/print/cases/{caseId}/resume`
- [ ] **期望**：自动跳转到 `/admin/login`

## 18. 未发布主页访问
- [ ] 将主页取消发布（或使用不存在/无效的 slug）
- [ ] 访问 `/p/xxx`
- [ ] **期望**：显示 404 页面

## 19. 有密码主页访问
- [ ] 将主页设置密码并发布
- [ ] 在无痕窗口访问 `/p/{slug}`
- [ ] **期望**：显示密码输入页（非 404）
- [ ] 输入正确密码 → 页面加载
- [ ] 输入错误密码 → 显示错误
- [ ] 清除密码 → 再次访问直接显示页面

## 20. admin 登录流程
- [ ] 清除 cookie 后访问 `/admin/login`
- [ ] 输入错误密码 → 显示"密码错误"
- [ ] 输入正确密码 → 跳转到 `/admin`
- [ ] 已登录状态下访问 `/admin/login` → 自动跳转到 `/admin`
- [ ] 关闭浏览器后重新打开 → 需要重新登录（session cookie）

## 21. 重建后 API 端点
- [ ] 确保 `/api/cases/{caseId}/export-pdf` 返回正确的结果
- [ ] 确保 `/api/health/supabase` 返回数据库连接状态
