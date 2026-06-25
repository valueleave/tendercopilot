export interface ScoringItem {
  name: string;
  category: "technical" | "commercial" | "price" | "other";
  full_score: number;
  evaluation_criteria: string;
}

export interface TenderAnalysis {
  project_name: string;
  project_number: string;
  tender_company: string;
  tender_agent: string;

  timeline: {
    bid_deadline: string;
    bid_opening_time: string;
    document_period: string;
    pre_bid_meeting: string;
    site_visit: string;
    bid_validity: string;
  };

  project_overview: {
    location: string;
    scale: string;
    funding_source: string;
    budget: string;
    contract_period: string;
    quality_standard: string;
  };

  financial_requirements: {
    bid_bond_amount: string;
    bid_bond_form: string;
    performance_bond: string;
    payment_terms: string;
    other: string[];
  };

  qualification_requirements: {
    general: string[];
    qualification_cert: string[];
    performance_record: string[];
    personnel: string[];
    financial_status: string[];
    joint_venture: string[];
    other: string[];
  };

  scoring_rules: {
    method: string;
    total_score: number;
    technical_weight: number;
    commercial_weight: number;
    price_weight: number;
    scoring_items: ScoringItem[];
  };

  technical_highlights: {
    key_parameters: string[];
    standards: string[];
    special_requirements: string[];
    acceptance_criteria: string[];
  };

  bid_document_requirements: {
    required_contents: string[];
    copies: string;
    seal_requirements: string;
    format_requirements: string[];
  };

  contract_highlights: {
    contract_type: string;
    warranty_period: string;
    liquidated_damages: string;
    dispute_resolution: string;
    other: string[];
  };

  risk_analysis: {
    disqualifying_factors: string[];
    high_risk: string[];
    medium_risk: string[];
    low_risk: string[];
  };

  bidding_strategy: {
    preparation_focus: string[];
    competitive_insights: string;
    pricing_suggestion: string;
    key_success_factors: string[];
    timeline_reminders: string[];
  };

  key_deviations: string[];
}

const SYSTEM_PROMPT = `你是TenderCopilot AI，20年招投标实战专家。

## 任务
分析招标文件（PDF提取文本），输出结构化JSON分析报告。

## 分析步骤
1. 通读全文，理解结构
2. 提取基础信息（项目名称、编号、招标人、代理机构）
3. 梳理时间节点（投标截止、开标、文件获取、答疑会、踏勘、有效期）
4. 审查资格要求（按通用/资质/业绩/人员/财务/联合体/其他分类）
5. 解析评标办法（方法名、总分、技术/商务/价格权重、各项评分细则）
6. 识别技术要点（关键参数、标准规范、特殊要求、验收标准）
7. 审查合同条款（类型、质保、违约金、争议解决）
8. 研判风险（废标因素、高/中/低风险）
9. 形成策略（编制重点、竞争分析、报价建议、成功因素、时间提醒）

## 输出格式
必须输出纯JSON，不能有任何markdown、代码块标记、或多余文字。
输出JSON必须严格遵循以下结构（字段值若文件未提及则填空字符串或空数组）：

{
  "project_name": "",
  "project_number": "",
  "tender_company": "",
  "tender_agent": "",
  "timeline": {
    "bid_deadline": "",
    "bid_opening_time": "",
    "document_period": "",
    "pre_bid_meeting": "",
    "site_visit": "",
    "bid_validity": ""
  },
  "project_overview": {
    "location": "",
    "scale": "",
    "funding_source": "",
    "budget": "",
    "contract_period": "",
    "quality_standard": ""
  },
  "financial_requirements": {
    "bid_bond_amount": "",
    "bid_bond_form": "",
    "performance_bond": "",
    "payment_terms": "",
    "other": []
  },
  "qualification_requirements": {
    "general": [],
    "qualification_cert": [],
    "performance_record": [],
    "personnel": [],
    "financial_status": [],
    "joint_venture": [],
    "other": []
  },
  "scoring_rules": {
    "method": "",
    "total_score": 100,
    "technical_weight": 0,
    "commercial_weight": 0,
    "price_weight": 0,
    "scoring_items": [
      {"name": "", "category": "technical", "full_score": 0, "evaluation_criteria": ""}
    ]
  },
  "technical_highlights": {
    "key_parameters": [],
    "standards": [],
    "special_requirements": [],
    "acceptance_criteria": []
  },
  "bid_document_requirements": {
    "required_contents": [],
    "copies": "",
    "seal_requirements": "",
    "format_requirements": []
  },
  "contract_highlights": {
    "contract_type": "",
    "warranty_period": "",
    "liquidated_damages": "",
    "dispute_resolution": "",
    "other": []
  },
  "risk_analysis": {
    "disqualifying_factors": [],
    "high_risk": [],
    "medium_risk": [],
    "low_risk": []
  },
  "bidding_strategy": {
    "preparation_focus": [],
    "competitive_insights": "",
    "pricing_suggestion": "",
    "key_success_factors": [],
    "timeline_reminders": []
  },
  "key_deviations": []
}

## 质量标准
- 所有信息必须来源于文件原文，不要臆造
- 资格要求务必分类整理，不要笼统堆在一个数组里
- 评分细则要逐项列出name/category/full_score/evaluation_criteria
- 风险分析要具体，避免"注意审慎"这类空话
- 投标策略要结合评分权重给出可操作建议
- 缺失字段用空字符串或空数组，不填null`;

export class DeepSeekService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || "";
    this.baseUrl = "https://api.deepseek.com/v1";
  }

  async analyze(content: string, options?: { signal?: AbortSignal }): Promise<TenderAnalysis> {
    if (!this.apiKey) {
      throw new Error("DEEPSEEK_API_KEY 未设置");
    }

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      { role: "user" as const, content: `请深度分析以下招标文件内容，严格按照JSON格式输出结果：\n\n${content}` },
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.1,
        max_tokens: 16384,
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API 请求失败 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return this.parseResult(data);
  }

  private parseResult(data: {
    choices?: { message?: { content?: string }; finish_reason?: string }[];
  }): TenderAnalysis {
    const choice = data.choices?.[0];
    const message = choice?.message;

    if (!message) {
      throw new Error("DeepSeek API 返回空结果");
    }

    const content = message.content || "";
    const trimmed = content.trim();

    if (!trimmed) {
      throw new Error("AI 未返回有效分析结果");
    }

    // Try direct JSON parse first
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "object" && parsed !== null && typeof parsed.project_name === "string") {
        return this.normalizeAnalysis(parsed);
      }
    } catch {
      // fall through
    }

    // Try cleaning markdown formatting and parsing
    const cleaned = this.cleanJsonString(trimmed);
    if (cleaned !== trimmed) {
      try {
        const parsed = JSON.parse(cleaned);
        if (typeof parsed === "object" && parsed !== null && typeof parsed.project_name === "string") {
          return this.normalizeAnalysis(parsed as Record<string, unknown>);
        }
      } catch {
        // fall through
      }
    }

    // Try regex-based JSON extraction (last resort)
    try {
      const match = trimmed.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (typeof parsed === "object" && parsed !== null && typeof parsed.project_name === "string") {
          return this.normalizeAnalysis(parsed as Record<string, unknown>);
        }
      }
    } catch {
      // fall through
    }

    // All parsing failed - show first 300 chars to help debug
    const preview = trimmed.slice(0, 300);
    throw new Error(`解析分析结果失败：AI 返回了非预期的格式。返回内容预览：${preview}`);
  }

  private normalizeAnalysis(raw: Record<string, unknown>): TenderAnalysis {
    const s = (v: unknown, fallback = ""): string =>
      typeof v === "string" ? v : fallback;
    const arr = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((i): i is string => typeof i === "string") : [];
    const obj = (v: unknown): Record<string, unknown> =>
      typeof v === "object" && v !== null && !Array.isArray(v)
        ? (v as Record<string, unknown>)
        : {};
    const num = (v: unknown, fallback = 0): number =>
      typeof v === "number" ? v : fallback;

    const timeline = obj(raw.timeline);
    const overview = obj(raw.project_overview);
    const fin = obj(raw.financial_requirements);
    const qual = obj(raw.qualification_requirements);
    const scoring = obj(raw.scoring_rules);
    const tech = obj(raw.technical_highlights);
    const bid = obj(raw.bid_document_requirements);
    const contract = obj(raw.contract_highlights);
    const risk = obj(raw.risk_analysis);
    const strategy = obj(raw.bidding_strategy);

    const normalizeScoringItems = (items: unknown): ScoringItem[] => {
      if (!Array.isArray(items)) return [];
      return items
        .filter((item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null)
        .map((item) => ({
          name: s(item.name),
          category: (["technical", "commercial", "price", "other"].includes(s(item.category))
            ? s(item.category)
            : "other") as ScoringItem["category"],
          full_score: num(item.full_score),
          evaluation_criteria: s(item.evaluation_criteria),
        }));
    };

    return {
      project_name: s(raw.project_name),
      project_number: s(raw.project_number),
      tender_company: s(raw.tender_company),
      tender_agent: s(raw.tender_agent),
      timeline: {
        bid_deadline: s(timeline.bid_deadline),
        bid_opening_time: s(timeline.bid_opening_time),
        document_period: s(timeline.document_period),
        pre_bid_meeting: s(timeline.pre_bid_meeting),
        site_visit: s(timeline.site_visit),
        bid_validity: s(timeline.bid_validity),
      },
      project_overview: {
        location: s(overview.location),
        scale: s(overview.scale),
        funding_source: s(overview.funding_source),
        budget: s(overview.budget),
        contract_period: s(overview.contract_period),
        quality_standard: s(overview.quality_standard),
      },
      financial_requirements: {
        bid_bond_amount: s(fin.bid_bond_amount),
        bid_bond_form: s(fin.bid_bond_form),
        performance_bond: s(fin.performance_bond),
        payment_terms: s(fin.payment_terms),
        other: arr(fin.other),
      },
      qualification_requirements: {
        general: arr(qual.general),
        qualification_cert: arr(qual.qualification_cert),
        performance_record: arr(qual.performance_record),
        personnel: arr(qual.personnel),
        financial_status: arr(qual.financial_status),
        joint_venture: arr(qual.joint_venture),
        other: arr(qual.other),
      },
      scoring_rules: {
        method: s(scoring.method),
        total_score: num(scoring.total_score, 100),
        technical_weight: num(scoring.technical_weight),
        commercial_weight: num(scoring.commercial_weight),
        price_weight: num(scoring.price_weight),
        scoring_items: normalizeScoringItems(scoring.scoring_items),
      },
      technical_highlights: {
        key_parameters: arr(tech.key_parameters),
        standards: arr(tech.standards),
        special_requirements: arr(tech.special_requirements),
        acceptance_criteria: arr(tech.acceptance_criteria),
      },
      bid_document_requirements: {
        required_contents: arr(bid.required_contents),
        copies: s(bid.copies),
        seal_requirements: s(bid.seal_requirements),
        format_requirements: arr(bid.format_requirements),
      },
      contract_highlights: {
        contract_type: s(contract.contract_type),
        warranty_period: s(contract.warranty_period),
        liquidated_damages: s(contract.liquidated_damages),
        dispute_resolution: s(contract.dispute_resolution),
        other: arr(contract.other),
      },
      risk_analysis: {
        disqualifying_factors: arr(risk.disqualifying_factors),
        high_risk: arr(risk.high_risk),
        medium_risk: arr(risk.medium_risk),
        low_risk: arr(risk.low_risk),
      },
      bidding_strategy: {
        preparation_focus: arr(strategy.preparation_focus),
        competitive_insights: s(strategy.competitive_insights),
        pricing_suggestion: s(strategy.pricing_suggestion),
        key_success_factors: arr(strategy.key_success_factors),
        timeline_reminders: arr(strategy.timeline_reminders),
      },
      key_deviations: arr(raw.key_deviations),
    };
  }

  private cleanJsonString(text: string): string {
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    return cleaned.trim();
  }
}

export const deepseekService = new DeepSeekService();
