"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  FileText,
  Target,
  Shield,
} from "lucide-react"

// 模拟质量评审数据
const reviewData = {
  overallScore: 88,
  status: "待审核",
  dimensions: [
    {
      name: "证据完整性",
      score: 92,
      status: "pass",
      details: "12/13 个证据卡已完善，1个待补充",
    },
    {
      name: "JD 匹配度",
      score: 88,
      status: "pass",
      details: "核心要求匹配度高，2个次要要求未覆盖",
    },
    {
      name: "数据可信度",
      score: 85,
      status: "warning",
      details: "3个数据点需要补充来源说明",
    },
    {
      name: "表达专业性",
      score: 90,
      status: "pass",
      details: "语言表达专业，STAR结构完整",
    },
    {
      name: "风险控制",
      score: 82,
      status: "warning",
      details: "2个潜在风险点需要准备应对话术",
    },
  ],
  checklistItems: [
    { id: 1, label: "证据卡 STAR 结构完整", checked: true },
    { id: 2, label: "数据指标有来源支撑", checked: true },
    { id: 3, label: "时间线无逻辑漏洞", checked: true },
    { id: 4, label: "职业定位与 JD 匹配", checked: true },
    { id: 5, label: "敏感信息已脱敏", checked: false },
    { id: 6, label: "风险点已识别并准备话术", checked: false },
    { id: 7, label: "简历格式符合规范", checked: true },
    { id: 8, label: "联系方式已核实", checked: true },
  ],
  comments: [
    {
      id: 1,
      user: "运营专员",
      avatar: "YY",
      content: "证据卡#3的数据增长率需要补充计算方式说明",
      time: "2小时前",
      resolved: false,
    },
    {
      id: 2,
      user: "质量审核员",
      avatar: "QA",
      content: "建议在面试准备包中增加关于团队冲突处理的案例",
      time: "4小时前",
      resolved: true,
    },
  ],
}

export default function ReviewPage() {
  const [newComment, setNewComment] = useState("")
  const [reviewStatus, setReviewStatus] = useState(reviewData.status)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">质量评审</h1>
          <p className="text-muted-foreground mt-1">
            运营人员对案例进行最终质量把控
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={reviewStatus} onValueChange={setReviewStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="待审核">待审核</SelectItem>
              <SelectItem value="审核中">审核中</SelectItem>
              <SelectItem value="需修改">需修改</SelectItem>
              <SelectItem value="已通过">已通过</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <ThumbsDown className="mr-2 h-4 w-4" />
            打回修改
          </Button>
          <Button>
            <ThumbsUp className="mr-2 h-4 w-4" />
            审核通过
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左侧：评分和检查项 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 总体评分 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                质量评分
              </CardTitle>
              <CardDescription>基于多维度自动评估的质量分数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8 mb-6">
                <div className="relative">
                  <svg className="h-32 w-32 -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${reviewData.overallScore * 3.52} 352`}
                      className="text-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{reviewData.overallScore}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {reviewData.dimensions.map((dim) => (
                    <div key={dim.name} className="flex items-center gap-3">
                      {getStatusIcon(dim.status)}
                      <span className="w-24 text-sm">{dim.name}</span>
                      <Progress value={dim.score} className="flex-1 h-2" />
                      <span className="w-10 text-sm text-right">{dim.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 详细检查项 */}
          <Card>
            <CardHeader>
              <CardTitle>检查清单</CardTitle>
              <CardDescription>运营人员需确认的关键检查项</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {reviewData.checklistItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      item.checked ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    {item.checked ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                    )}
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 维度详情 */}
          <div className="grid gap-4 md:grid-cols-2">
            {reviewData.dimensions.map((dim) => (
              <Card key={dim.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getStatusIcon(dim.status)}
                      {dim.name}
                    </CardTitle>
                    <Badge
                      variant={
                        dim.status === "pass"
                          ? "default"
                          : dim.status === "warning"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {dim.score}分
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{dim.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 右侧：评论和快捷操作 */}
        <div className="space-y-6">
          {/* 快捷跳转 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">快捷跳转</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                查看证据卡
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="mr-2 h-4 w-4" />
                查看定位方案
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                查看风险审查
              </Button>
            </CardContent>
          </Card>

          {/* 评论区 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                审核意见
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 评论列表 */}
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {reviewData.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`rounded-lg border p-3 ${
                      comment.resolved ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{comment.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{comment.user}</span>
                      <span className="text-xs text-muted-foreground">{comment.time}</span>
                      {comment.resolved && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          已解决
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                ))}
              </div>

              {/* 添加评论 */}
              <div className="space-y-2">
                <Textarea
                  placeholder="添加审核意见..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-20"
                />
                <Button className="w-full" disabled={!newComment.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  发送意见
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 审核历史 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                审核历史
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <div className="flex-1">
                    <div>提交审核</div>
                    <div className="text-xs text-muted-foreground">2024-01-15 14:30</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <div>运营专员开始审核</div>
                    <div className="text-xs text-muted-foreground">2024-01-15 15:00</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="text-muted-foreground">等待最终审核</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
