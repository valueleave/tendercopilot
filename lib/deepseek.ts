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

const SYSTEM_PROMPT = `??TenderCopilot AI?????15??????????

?????????????
????JSON?????????Markdown?????????????JSON?

???????
{
  "project_name": "",
  "tender_company": "",
  "budget": "",
  "location": "",
  "deadline": "",
  "bid_opening_time": "",
  "qualification_requirements": [],
  "scoring_rules": [],
  "risk_points": [],
  "suggestions": []
}

?????
- project_name: ????
- tender_company: ????
- budget: ????
- location: ????
- deadline: ??????
- bid_opening_time: ????
- qualification_requirements: ??????????
- scoring_rules: ??????????
- risk_points: ????????????
- suggestions: ??????????

??????????????????
`;

function cleanJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

export class DeepSeekService {
  private apiKey: string;
  private baseUrl: string;
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || "";
    this.baseUrl = "https://api.deepseek.com/v1";
  }
  async analyze(content: string, options?: { signal?: AbortSignal }): Promise<TenderAnalysis> {
    if (!this.apiKey) throw new Error("DEEPSEEK_API_KEY ???");
    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      { role: "user" as const, content: `????????????

${content}` },
    ];
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat", messages,
        temperature: 0.1, max_tokens: 16384
      }),
      signal: options?.signal,
    });
    if (!response.ok) {
      throw new Error(`DeepSeek API ???? (${response.status}): ${await response.text()}`);
    }
    return this.parseResult(await response.json());
  }

  private parseResult(data: { choices?: { message?: { content?: string }; finish_reason?: string }[] }): TenderAnalysis {
    const msg = data.choices?.[0]?.message;
    if (!msg) throw new Error("DeepSeek API ?????");
    const trimmed = (msg.content || "").trim();
    if (!trimmed) throw new Error("AI ?????????");

    // 3-level parsing: direct -> cleanJson -> regex
    const tryParse = (s: string): TenderAnalysis | null => {
      try {
        const p = JSON.parse(s);
        if (typeof p === "object" && p !== null && typeof p.project_name === "string")
          return this.normalizeAnalysis(p);
      } catch {}
      return null;
    };

    let result = tryParse(trimmed);
    if (!result) { result = tryParse(cleanJson(trimmed)); }
    if (!result) {
      const m = trimmed.match(/\{[\s\S]*\}/);
      if (m) result = tryParse(m[0]);
    }
    if (result) return result;
    throw new Error(`?????AI???????${trimmed.slice(0, 300)}`);
  }

  private normalizeAnalysis(raw: Record<string, unknown>): TenderAnalysis {
    const s = (v: unknown, fb = ""): string => typeof v === "string" ? v : fb;
    const a = (v: unknown): string[] => Array.isArray(v) ? v.filter((i): i is string => typeof i === "string") : [];
    const n = (v: unknown, fb = 0): number => typeof v === "number" ? v : fb;

    const scoringItemsFromArr = (arr: unknown[]): ScoringItem[] => arr.map(r => ({
      name: typeof r === "string" ? r : s((r as Record<string, unknown>).name),
      category: typeof r === "object" && r !== null && ["technical","commercial","price","other"].includes(s((r as Record<string,unknown>).category)) ? (s((r as Record<string,unknown>).category) as ScoringItem["category"]) : "other",
      full_score: typeof r === "object" && r !== null ? n((r as Record<string,unknown>).full_score) : 0,
      evaluation_criteria: typeof r === "string" ? r : s((r as Record<string,unknown>).evaluation_criteria),
    }));

    // Date fields from various sources
    const dl = s(raw.bid_deadline) || s(raw.deadline);
    const bo = s(raw.bid_opening_time);

    // Object helpers for nested format
    const tl = (typeof raw.timeline === "object" && raw.timeline !== null && !Array.isArray(raw.timeline)) ? raw.timeline as Record<string, unknown> : {};
    const ov = (typeof raw.project_overview === "object" && raw.project_overview !== null && !Array.isArray(raw.project_overview)) ? raw.project_overview as Record<string, unknown> : {};
    const ql = (typeof raw.qualification_requirements === "object" && raw.qualification_requirements !== null && !Array.isArray(raw.qualification_requirements)) ? raw.qualification_requirements as Record<string, unknown> : {};
    const sr = (typeof raw.scoring_rules === "object" && raw.scoring_rules !== null && !Array.isArray(raw.scoring_rules)) ? raw.scoring_rules as Record<string, unknown> : {};

    // Nested overrides
    const qlArr = Array.isArray(raw.qualification_requirements) ? raw.qualification_requirements as string[] : [];
    const srArr = Array.isArray(raw.scoring_rules) ? raw.scoring_rules : [];
    const qualReqs = qlArr.filter(i => typeof i === "string");

    // Determine scoring items from various formats
    let scored: ScoringItem[] = [];
    if (sr && Array.isArray(sr.scoring_items)) scored = scoringItemsFromArr(sr.scoring_items);
    if (scored.length === 0 && srArr.length > 0) scored = scoringItemsFromArr(srArr);

    return {
      project_name: s(raw.project_name),
      project_number: s(raw.project_number) || s(raw.project_number),
      tender_company: s(raw.tender_company),
      tender_agent: s(raw.tender_agent),
      timeline: {
        bid_deadline: s(tl.bid_deadline) || dl || s(raw.bid_deadline),
        bid_opening_time: s(tl.bid_opening_time) || bo || s(raw.bid_opening_time),
        document_period: s(tl.document_period) || s(raw.document_period),
        pre_bid_meeting: s(tl.pre_bid_meeting) || s(raw.pre_bid_meeting),
        site_visit: s(tl.site_visit) || s(raw.site_visit),
        bid_validity: s(tl.bid_validity) || s(raw.bid_validity),
      },
      project_overview: {
        location: s(ov.location) || s(raw.location),
        scale: s(ov.scale) || s(raw.scale),
        funding_source: s(ov.funding_source) || s(raw.funding_source),
        budget: s(ov.budget) || s(raw.budget),
        contract_period: s(ov.contract_period) || s(raw.contract_period),
        quality_standard: s(ov.quality_standard) || s(raw.quality_standard),
      },
      financial_requirements: {
        bid_bond_amount: s(raw.bid_bond_amount),
        bid_bond_form: s(raw.bid_bond_form),
        performance_bond: s(raw.performance_bond),
        payment_terms: s(raw.payment_terms),
        other: a(raw.financial_other) || [],
      },
      qualification_requirements: {
        general: qualReqs.length > 0 ? qualReqs : (Array.isArray(ql.general) ? a(ql.general) : a(raw.general_req)),
        qualification_cert: Array.isArray(ql.qualification_cert) ? a(ql.qualification_cert) : a(raw.qualification_req),
        performance_record: Array.isArray(ql.performance_record) ? a(ql.performance_record) : a(raw.performance_req),
        personnel: Array.isArray(ql.personnel) ? a(ql.personnel) : a(raw.personnel_req),
        financial_status: Array.isArray(ql.financial_status) ? a(ql.financial_status) : a(raw.financial_req),
        joint_venture: Array.isArray(ql.joint_venture) ? a(ql.joint_venture) : a(raw.joint_venture_req),
        other: [],
      },
      scoring_rules: {
        method: s(sr.method) || s(raw.scoring_method),
        total_score: n(raw.total_score) || (sr && typeof sr.total_score === "number" ? n(sr.total_score) : 100),
        technical_weight: n(raw.technical_weight) || (sr && typeof sr.technical_weight === "number" ? n(sr.technical_weight) : 0),
        commercial_weight: n(raw.commercial_weight) || (sr && typeof sr.commercial_weight === "number" ? n(sr.commercial_weight) : 0),
        price_weight: n(raw.price_weight) || (sr && typeof sr.price_weight === "number" ? n(sr.price_weight) : 0),
        scoring_items: scored,
      },
      technical_highlights: {
        key_parameters: a(raw.tech_params) || a(raw.key_parameters),
        standards: a(raw.standards),
        special_requirements: a(raw.special_req),
        acceptance_criteria: a(raw.acceptance_criteria),
      },
      bid_document_requirements: {
        required_contents: a(raw.required_contents),
        copies: s(raw.copies),
        seal_requirements: s(raw.seal_req),
        format_requirements: a(raw.format_requirements),
      },
      contract_highlights: {
        contract_type: s(raw.contract_type),
        warranty_period: s(raw.warranty_period),
        liquidated_damages: s(raw.liquidated_damages),
        dispute_resolution: s(raw.dispute_resolution),
        other: [],
      },
      risk_analysis: {
        disqualifying_factors: a(raw.disqualifying_factors),
        high_risk: a(raw.high_risk) || a(raw.risk_points),
        medium_risk: a(raw.medium_risk),
        low_risk: a(raw.low_risk),
      },
      bidding_strategy: {
        preparation_focus: a(raw.preparation_focus) || a(raw.suggestions),
        competitive_insights: s(raw.competitive_insights),
        pricing_suggestion: s(raw.pricing_suggestion),
        key_success_factors: a(raw.key_success_factors),
        timeline_reminders: a(raw.timeline_reminders),
      },
      key_deviations: a(raw.key_deviations),
    };
  }
}

export const deepseekService = new DeepSeekService();