"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateDocText, updateCasePrivacyNotes } from "./actions"
import { Loader2, Pencil } from "lucide-react"

type Doc = { id: string; type: string; raw_text: string | null } | null

export function DocEditTabs({
  caseId,
  resumeDoc,
  jdDoc,
  materialDoc,
  privacyNotes,
}: {
  caseId: string
  resumeDoc: Doc
  jdDoc: Doc
  materialDoc: Doc
  privacyNotes: string | null
}) {
  return (
    <Tabs defaultValue="resume">
      <TabsList>
        <TabsTrigger value="resume">旧简历</TabsTrigger>
        <TabsTrigger value="jd">目标 JD</TabsTrigger>
        <TabsTrigger value="material">项目材料</TabsTrigger>
        <TabsTrigger value="privacy">隐私说明</TabsTrigger>
      </TabsList>

      <TabsContent value="resume">
        <EditableDocCard
          caseId={caseId}
          label="旧简历"
          description="候选人提交的原始简历文本。"
          doc={resumeDoc}
          emptyText="暂未提交简历。"
        />
      </TabsContent>

      <TabsContent value="jd">
        <EditableDocCard
          caseId={caseId}
          label="目标 JD"
          description="候选人提交的目标职位描述。"
          doc={jdDoc}
          emptyText="暂未提交 JD。"
        />
      </TabsContent>

      <TabsContent value="material">
        <EditableDocCard
          caseId={caseId}
          label="项目材料"
          description="候选人提交的补充材料与作品链接。"
          doc={materialDoc}
          emptyText="暂未提交项目补充材料。"
        />
      </TabsContent>

      <TabsContent value="privacy">
        <PrivacyEditCard caseId={caseId} currentValue={privacyNotes} />
      </TabsContent>
    </Tabs>
  )
}

function EditableDocCard({
  caseId,
  label,
  description,
  doc,
  emptyText,
}: {
  caseId: string
  label: string
  description: string
  doc: Doc
  emptyText: string
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(doc?.raw_text ?? "")
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    if (!doc) return
    startTransition(async () => {
      const result = await updateDocText(doc.id, caseId, text)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("保存成功")
        setEditing(false)
      }
    })
  }

  const handleCancel = () => {
    setText(doc?.raw_text ?? "")
    setEditing(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{label}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {doc && !editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            编辑
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editing && doc ? (
          <div className="space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[300px]"
              disabled={isPending}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={isPending}>
                {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                保存
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} disabled={isPending}>
                取消
              </Button>
            </div>
          </div>
        ) : doc?.raw_text ? (
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/30 rounded-md p-4 max-h-[400px] overflow-auto">
            {doc.raw_text}
          </pre>
        ) : (
          <p className="text-muted-foreground text-sm">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  )
}

function PrivacyEditCard({
  caseId,
  currentValue,
}: {
  caseId: string
  currentValue: string | null
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(currentValue ?? "")
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateCasePrivacyNotes(caseId, text)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("保存成功")
        setEditing(false)
      }
    })
  }

  const handleCancel = () => {
    setText(currentValue ?? "")
    setEditing(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>隐私说明</CardTitle>
          <CardDescription>候选人标注的隐私与敏感信息。</CardDescription>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            编辑
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px]"
              disabled={isPending}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={isPending}>
                {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                保存
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} disabled={isPending}>
                取消
              </Button>
            </div>
          </div>
        ) : currentValue ? (
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/30 rounded-md p-4 max-h-[400px] overflow-auto">
            {currentValue}
          </pre>
        ) : (
          <p className="text-muted-foreground text-sm">无特殊隐私说明。</p>
        )}
      </CardContent>
    </Card>
  )
}
