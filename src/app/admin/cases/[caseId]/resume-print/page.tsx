import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export default async function CaseResumePrintPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">简历打印</h1>
          <p className="text-muted-foreground">
            针对此案例优化的打印版简历。
          </p>
        </div>
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          打印
        </Button>
      </div>

      <Card className="max-w-3xl mx-auto print:shadow-none print:border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">张三</CardTitle>
          <CardDescription>
            zhangsan@example.com &bull; 138-0000-1234 &bull; 北京
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold border-b pb-1 mb-2">
              职业摘要
            </h3>
            <p className="text-sm text-muted-foreground">
              拥有 8 年以上经验的高级前端工程师，擅长构建大规模 Web 应用，
              具备丰富的团队管理经验和复杂项目交付能力。
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold border-b pb-1 mb-2">
              工作经历
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between">
                  <p className="font-medium">高级前端工程师</p>
                  <p className="text-sm text-muted-foreground">2022 - 至今</p>
                </div>
                <p className="text-sm text-muted-foreground">某科技公司</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
