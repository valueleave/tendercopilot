"use client";

import type { TenderAnalysis } from "@/lib/deepseek";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Building2,
  DollarSign,
  MapPin,
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  Lightbulb,
  ClipboardList,
} from "lucide-react";

interface AnalysisResultProps {
  data: TenderAnalysis;
}

export function AnalysisResult({ data }: AnalysisResultProps) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* 项目概况 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">项目概况</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            label="项目名称"
            value={data.project_name}
          />
          <InfoCard
            icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
            label="招标单位"
            value={data.tender_company}
          />
          <InfoCard
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            label="预算金额"
            value={data.budget}
          />
          <InfoCard
            icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
            label="项目地点"
            value={data.location}
          />
        </div>
      </section>

      {/* 时间节点 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">时间节点</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            label="投标截止时间"
            value={data.deadline}
          />
          <InfoCard
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            label="开标时间"
            value={data.bid_opening_time}
          />
        </div>
      </section>

      {/* 资格要求 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">资格要求</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            {data.qualification_requirements.length > 0 ? (
              <ul className="space-y-3">
                {data.qualification_requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span className="text-sm text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">暂无数据</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 评分标准 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">评分标准</h2>
        </div>
        <Card>
          <CardContent className="p-0">
            {data.scoring_rules.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>评分项</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.scoring_rules.map((rule, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>{rule}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6">
                <p className="text-sm text-muted-foreground">暂无数据</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 风险提示 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold">风险提示</h2>
        </div>
        {data.risk_points.length > 0 ? (
          <div className="space-y-3">
            {data.risk_points.map((risk, index) => (
              <Card
                key={index}
                className="border-red-200 bg-red-50/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                  <span className="text-sm text-red-700">{risk}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">暂无数据</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* 投标建议 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold">投标建议</h2>
        </div>
        {data.suggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.suggestions.map((suggestion, index) => (
              <Card
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-4">
                  <Badge variant="success" className="mb-2">
                    建议 {index + 1}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{suggestion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">暂无数据</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="mt-0.5 rounded-lg bg-muted p-2">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            {value || "暂无数据"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
