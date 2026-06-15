/* eslint-disable @typescript-eslint/no-explicit-any */
// AI 成分识别后端 route（服务端，密钥只在此使用、绝不暴露前端）。二合一：
//   - { name }  → 按产品名查成分（文本模型 LLM_MODEL，默认 qwen-plus）
//   - { image } → 拍图识别：成分表照片 OCR / 包装识别产品（视觉模型 LLM_VISION_MODEL，默认 qwen-vl-max）
//
// OpenAI 兼容协议、可插拔：换 LLM_BASE_URL / LLM_MODEL / LLM_VISION_MODEL / LLM_API_KEY
// 即可切厂商或区域。默认对接通义千问 Qwen（阿里云百炼 compatible-mode）。
// 未配置 LLM_API_KEY 时返回 { configured:false }，前端优雅提示、不报错。

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const TEXT_PROMPT = `你是化妆品成分数据库助手。用户给出一个护肤 / 化妆品产品名称，返回该产品「公开已知的全成分表 (INCI)」。
规则：
1. 只有对该产品的真实成分有把握时才返回；没把握、不认识、或可能记错就 found=false，绝不编造。
2. ingredients 用中文规范成分名（没有中文就用英文 INCI），中文顿号「、」分隔，尽量完整并按官方顺序。
3. 严格只输出 JSON：{"found":true/false,"kind":"name","brand":"","product":"","ingredients":"成分1、成分2、…","note":""}。`;

const VISION_PROMPT = `你是化妆品识别助手。用户上传一张照片，可能是：(A) 产品的成分表，(B) 产品包装 / 瓶子。
规则：
1. 若照片是成分表：把成分逐字转录(OCR)到 ingredients，按顺序、用中文顿号「、」分隔，kind="inci"。
2. 若照片是产品包装 / 瓶子：识别品牌与品名，并给出该产品「公开已知的全成分表(INCI)」到 ingredients，kind="package"。
3. 看不清、认不出、或没把握就 found=false，绝不编造成分。
4. 严格只输出 JSON，不要多余文字：{"found":true/false,"kind":"inci"或"package","brand":"","product":"","ingredients":"成分1、成分2、…","note":""}。`;

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
  let image = '';
  try {
    const body = await req.json();
    name = String(body?.name ?? '').trim();
    image = String(body?.image ?? '').trim();
  } catch {
    /* ignore bad body */
  }
  if (!name && !image) {
    return NextResponse.json({ configured: true, found: false, error: '请提供产品名称或图片' });
  }

  const base = (process.env.LLM_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/$/, '');
  const isImage = Boolean(image);
  const model = isImage
    ? process.env.LLM_VISION_MODEL || 'qwen-vl-max'
    : process.env.LLM_MODEL || 'qwen-plus';

  const messages = isImage
    ? [
        { role: 'system', content: VISION_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: '请识别这张图片并按要求输出 JSON。' },
            { type: 'image_url', image_url: { url: image } },
          ],
        },
      ]
    : [
        { role: 'system', content: TEXT_PROMPT },
        { role: 'user', content: `产品名称：${name}` },
      ];

  try {
    const r = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, temperature: 0.2, messages }),
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
      kind: String(parsed.kind ?? (isImage ? 'package' : 'name')),
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
