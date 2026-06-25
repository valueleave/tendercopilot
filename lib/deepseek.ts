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
const ANALYSIS_TOOL = {
  type: "function" as const,
  function: {
    name: "output_tender_analysis",
    description:
      "输出招标文件的深度结构化分析结果，包含项目基本信息、时间节点、资格要求、评分标准、风险分析、投标策略等完整维度",
    parameters: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "项目名称" },
        project_number: { type: "string", description: "项目编号/招标编号" },
        tender_company: { type: "string", description: "招标人（业主单位）名称" },
        tender_agent: { type: "string", description: "招标代理机构名称" },
        timeline: {
          type: "object",
          description: "关键时间节点",
          properties: {
            bid_deadline: { type: "string", description: "投标截止时间" },
            bid_opening_time: { type: "string", description: "开标时间" },
            document_period: { type: "string", description: "招标文件获取时间" },
            pre_bid_meeting: { type: "string", description: "答疑会/标前会时间" },
            site_visit: { type: "string", description: "现场踏勘时间" },
            bid_validity: { type: "string", description: "投标有效期" },
          },
          required: ["bid_deadline", "bid_opening_time", "document_period", "pre_bid_meeting", "site_visit", "bid_validity"],
        },
        project_overview: {
          type: "object",
          description: "项目概况",
          properties: {
            location: { type: "string", description: "建设地点" },
            scale: { type: "string", description: "建设规模" },
            funding_source: { type: "string", description: "资金来源" },
            budget: { type: "string", description: "预算金额" },
            contract_period: { type: "string", description: "工期要求" },
            quality_standard: { type: "string", description: "质量标准" },
          },
          required: ["location", "scale", "funding_source", "budget", "contract_period", "quality_standard"],
        },
        financial_requirements: {
          type: "object",
          description: "财务要求",
          properties: {
            bid_bond_amount: { type: "string", description: "投标保证金金额" },
            bid_bond_form: { type: "string", description: "保证金形式" },
            performance_bond: { type: "string", description: "履约保证金" },
            payment_terms: { type: "string", description: "付款方式" },
            other: { type: "array", description: "其他财务要求", items: { type: "string" } },
          },
          required: ["bid_bond_amount", "bid_bond_form", "performance_bond", "payment_terms", "other"],
        },
        qualification_requirements: {
          type: "object",
          description: "资格要求（分类）",
          properties: {
            general: { type: "array", items: { type: "string" }, description: "通用要求" },
            qualification_cert: { type: "array", items: { type: "string" }, description: "资质证书要求" },
            performance_record: { type: "array", items: { type: "string" }, description: "业绩要求" },
            personnel: { type: "array", items: { type: "string" }, description: "人员要求" },
            financial_status: { type: "array", items: { type: "string" }, description: "财务要求" },
            joint_venture: { type: "array", items: { type: "string" }, description: "联合体要求" },
            other: { type: "array", items: { type: "string" }, description: "其他" },
          },
          required: ["general", "qualification_cert", "performance_record", "personnel", "financial_status", "joint_venture", "other"],
        },
        scoring_rules: {
          type: "object",
          description: "评分标准",
          properties: {
            method: { type: "string", description: "评标方法" },
            total_score: { type: "number", description: "总分" },
            technical_weight: { type: "number", description: "技术权重" },
            commercial_weight: { type: "number", description: "商务权重" },
            price_weight: { type: "number", description: "价格权重" },
            scoring_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "评分项" },
                  category: { type: "string", enum: ["technical", "commercial", "price", "other"] },
                  full_score: { type: "number", description: "满分" },
                  evaluation_criteria: { type: "string", description: "评审标准" },
                },
                required: ["name", "category", "full_score", "evaluation_criteria"],
              },
            },
          },
          required: ["method", "total_score", "technical_weight", "commercial_weight", "price_weight", "scoring_items"],
        },
        technical_highlights: {
          type: "object",
          properties: {
            key_parameters: { type: "array", items: { type: "string" } },
            standards: { type: "array", items: { type: "string" } },
            special_requirements: { type: "array", items: { type: "string" } },
            acceptance_criteria: { type: "array", items: { type: "string" } },
          },
          required: ["key_parameters", "standards", "special_requirements", "acceptance_criteria"],
        },
        bid_document_requirements: {
          type: "object",
          properties: {
            required_contents: { type: "array", items: { type: "string" } },
            copies: { type: "string" },
            seal_requirements: { type: "string" },
            format_requirements: { type: "array", items: { type: "string" } },
          },
          required: ["required_contents", "copies", "seal_requirements", "format_requirements"],
        },
        contract_highlights: {
          type: "object",
          properties: {
            contract_type: { type: "string" },
            warranty_period: { type: "string" },
            liquidated_damages: { type: "string" },
            dispute_resolution: { type: "string" },
            other: { type: "array", items: { type: "string" } },
          },
          required: ["contract_type", "warranty_period", "liquidated_damages", "dispute_resolution", "other"],
        },
        risk_analysis: {
          type: "object",
          properties: {
            disqualifying_factors: { type: "array", items: { type: "string" }, description: "废标因素" },
            high_risk: { type: "array", items: { type: "string" } },
            medium_risk: { type: "array", items: { type: "string" } },
            low_risk: { type: "array", items: { type: "string" } },
          },
          required: ["disqualifying_factors", "high_risk", "medium_risk", "low_risk"],
        },
        bidding_strategy: {
          type: "object",
          properties: {
            preparation_focus: { type: "array", items: { type: "string" } },
            competitive_insights: { type: "string" },
            pricing_suggestion: { type: "string" },
            key_success_factors: { type: "array", items: { type: "string" } },
            timeline_reminders: { type: "array", items: { type: "string" } },
          },
          required: ["preparation_focus", "competitive_insights", "pricing_suggestion", "key_success_factors", "timeline_reminders"],
        },
        key_deviations: { type: "array", items: { type: "string" }, description: "关键偏离项" },
      },
      required: [
        "project_name", "project_number", "tender_company", "tender_agent",
        "timeline", "project_overview", "financial_requirements",
        "qualification_requirements", "scoring_rules", "technical_highlights",
        "bid_document_requirements", "contract_highlights",
        "risk_analysis", "bidding_strategy", "key_deviations",
      ],
    },
  },
};

const SYSTEM_PROMPT = `你是TenderCopilot AI，一名拥有20年招投标实战经验的资深专家，精通工程建设、政府采购、企业招标等各类招标投标法规和实务。

## 核心任务
分析用户上传的招标文件（PDF提取的文本内容），输出深度结构化分析结果。

## 分析流程（严格按以下步骤思考，再输出）
1. 快速通读全文，理解招标文件的结构和核心内容
2. 提取基础信息：项目名称、编号、招标人、代理机构
3. 梳理时间线：找出所有关键时间节点
4. 逐一审查资格要求：按类别分类整理，注意嵌套条件
5. 解析评标办法：理解评分体系、权重分配和评审标准
6. 识别技术要求：关键技术参数和特殊要求
7. 审查合同条款：注意不利条款
8. 研判风险：从投标人角度分析废标因素和高、中、低风险
9. 形成策略：给出可操作的投标策略建议

## 输出要求
- 使用 output_tender_analysis 函数输出
- 所有字段必须从招标文件原文中提取，不要臆造
- 对于文件中未提及的字段，填入"未提及"或空数组
- 资格要求务必分类整理，不要笼统列举
- 风险分析要具体、有针对性，避免泛泛而谈
- 投标策略要结合评分办法给出具体的建议
- 保持专业、客观、精准`;

function isValidAnalysis(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as Record<string, unknown>).project_name === "string"
  );
}

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
      { role: "user" as const, content: `请深度分析以下招标文件内容：\n\n${content}` },
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
        tools: [ANALYSIS_TOOL],
        tool_choice: {
          type: "function",
          function: { name: "output_tender_analysis" },
        },
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
    choices?: { message?: { content?: string; tool_calls?: { function?: { arguments?: string } }[] } }[];
  }): TenderAnalysis {
    const choice = data.choices?.[0]?.message;
    if (!choice) {
      throw new Error("DeepSeek API 返回空结果");
    }

    // Try function call result first
    const toolCall = choice.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        if (isValidAnalysis(parsed)) {
          return this.normalizeAnalysis(parsed as Record<string, unknown>);
        }
      } catch {
        // fall through to content parsing
      }
    }

    // Fallback: parse content as JSON
    const content = choice.content;
    if (!content) {
      throw new Error("AI 未返回有效分析结果");
    }

    try {
      const cleaned = this.cleanJsonString(content);
      const parsed = JSON.parse(cleaned);
      if (isValidAnalysis(parsed)) {
        return this.normalizeAnalysis(parsed as Record<string, unknown>);
      }
    } catch {
      throw new Error("解析分析结果失败：AI 返回了非预期的格式");
    }

    throw new Error("解析分析结果失败");
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
