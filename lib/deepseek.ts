export interface TenderAnalysis {
  project_name: string;
  tender_company: string;
  budget: string;
  location: string;
  deadline: string;
  bid_opening_time: string;
  qualification_requirements: string[];
  scoring_rules: string[];
  risk_points: string[];
  suggestions: string[];
}

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

const SYSTEM_PROMPT = `你是一名拥有15年经验的招投标专家。
请分析上传的招标文件。
严格按照JSON格式返回。
不要输出Markdown。
不要输出解释文字。
只返回JSON。
返回字段如下：
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
}`;

export class DeepSeekService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || "";
    this.baseUrl = "https://api.deepseek.com/v1";
  }

  async analyze(content: string): Promise<TenderAnalysis> {
    if (!this.apiKey) {
      throw new Error("DEEPSEEK_API_KEY 未设置");
    }

    const messages: DeepSeekMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `请分析以下招标文件内容，返回JSON格式的分析报告：\n\n${content}` },
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
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API 请求失败 (${response.status}): ${errorText}`);
    }

    const data: DeepSeekResponse = await response.json();
    const resultText = data.choices[0]?.message?.content;

    if (!resultText) {
      throw new Error("DeepSeek API 返回空结果");
    }

    return this.parseResult(resultText);
  }

  private parseResult(text: string): TenderAnalysis {
    try {
      const cleaned = this.cleanJsonString(text);
      const parsed = JSON.parse(cleaned);

      return {
        project_name: parsed.project_name || "",
        tender_company: parsed.tender_company || "",
        budget: parsed.budget || "",
        location: parsed.location || "",
        deadline: parsed.deadline || "",
        bid_opening_time: parsed.bid_opening_time || "",
        qualification_requirements: Array.isArray(parsed.qualification_requirements)
          ? parsed.qualification_requirements
          : [],
        scoring_rules: Array.isArray(parsed.scoring_rules) ? parsed.scoring_rules : [],
        risk_points: Array.isArray(parsed.risk_points) ? parsed.risk_points : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      };
    } catch {
      throw new Error("解析结果失败：无法解析AI返回的JSON数据");
    }
  }

  private cleanJsonString(text: string): string {
    let cleaned = text.trim();

    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }

    return cleaned.trim();
  }
}

export const deepseekService = new DeepSeekService();
