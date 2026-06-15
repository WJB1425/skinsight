/* eslint-disable @typescript-eslint/no-explicit-any */
// AI「按产品名查成分」后端 route（服务端，密钥只在此使用、绝不暴露前端）。
//
// 用 OpenAI 兼容协议，可插拔：换 LLM_BASE_URL / LLM_MODEL / LLM_API_KEY 即可切厂商。
// 默认对接通义千问 Qwen（阿里云百炼 compatible-mode）。中国小程序后端与海外 web
// 可各自用不同的 env（如海外换成 OpenAI；Claude 需另加适配，因其非 OpenAI 协议）。
//
// 未配置 LLM_API_KEY 时返回 { configured:false }，前端优雅提示、不报错。

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `你是化妆品成分数据库助手。用户给出一个护肤 / 化妆品产品名称，你要返回该产品「公开已知的全成分表 (INCI)」。
规则：
1. 只有当你对该产品的真实成分有把握时才返回；没把握、不认识、或可能记错就 found=false，绝不编造成分。
2. ingredients 用中文规范成分名（没有中文就用英文 INCI），以中文顿号「、」分隔，尽量完整并按官方标注顺序。
3. 严格只输出 JSON，不要任何多余文字或解释：{"found":true 或 false,"brand":"品牌","product":"标准品名","ingredients":"成分1、成分2、…","note":"可选简短备注"}。`;

function extractJson(s: string): any | null {
  if (!s) return null;
  const cleaned = s.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    /* fall through */
  }
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch {
      /* ignore */
    }
  }
  return null;
}

export async function POST(req: Request) {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) return NextResponse.json({ configured: false });

  let name = '';
  try {
    const body = await req.json();
    name = String(body?.name ?? '').trim();
  } catch {
    /* ignore bad body */
  }
  if (!name) return NextResponse.json({ configured: true, found: false, error: '请提供产品名称' });

  const base = (process.env.LLM_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/$/, '');
  const model = process.env.LLM_MODEL || 'qwen-plus';

  try {
    const r = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `产品名称：${name}` },
        ],
      }),
    });

    if (!r.ok) {
      const detail = (await r.text()).slice(0, 200);
      return NextResponse.json({ configured: true, found: false, error: `模型调用失败 (${r.status})`, detail });
    }

    const data = await r.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';
    const parsed = extractJson(content);

    if (!parsed || !parsed.found || !parsed.ingredients) {
      return NextResponse.json({ configured: true, found: false, note: parsed?.note ?? '' });
    }

    return NextResponse.json({
      configured: true,
      found: true,
      brand: String(parsed.brand ?? ''),
      product: String(parsed.product ?? name),
      ingredientsText: String(parsed.ingredients),
      note: String(parsed.note ?? ''),
    });
  } catch (e: any) {
    return NextResponse.json({
      configured: true,
      found: false,
      error: '请求出错，请稍后重试',
      detail: String(e?.message ?? e).slice(0, 200),
    });
  }
}
