export interface NormalizedPersonalInfo {
  name: string
  email: string | null
  phone: string | null
  wechat: string | null
  city: string | null
  portfolioLinks: string | null
  targetRole: string | null
  targetDirection: string | null
  currentTitle: string | null
}

export interface CaseContactFields {
  candidate_name: string | null
  email: string | null
  wechat: string | null
  current_title: string | null
  target_role: string | null
  target_direction: string | null
}

const NAME_ALIASES = ["name", "full_name", "candidate_name", "姓名"]
const EMAIL_ALIASES = ["email", "mail", "邮箱"]
const PHONE_ALIASES = ["phone", "mobile", "tel", "telephone", "手机号", "手机", "电话", "联系电话"]
const WECHAT_ALIASES = ["wechat", "weixin", "wx", "微信"]
const CITY_ALIASES = ["city", "location", "base_city", "城市", "所在地"]
const PORTFOLIO_ALIASES = ["portfolio", "portfolio_links", "blog", "website", "personal_site", "github", "作品链接", "个人博客"]

export function getStringByAliases(
  obj: Record<string, unknown> | null | undefined,
  aliases: string[]
): string | null {
  if (!obj) return null
  for (const key of aliases) {
    const val = obj[key]
    if (typeof val === "string" && val.trim().length > 0) {
      return val.trim()
    }
  }
  return null
}

const PHONE_REGEX = /1[3-9]\d{9}/
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
const URL_REGEX = /https?:\/\/[^\s)]+/

function pickFirstMatch(text: string, regex: RegExp): string | null {
  const m = text.match(regex)
  return m ? m[0] : null
}

export function extractContactFromMarkdown(
  markdown: string | null | undefined
): Partial<NormalizedPersonalInfo> {
  if (!markdown) return {}

  const lines = markdown.split("\n")
  const headerEnd = lines.findIndex((line, i) => i > 0 && /^##\s+\S/.test(line))
  const topLines = headerEnd > 0 ? lines.slice(0, headerEnd) : lines.slice(0, 20)
  const topText = topLines.join("\n")
  const result: Partial<NormalizedPersonalInfo> = {}

  const phone = pickFirstMatch(topText, PHONE_REGEX)
  if (phone) result.phone = phone

  const email = pickFirstMatch(topText, EMAIL_REGEX)
  if (email) result.email = email

  for (const line of topLines) {
    const trimmed = line.replace(/^[#*\s]+/, "").trim()

    const wechatMatch = trimmed.match(/(?:微信|wechat|weixin|wx)[：:]\s*(.+)/i)
    if (wechatMatch && wechatMatch[1].trim()) {
      result.wechat = wechatMatch[1].trim()
    }

    const portfolioMatch = trimmed.match(/(?:作品链接|个人博客|博客|blog|github|website|portfolio)[：:]\s*(.+)/i)
    if (portfolioMatch && portfolioMatch[1].trim()) {
      result.portfolioLinks = portfolioMatch[1].trim()
    }

    const cityMatch = trimmed.match(/(?:城市|所在地|location|base_city)[：:]\s*(.+)/i)
    if (cityMatch && cityMatch[1].trim()) {
      result.city = cityMatch[1].trim()
    }

    const urlMatch = trimmed.match(URL_REGEX)
    if (urlMatch && !result.portfolioLinks) {
      result.portfolioLinks = urlMatch[0]
    }
  }

  return result
}

export function normalizePersonalInfo(
  personalInfo: Record<string, unknown> | null | undefined,
  caseFields: CaseContactFields,
  markdown: string | null | undefined
): NormalizedPersonalInfo {
  const name =
    getStringByAliases(personalInfo, NAME_ALIASES) ??
    caseFields.candidate_name ??
    ""

  const email =
    getStringByAliases(personalInfo, EMAIL_ALIASES) ??
    caseFields.email ??
    extractContactFromMarkdown(markdown).email ??
    null

  const phone =
    getStringByAliases(personalInfo, PHONE_ALIASES) ??
    extractContactFromMarkdown(markdown).phone ??
    null

  const wechat =
    getStringByAliases(personalInfo, WECHAT_ALIASES) ??
    caseFields.wechat ??
    extractContactFromMarkdown(markdown).wechat ??
    null

  const city =
    getStringByAliases(personalInfo, CITY_ALIASES) ??
    extractContactFromMarkdown(markdown).city ??
    null

  const portfolioLinks =
    getStringByAliases(personalInfo, PORTFOLIO_ALIASES) ??
    extractContactFromMarkdown(markdown).portfolioLinks ??
    null

  const targetRole = caseFields.target_role ?? null
  const targetDirection = caseFields.target_direction ?? null
  const currentTitle = caseFields.current_title ?? null

  return {
    name: name || "候选人姓名未填写",
    email,
    phone,
    wechat,
    city,
    portfolioLinks,
    targetRole,
    targetDirection,
    currentTitle,
  }
}

const IDENTITY_LINE_PATTERNS = [
  /^#\s+\S/,
  /^##\s+\S/,
  /^姓名[：:]/,
  /^\*\*姓名\*\*[：:]/,
  /^邮箱[：:]/,
  /^\*\*邮箱\*\*[：:]/,
  /^手机[：:]/,
  /^\*\*手机\*\*[：:]/,
  /^电话[：:]/,
  /^\*\*电话\*\*[：:]/,
  /^微信[：:]/,
  /^\*\*微信\*\*[：:]/,
  /^目标岗位[：:]/,
  /^\*\*目标岗位\*\*[：:]/,
  /^求职方向[：:]/,
  /^\*\*求职方向\*\*[：:]/,
  /^求职意向[：:]/,
  /^\*\*求职意向\*\*[：:]/,
  /^作品链接[：:]/,
  /^\*\*作品链接\*\*[：:]/,
  /^个人博客[：:]/,
  /^\*\*个人博客\*\*[：:]/,
  /^城市[：:]/,
  /^\*\*城市\*\*[：:]/,
  /^所在地[：:]/,
  /^\*\*所在地\*\*[：:]/,
  /^应聘职位[：:]/,
  /^\*\*应聘职位\*\*[：:]/,
]

export function stripMarkdownIdentityBlock(markdown: string | null | undefined): string {
  if (!markdown) return ""

  const lines = markdown.split("\n")

  let firstBodyIndex = -1
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (/^##\s+\S/.test(line)) {
      firstBodyIndex = i
      break
    }
  }

  if (firstBodyIndex < 0) {
    return markdown
  }

  const bodyLines = lines.slice(firstBodyIndex)
  const bodyText = bodyLines.join("\n").trim()

  if (bodyText.length === 0) {
    return markdown
  }

  return bodyText
}

export function hasIdentityInfoInMarkdownTop(markdown: string | null | undefined): boolean {
  if (!markdown) return false
  const lines = markdown.split("\n")
  const checkLines = lines.slice(0, 20)
  return checkLines.some((line) =>
    IDENTITY_LINE_PATTERNS.some((pattern) => pattern.test(line.trim()))
  )
}
