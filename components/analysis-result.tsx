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
  Hash,
  Users,
  Landmark,
  Scale,
  Wrench,
  FileCheck,
  FileSignature,
  Gavel,
  Target,
  TrendingUp,
  AlertCircle,
  Info,
  CheckCircle2,
  HelpCircle,
  Layers,
  BookOpen,
  FileBox,
} from "lucide-react";

interface AnalysisResultProps {
  data: TenderAnalysis;
}

export function AnalysisResult({ data }: AnalysisResultProps) {
  const hasTimeline = Object.values(data.timeline).some((v) => v && v !== "未提及");
  const hasFinancial = data.financial_requirements.bid_bond_amount || data.financial_requirements.performance_bond;
  const hasOverview = Object.values(data.project_overview).some((v) => v && v !== "未提及");
  const hasQual = Object.values(data.qualification_requirements).some((arr) => arr.length > 0);
  const hasScoring = data.scoring_rules.scoring_items.length > 0;
  const hasTech = Object.values(data.technical_highlights).some((arr) => arr.length > 0);
  const hasBid = Object.values(data.bid_document_requirements).some((v) => {
    if (Array.isArray(v)) return v.length > 0;
    return !!v && v !== "未提及";
  });
  const hasContract = Object.values(data.contract_highlights).some((v) => {
    if (Array.isArray(v)) return v.length > 0;
    return !!v && v !== "未提及";
  });
  const hasRisk = Object.values(data.risk_analysis).some((arr) => arr.length > 0);
  const hasStrategy = Object.values(data.bidding_strategy).some((v) => {
    if (Array.isArray(v)) return v.length > 0;
    return !!v && v !== "未提及";
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Project Identifier Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-foreground break-words">
                {data.project_name || "未命名项目"}
              </h1>
              {data.project_number && data.project_number !== "未提及" && (
                <p className="mt-1 text-sm text-muted-foreground">
                  项目编号：{data.project_number}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-3">
                <Badge variant="outline" className="gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {data.tender_company || "未提及"}
                </Badge>
                {data.tender_agent && data.tender_agent !== "未提及" && (
                  <Badge variant="outline" className="gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {data.tender_agent}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {hasTimeline && (
        <Section icon={<Calendar className="h-5 w-5 text-primary" />} title="关键时间节点">
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-4">
              {data.timeline.bid_deadline && data.timeline.bid_deadline !== "未提及" && (
                <TimelineItem icon={<Clock className="h-4 w-4" />} label="投标截止时间" value={data.timeline.bid_deadline} color="text-red-500" />
              )}
              {data.timeline.bid_opening_time && data.timeline.bid_opening_time !== "未提及" && (
                <TimelineItem icon={<Clock className="h-4 w-4" />} label="开标时间" value={data.timeline.bid_opening_time} color="text-orange-500" />
              )}
              {data.timeline.document_period && data.timeline.document_period !== "未提及" && (
                <TimelineItem icon={<FileText className="h-4 w-4" />} label="文件获取时间" value={data.timeline.document_period} color="text-blue-500" />
              )}
              {data.timeline.pre_bid_meeting && data.timeline.pre_bid_meeting !== "未提及" && (
                <TimelineItem icon={<Users className="h-4 w-4" />} label="答疑会/标前会" value={data.timeline.pre_bid_meeting} color="text-purple-500" />
              )}
              {data.timeline.site_visit && data.timeline.site_visit !== "未提及" && (
                <TimelineItem icon={<MapPin className="h-4 w-4" />} label="现场踏勘" value={data.timeline.site_visit} color="text-green-500" />
              )}
              {data.timeline.bid_validity && data.timeline.bid_validity !== "未提及" && (
                <TimelineItem icon={<Shield className="h-4 w-4" />} label="投标有效期" value={data.timeline.bid_validity} color="text-cyan-500" />
              )}
            </div>
          </div>
        </Section>
      )}

      {/* Project Overview */}
      {hasOverview && (
        <Section icon={<Info className="h-5 w-5 text-primary" />} title="项目概况">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.project_overview.location && data.project_overview.location !== "未提及" && (
              <InfoCardSmall icon={<MapPin className="h-4 w-4" />} label="建设地点" value={data.project_overview.location} />
            )}
            {data.project_overview.scale && data.project_overview.scale !== "未提及" && (
              <InfoCardSmall icon={<Layers className="h-4 w-4" />} label="建设规模" value={data.project_overview.scale} />
            )}
            {data.project_overview.funding_source && data.project_overview.funding_source !== "未提及" && (
              <InfoCardSmall icon={<Landmark className="h-4 w-4" />} label="资金来源" value={data.project_overview.funding_source} />
            )}
            {data.project_overview.budget && data.project_overview.budget !== "未提及" && (
              <InfoCardSmall icon={<DollarSign className="h-4 w-4" />} label="预算金额" value={data.project_overview.budget} />
            )}
            {data.project_overview.contract_period && data.project_overview.contract_period !== "未提及" && (
              <InfoCardSmall icon={<Calendar className="h-4 w-4" />} label="工期要求" value={data.project_overview.contract_period} />
            )}
            {data.project_overview.quality_standard && data.project_overview.quality_standard !== "未提及" && (
              <InfoCardSmall icon={<CheckCircle2 className="h-4 w-4" />} label="质量标准" value={data.project_overview.quality_standard} />
            )}
          </div>
        </Section>
      )}

      {/* Financial Requirements */}
      {hasFinancial && (
        <Section icon={<DollarSign className="h-5 w-5 text-green-500" />} title="财务要求">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.financial_requirements.bid_bond_amount && data.financial_requirements.bid_bond_amount !== "未提及" && (
              <InfoCardSmall icon={<Shield className="h-4 w-4" />} label="投标保证金" value={data.financial_requirements.bid_bond_amount} />
            )}
            {data.financial_requirements.bid_bond_form && data.financial_requirements.bid_bond_form !== "未提及" && (
              <InfoCardSmall icon={<FileSignature className="h-4 w-4" />} label="保证金形式" value={data.financial_requirements.bid_bond_form} />
            )}
            {data.financial_requirements.performance_bond && data.financial_requirements.performance_bond !== "未提及" && (
              <InfoCardSmall icon={<Shield className="h-4 w-4" />} label="履约保证金" value={data.financial_requirements.performance_bond} />
            )}
            {data.financial_requirements.payment_terms && data.financial_requirements.payment_terms !== "未提及" && (
              <InfoCardSmall icon={<DollarSign className="h-4 w-4" />} label="付款方式" value={data.financial_requirements.payment_terms} />
            )}
          </div>
          {data.financial_requirements.other.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {data.financial_requirements.other.map((item, i) => (
                <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-green-400" />
                  {item}
                </p>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Qualification Requirements */}
      {hasQual && (
        <Section icon={<Shield className="h-5 w-5 text-primary" />} title="资格要求">
          <div className="space-y-4">
            <QualCategory label="通用要求" items={data.qualification_requirements.general} color="bg-blue-100 text-blue-700 border-blue-200" />
            <QualCategory label="资质证书" items={data.qualification_requirements.qualification_cert} color="bg-indigo-100 text-indigo-700 border-indigo-200" />
            <QualCategory label="业绩要求" items={data.qualification_requirements.performance_record} color="bg-purple-100 text-purple-700 border-purple-200" />
            <QualCategory label="人员要求" items={data.qualification_requirements.personnel} color="bg-cyan-100 text-cyan-700 border-cyan-200" />
            <QualCategory label="财务状况" items={data.qualification_requirements.financial_status} color="bg-emerald-100 text-emerald-700 border-emerald-200" />
            <QualCategory label="联合体要求" items={data.qualification_requirements.joint_venture} color="bg-amber-100 text-amber-700 border-amber-200" />
            <QualCategory label="其他要求" items={data.qualification_requirements.other} color="bg-gray-100 text-gray-700 border-gray-200" />
          </div>
        </Section>
      )}

      {/* Scoring Rules */}
      {hasScoring && (
        <Section icon={<Scale className="h-5 w-5 text-primary" />} title="评标办法">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="text-sm px-3 py-1">{data.scoring_rules.method || "综合评估法"}</Badge>
              <span className="text-sm text-muted-foreground">
                总分：{data.scoring_rules.total_score}分
              </span>
            </div>

            {/* Weight bars */}
            <div className="flex gap-1 h-6 rounded-full overflow-hidden">
              {data.scoring_rules.technical_weight > 0 && (
                <div
                  className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium transition-all"
                  style={{ width: `${data.scoring_rules.technical_weight}%` }}
                  title={`技术 ${data.scoring_rules.technical_weight}%`}
                >
                  {data.scoring_rules.technical_weight > 15 ? `技术 ${data.scoring_rules.technical_weight}%` : ""}
                </div>
              )}
              {data.scoring_rules.commercial_weight > 0 && (
                <div
                  className="bg-amber-500 flex items-center justify-center text-xs text-white font-medium transition-all"
                  style={{ width: `${data.scoring_rules.commercial_weight}%` }}
                  title={`商务 ${data.scoring_rules.commercial_weight}%`}
                >
                  {data.scoring_rules.commercial_weight > 15 ? `商务 ${data.scoring_rules.commercial_weight}%` : ""}
                </div>
              )}
              {data.scoring_rules.price_weight > 0 && (
                <div
                  className="bg-green-500 flex items-center justify-center text-xs text-white font-medium transition-all"
                  style={{ width: `${data.scoring_rules.price_weight}%` }}
                  title={`价格 ${data.scoring_rules.price_weight}%`}
                >
                  {data.scoring_rules.price_weight > 15 ? `价格 ${data.scoring_rules.price_weight}%` : ""}
                </div>
              )}
            </div>

            {/* Scoring Items Table */}
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>评分项</TableHead>
                    <TableHead className="w-20">类别</TableHead>
                    <TableHead className="w-16 text-right">分值</TableHead>
                    <TableHead>评审标准</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.scoring_rules.scoring_items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-muted-foreground text-xs">{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <CategoryBadge category={item.category} />
                      </TableCell>
                      <TableCell className="text-right font-mono">{item.full_score}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-md">
                        {item.evaluation_criteria}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </Section>
      )}

      {/* Technical Highlights */}
      {hasTech && (
        <Section icon={<Wrench className="h-5 w-5 text-primary" />} title="技术需求要点">
          <div className="space-y-4">
            <TechSubsection label="关键技术参数" items={data.technical_highlights.key_parameters} />
            <TechSubsection label="适用标准规范" items={data.technical_highlights.standards} />
            <TechSubsection label="特殊要求" items={data.technical_highlights.special_requirements} />
            <TechSubsection label="验收标准" items={data.technical_highlights.acceptance_criteria} />
          </div>
        </Section>
      )}

      {/* Bid Document Requirements */}
      {hasBid && (
        <Section icon={<FileBox className="h-5 w-5 text-primary" />} title="投标文件编制要求">
          <div className="space-y-3">
            {data.bid_document_requirements.required_contents.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">投标文件内容清单</p>
                <div className="space-y-1">
                  {data.bid_document_requirements.required_contents.map((item, i) => (
                    <p key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.bid_document_requirements.copies && data.bid_document_requirements.copies !== "未提及" && (
                <InfoCardSmall icon={<FileText className="h-4 w-4" />} label="份数要求" value={data.bid_document_requirements.copies} />
              )}
              {data.bid_document_requirements.seal_requirements && data.bid_document_requirements.seal_requirements !== "未提及" && (
                <InfoCardSmall icon={<FileSignature className="h-4 w-4" />} label="密封要求" value={data.bid_document_requirements.seal_requirements} />
              )}
            </div>
            {data.bid_document_requirements.format_requirements.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">格式要求</p>
                <div className="space-y-1">
                  {data.bid_document_requirements.format_requirements.map((item, i) => (
                    <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/40" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Contract Highlights */}
      {hasContract && (
        <Section icon={<Gavel className="h-5 w-5 text-primary" />} title="合同条款要点">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.contract_highlights.contract_type && data.contract_highlights.contract_type !== "未提及" && (
              <InfoCardSmall icon={<FileText className="h-4 w-4" />} label="合同类型" value={data.contract_highlights.contract_type} />
            )}
            {data.contract_highlights.warranty_period && data.contract_highlights.warranty_period !== "未提及" && (
              <InfoCardSmall icon={<Shield className="h-4 w-4" />} label="质保期" value={data.contract_highlights.warranty_period} />
            )}
            {data.contract_highlights.liquidated_damages && data.contract_highlights.liquidated_damages !== "未提及" && (
              <InfoCardSmall icon={<AlertCircle className="h-4 w-4" />} label="违约金" value={data.contract_highlights.liquidated_damages} />
            )}
            {data.contract_highlights.dispute_resolution && data.contract_highlights.dispute_resolution !== "未提及" && (
              <InfoCardSmall icon={<Gavel className="h-4 w-4" />} label="争议解决" value={data.contract_highlights.dispute_resolution} />
            )}
          </div>
          {data.contract_highlights.other.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {data.contract_highlights.other.map((item, i) => (
                <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/40" />
                  {item}
                </p>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Risk Analysis */}
      {hasRisk && (
        <Section icon={<AlertTriangle className="h-5 w-5 text-destructive" />} title="风险分析">
          <div className="space-y-4">
            {data.risk_analysis.disqualifying_factors.length > 0 && (
              <RiskBlock
                title="废标因素"
                items={data.risk_analysis.disqualifying_factors}
                variant="destructive"
                icon={<AlertCircle className="h-4 w-4" />}
              />
            )}
            {data.risk_analysis.high_risk.length > 0 && (
              <RiskBlock
                title="高风险"
                items={data.risk_analysis.high_risk}
                variant="high"
                icon={<AlertTriangle className="h-4 w-4" />}
              />
            )}
            {data.risk_analysis.medium_risk.length > 0 && (
              <RiskBlock
                title="中风险"
                items={data.risk_analysis.medium_risk}
                variant="medium"
                icon={<HelpCircle className="h-4 w-4" />}
              />
            )}
            {data.risk_analysis.low_risk.length > 0 && (
              <RiskBlock
                title="低风险"
                items={data.risk_analysis.low_risk}
                variant="low"
                icon={<Info className="h-4 w-4" />}
              />
            )}
          </div>
        </Section>
      )}

      {/* Bidding Strategy */}
      {hasStrategy && (
        <Section icon={<Target className="h-5 w-5 text-amber-500" />} title="投标策略建议">
          <div className="space-y-4">
            {data.bidding_strategy.preparation_focus.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">编制重点</p>
                <div className="space-y-1.5">
                  {data.bidding_strategy.preparation_focus.map((item, i) => (
                    <p key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {data.bidding_strategy.competitive_insights && data.bidding_strategy.competitive_insights !== "未提及" && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">竞争态势分析</p>
                <Card className="bg-amber-50/50 border-amber-200">
                  <CardContent className="p-3">
                    <p className="text-sm text-amber-800">{data.bidding_strategy.competitive_insights}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {data.bidding_strategy.pricing_suggestion && data.bidding_strategy.pricing_suggestion !== "未提及" && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">报价策略建议</p>
                <Card className="bg-green-50/50 border-green-200">
                  <CardContent className="p-3">
                    <p className="text-sm text-green-800">{data.bidding_strategy.pricing_suggestion}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {data.bidding_strategy.key_success_factors.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">中标关键因素</p>
                <div className="space-y-1.5">
                  {data.bidding_strategy.key_success_factors.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      </div>
                      <p className="text-sm text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.bidding_strategy.timeline_reminders.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">时间节点提醒</p>
                <div className="space-y-1.5">
                  {data.bidding_strategy.timeline_reminders.map((item, i) => (
                    <p key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Key Deviations */}
      {data.key_deviations.length > 0 && (
        <Section icon={<TrendingUp className="h-5 w-5 text-purple-500" />} title="关键偏离项">
          <div className="space-y-2">
            {data.key_deviations.map((item, i) => (
              <Card key={i} className="border-purple-200 bg-purple-50/40">
                <CardContent className="p-3 flex items-start gap-2">
                  <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  <p className="text-sm text-purple-800">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Sub-components ──

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 border-b pb-2">
        {icon}
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function TimelineItem({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="relative flex items-start gap-4 pl-14">
      <div className={`absolute left-3 flex h-6 w-6 items-center justify-center rounded-full border bg-background ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function InfoCardSmall({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-3">
        <div className="mt-0.5 rounded-lg bg-muted p-1.5">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-sm font-medium text-foreground break-words">{value || "未提及"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QualCategory({ label, items, color }: { label: string; items: string[]; color: string }) {
  if (items.length === 0) return null;
  return (
    <Card className={`border ${color.replace(/text-\S+/, "")}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className={color}>{label}</Badge>
          <span className="text-xs text-muted-foreground">{items.length}项</span>
        </div>
        <div className="space-y-1">
          {items.map((item, i) => (
            <p key={i} className="text-sm text-foreground flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-current opacity-40" />
              {item}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const config: Record<string, { label: string; className: string }> = {
    technical: { label: "技术", className: "bg-blue-100 text-blue-700 border-blue-200" },
    commercial: { label: "商务", className: "bg-amber-100 text-amber-700 border-amber-200" },
    price: { label: "价格", className: "bg-green-100 text-green-700 border-green-200" },
    other: { label: "其他", className: "bg-gray-100 text-gray-700 border-gray-200" },
  };
  const c = config[category] || config.other;
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

function TechSubsection({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
      <div className="space-y-1">
        {items.map((item, i) => (
          <p key={i} className="text-sm text-foreground flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function RiskBlock({ title, items, variant, icon }: { title: string; items: string[]; icon: React.ReactNode; variant: "destructive" | "high" | "medium" | "low" }) {
  const styles: Record<string, string> = {
    destructive: "border-red-300 bg-red-50 text-red-800",
    high: "border-orange-300 bg-orange-50 text-orange-800",
    medium: "border-yellow-300 bg-yellow-50 text-yellow-800",
    low: "border-gray-200 bg-gray-50 text-gray-600",
  };
  const badgeStyles: Record<string, string> = {
    destructive: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <Card className={`border ${styles[variant]}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className={badgeStyles[variant]}>{icon} {title}</Badge>
          <span className="text-xs opacity-60">{items.length}项</span>
        </div>
        <div className="space-y-1">
          {items.map((item, i) => (
            <p key={i} className={`text-sm flex items-start gap-2`}>
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-current opacity-50" />
              {item}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
