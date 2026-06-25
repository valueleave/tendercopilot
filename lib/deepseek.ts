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

## 输出格式
必须输出纯JSON，不能有任何markdown语法标记或额外文字。
所有字段值若文件未提及则填空字符串或空数组。
字段名必须使用以下英文名：

project_name: 项目名称（字符串）
project_number: 项目编号（字符串）
tender_company: 招标人（字符串）
tender_agent: 招标代理机构（字符串）

bid_deadline: 投标截止时间（字符串）
bid_opening_time: 开标时间（字符串）
document_period: 文件获取时间（字符串）
pre_bid_meeting: 答疑会时间（字符串）
site_visit: 现场踏勘时间（字符串）
bid_validity: 投标有效期（字符串）

location: 建设地点（字符串）
scale: 建设规模（字符串）
funding_source: 资金来源（字符串）
budget: 预算金额（字符串）
contract_period: 工期/供货期（字符串）
quality_standard: 质量标准（字符串）

bid_bond_amount: 投标保证金金额（字符串）
bid_bond_form: 保证金形式（字符串）
performance_bond: 履约保证金（字符串）
payment_terms: 付款方式（字符串）

general_req: 通用资格要求（字符串数组）
qualification_req: 资质证书要求（字符串数组）
performance_req: 业绩要求（字符串数组）
personnel_req: 人员要求（字符串数组）
financial_req: 财务状况要求（字符串数组）
joint_venture_req: 联合体要求（字符串数组）

scoring_method: 评标方法名称（字符串，如"综合评估法"）
scoring_items: 评分项列表（对象数组），每项包含：name(评分项名称), category(类别：technical/commercial/price), full_score(分值), evaluation_criteria(评审标准)
technical_weight: 技术部分权重（数字，百分数如30表示30%）
commercial_weight: 商务部分权重（数字）
price_weight: 价格部分权重（数字）

tech_params: 关键技术参数（字符串数组）
standards: 适用标准规范（字符串数组）
special_req: 特殊技术要求（字符串数组）
acceptance_criteria: 验收标准（字符串数组）

required_contents: 投标文件内容清单（字符串数组）
copies: 份数要求（字符串）
seal_req: 密封要求（字符串）

contract_type: 合同类型（字符串）
warranty_period: 质保期（字符串）
liquidated_damages: 违约金（字符串）
dispute_resolution: 争议解决（字符串）

disqualifying_factors: 废标因素（字符串数组）
high_risk: 高风险项（字符串数组）
medium_risk: 中风险项（字符串数组）
low_risk: 低风险项（字符串数组）

preparation_focus: 投标编制重点（字符串数组）
competitive_insights: 竞争态势分析（字符串）
pricing_suggestion: 报价策略建议（字符串）
key_success_factors: 中标关键因素（字符串数组）
timeline_reminders: 时间节点提醒（字符串数组）

key_deviations: 关键偏离项/特殊条款（字符串数组）`;

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
      { role: "user" as const, content: `请分析以下招标文件内容：\n\n${content}` },
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
      if (typeof parsed === "object" && parsed !== null) {
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
        if (typeof parsed === "object" && parsed !== null) {
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
        if (typeof parsed === "object" && parsed !== null) {
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

    // Try nested format first (if raw has nested objects like timeline, project_overview)
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

    const hasNested = Object.keys(timeline).length > 0 || Object.keys(overview).length > 0 || Object.keys(qual).length > 0;

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

    // ─── Flat fields (from simple prompt) ───
    // If nested format is detected, those take priority over flat fallbacks

    // Timeline helpers
    const bid_deadline = hasNested ? s(timeline.bid_deadline) : "";
    const bid_opening_time = hasNested ? s(timeline.bid_opening_time) : "";
    const document_period = hasNested ? s(timeline.document_period) : "";
    const pre_bid_meeting = hasNested ? s(timeline.pre_bid_meeting) : "";
    const site_visit = hasNested ? s(timeline.site_visit) : "";
    const bid_validity = hasNested ? s(timeline.bid_validity) : "";

    // Overview helpers
    const location = hasNested ? s(overview.location) : "";
    const scale = hasNested ? s(overview.scale) : "";
    const funding_source = hasNested ? s(overview.funding_source) : "";
    const budget = hasNested ? s(overview.budget) : "";
    const contract_period = hasNested ? s(overview.contract_period) : "";
    const quality_standard = hasNested ? s(overview.quality_standard) : "";

    // Financial helpers
    const bid_bond_amount = hasNested ? s(fin.bid_bond_amount) : "";
    const bid_bond_form = hasNested ? s(fin.bid_bond_form) : "";
    const performance_bond = hasNested ? s(fin.performance_bond) : "";
    const payment_terms = hasNested ? s(fin.payment_terms) : "";
    const fin_other = hasNested ? arr(fin.other) as string[] : [];

    // Qualification helpers
    const qual_general = hasNested ? arr(qual.general) as string[] : [];
    const qual_qualification_cert = hasNested ? arr(qual.qualification_cert) as string[] : [];
    const qual_performance_record = hasNested ? arr(qual.performance_record) as string[] : [];
    const qual_personnel = hasNested ? arr(qual.personnel) as string[] : [];
    const qual_financial_status = hasNested ? arr(qual.financial_status) as string[] : [];
    const qual_joint_venture = hasNested ? arr(qual.joint_venture) as string[] : [];
    const qual_other = hasNested ? arr(qual.other) as string[] : [];

    // Scoring helpers
    const scoring_method = hasNested ? s(scoring.method) : "";
    const si = hasNested ? normalizeScoringItems(scoring.scoring_items) : [];

    // Tech helpers
    const tech_params = hasNested ? arr(tech.key_parameters) as string[] : [];
    const tech_standards = hasNested ? arr(tech.standards) as string[] : [];
    const tech_special = hasNested ? arr(tech.special_requirements) as string[] : [];
    const tech_acceptance = hasNested ? arr(tech.acceptance_criteria) as string[] : [];

    // Bid helpers
    const bid_contents = hasNested ? arr(bid.required_contents) as string[] : [];
    const bid_copies = hasNested ? s(bid.copies) : "";
    const bid_seal = hasNested ? s(bid.seal_requirements) : "";
    const bid_format = hasNested ? arr(bid.format_requirements) as string[] : [];

    // Contract helpers
    const contract_type = hasNested ? s(contract.contract_type) : "";
    const warranty_period = hasNested ? s(contract.warranty_period) : "";
    const liquidated_damages = hasNested ? s(contract.liquidated_damages) : "";
    const dispute_resolution = hasNested ? s(contract.dispute_resolution) : "";
    const contract_other = hasNested ? arr(contract.other) as string[] : [];

    // Risk helpers
    const risk_disqualifying = hasNested ? arr(risk.disqualifying_factors) as string[] : arr(raw.disqualifying_factors);
    const risk_high = hasNested ? arr(risk.high_risk) as string[] : arr(raw.high_risk);
    const risk_medium = hasNested ? arr(risk.medium_risk) as string[] : arr(raw.medium_risk);
    const risk_low = hasNested ? arr(risk.low_risk) as string[] : arr(raw.low_risk);

    // Strategy helpers
    const strat_focus = hasNested ? arr(strategy.preparation_focus) as string[] : arr(raw.preparation_focus);
    const strat_competitive = hasNested ? s(strategy.competitive_insights) : s(raw.competitive_insights);
    const strat_pricing = hasNested ? s(strategy.pricing_suggestion) : s(raw.pricing_suggestion);
    const strat_success = hasNested ? arr(strategy.key_success_factors) as string[] : arr(raw.key_success_factors);
    const strat_reminders = hasNested ? arr(strategy.timeline_reminders) as string[] : arr(raw.timeline_reminders);

    // ─── Flat field fallbacks (used when model outputs flat JSON) ───
    const f_project_name = s(raw.project_name);
    const f_project_number = s(raw.project_number);
    const f_tender_company = s(raw.tender_company);
    const f_tender_agent = s(raw.tender_agent);

    const f_bid_deadline = bid_deadline || s(raw.bid_deadline);
    const f_bid_opening_time = bid_opening_time || s(raw.bid_opening_time);
    const f_document_period = document_period || s(raw.document_period);
    const f_pre_bid_meeting = pre_bid_meeting || s(raw.pre_bid_meeting);
    const f_site_visit = site_visit || s(raw.site_visit);
    const f_bid_validity = bid_validity || s(raw.bid_validity);

    const f_location = location || s(raw.location);
    const f_scale = scale || s(raw.scale);
    const f_funding_source = funding_source || s(raw.funding_source);
    const f_budget = budget || s(raw.budget);
    const f_contract_period = contract_period || s(raw.contract_period);
    const f_quality_standard = quality_standard || s(raw.quality_standard);

    const f_bid_bond_amount = bid_bond_amount || s(raw.bid_bond_amount);
    const f_bid_bond_form = bid_bond_form || s(raw.bid_bond_form);
    const f_performance_bond = performance_bond || s(raw.performance_bond);
    const f_payment_terms = payment_terms || s(raw.payment_terms);
    const f_fin_other = fin_other.length > 0 ? fin_other : [];

    const f_general = qual_general.length > 0 ? qual_general : arr(raw.general_req);
    const f_qualification_cert = qual_qualification_cert.length > 0 ? qual_qualification_cert : arr(raw.qualification_req);
    const f_performance_record = qual_performance_record.length > 0 ? qual_performance_record : arr(raw.performance_req);
    const f_personnel = qual_personnel.length > 0 ? qual_personnel : arr(raw.personnel_req);
    const f_financial_status = qual_financial_status.length > 0 ? qual_financial_status : arr(raw.financial_req);
    const f_joint_venture = qual_joint_venture.length > 0 ? qual_joint_venture : arr(raw.joint_venture_req);
    const f_qual_other = qual_other.length > 0 ? qual_other : [];

    const f_scoring_method = scoring_method || s(raw.scoring_method) || s(scoring.method);
    const f_technical_weight = num(raw.technical_weight) || num(scoring.technical_weight);
    const f_commercial_weight = num(raw.commercial_weight) || num(scoring.commercial_weight);
    const f_price_weight = num(raw.price_weight) || num(scoring.price_weight);
    const f_scoring_items = si.length > 0 ? si : normalizeScoringItems(raw.scoring_items);

    const f_tech_params = tech_params.length > 0 ? tech_params : arr(raw.tech_params);
    const f_standards = tech_standards.length > 0 ? tech_standards : arr(raw.standards);
    const f_special_req = tech_special.length > 0 ? tech_special : arr(raw.special_req);
    const f_acceptance = tech_acceptance.length > 0 ? tech_acceptance : arr(raw.acceptance_criteria);

    const f_contents = bid_contents.length > 0 ? bid_contents : arr(raw.required_contents);
    const f_copies = bid_copies || s(raw.copies);
    const f_seal = bid_seal || s(raw.seal_req);
    const f_format = bid_format.length > 0 ? bid_format : [];

    const f_contract_type = contract_type || s(raw.contract_type);
    const f_warranty = warranty_period || s(raw.warranty_period);
    const f_liquidated = liquidated_damages || s(raw.liquidated_damages);
    const f_dispute = dispute_resolution || s(raw.dispute_resolution);
    const f_contract_other = contract_other.length > 0 ? contract_other : [];

    const f_disqualifying = risk_disqualifying.length > 0 ? risk_disqualifying : arr(raw.disqualifying_factors);
    const f_high_risk = risk_high.length > 0 ? risk_high : arr(raw.high_risk);
    const f_medium_risk = risk_medium.length > 0 ? risk_medium : arr(raw.medium_risk);
    const f_low_risk = risk_low.length > 0 ? risk_low : arr(raw.low_risk);

    const f_prep_focus = strat_focus.length > 0 ? strat_focus : arr(raw.preparation_focus);
    const f_competitive = strat_competitive || s(raw.competitive_insights);
    const f_pricing = strat_pricing || s(raw.pricing_suggestion);
    const f_success = strat_success.length > 0 ? strat_success : arr(raw.key_success_factors);
    const f_reminders = strat_reminders.length > 0 ? strat_reminders : arr(raw.timeline_reminders);

    const f_deviations = arr(raw.key_deviations);

    return {
      project_name: f_project_name,
      project_number: f_project_number,
      tender_company: f_tender_company,
      tender_agent: f_tender_agent,

      timeline: {
        bid_deadline: f_bid_deadline,
        bid_opening_time: f_bid_opening_time,
        document_period: f_document_period,
        pre_bid_meeting: f_pre_bid_meeting,
        site_visit: f_site_visit,
        bid_validity: f_bid_validity,
      },

      project_overview: {
        location: f_location,
        scale: f_scale,
        funding_source: f_funding_source,
        budget: f_budget,
        contract_period: f_contract_period,
        quality_standard: f_quality_standard,
      },

      financial_requirements: {
        bid_bond_amount: f_bid_bond_amount,
        bid_bond_form: f_bid_bond_form,
        performance_bond: f_performance_bond,
        payment_terms: f_payment_terms,
        other: f_fin_other,
      },

      qualification_requirements: {
        general: f_general,
        qualification_cert: f_qualification_cert,
        performance_record: f_performance_record,
        personnel: f_personnel,
        financial_status: f_financial_status,
        joint_venture: f_joint_venture,
        other: f_qual_other,
      },

      scoring_rules: {
        method: f_scoring_method,
        total_score: num(raw.total_score) || num(scoring.total_score, 100),
        technical_weight: f_technical_weight,
        commercial_weight: f_commercial_weight,
        price_weight: f_price_weight,
        scoring_items: f_scoring_items,
      },

      technical_highlights: {
        key_parameters: f_tech_params,
        standards: f_standards,
        special_requirements: f_special_req,
        acceptance_criteria: f_acceptance,
      },

      bid_document_requirements: {
        required_contents: f_contents,
        copies: f_copies,
        seal_requirements: f_seal,
        format_requirements: f_format,
      },

      contract_highlights: {
        contract_type: f_contract_type,
        warranty_period: f_warranty,
        liquidated_damages: f_liquidated,
        dispute_resolution: f_dispute,
        other: f_contract_other,
      },

      risk_analysis: {
        disqualifying_factors: f_disqualifying,
        high_risk: f_high_risk,
        medium_risk: f_medium_risk,
        low_risk: f_low_risk,
      },

      bidding_strategy: {
        preparation_focus: f_prep_focus,
        competitive_insights: f_competitive,
        pricing_suggestion: f_pricing,
        key_success_factors: f_success,
        timeline_reminders: f_reminders,
      },

      key_deviations: f_deviations,
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
