/* eslint-disable @typescript-eslint/no-explicit-any */
// AI 成分识别后端 route（服务端，密钥只在此使用、绝不暴露前端）。三种模式：
//   - { suggest } → 列出该输入可能指代的多个知名产品（候选列表，供前端下拉选择）
//   - { name }    → 按产品名查成分（文本模型 LLM_MODEL，默认 qwen-plus；支持昵称/简称模糊识别）
//   - { image }   → 拍图识别：成分表照片 OCR / 包装识别产品（视觉模型 LLM_VISION_MODEL，默认 qwen-vl-max）
//
// OpenAI 兼容协议、可插拔：换 LLM_BASE_URL / LLM_MODEL / LLM_VISION_MODEL / LLM_API_KEY
// 即可切厂商或区域。默认对接通义千问 Qwen（阿里云百炼 compatible-mode）。
// 未配置 LLM_API_KEY 时返回 { configured:false }，前端优雅提示、不报错。

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SUGGEST_PROMPT = `用户在搜一个护肤 / 化妆品产品，输入可能是昵称、简称、不完整或口语化名字。请列出最多 6 个该输入最可能指代的**真实存在的知名产品**，按可能性从高到低排序。
规则：
1. 结合品牌昵称、网络通称、明星单品推断（如「神仙水」→SK-II 护肤精华露、「小棕瓶」→雅诗兰黛特润修护精华、「兰蔻粉水」→兰蔻清滢柔肤水）。
2. 只列真实存在的产品，不要编造；认不出就给空数组。
3. 严格只输出 JSON：{"candidates":[{"brand":"品牌","product":"标准全名","alias":"常见叫法（可空）"}]}。`;

const TEXT_PROMPT = `你是熟悉中外护肤 / 化妆品的成分助手。用户输入的常常是**昵称、简称、口语名或不完整名称**，要做模糊识别。
示例：「神仙水」= SK-II 护肤精华露 (Facial Treatment Essence)；「小棕瓶」= 雅诗兰黛特润修护精华；「大红瓶」= 雅诗兰黛多效智妍面霜；「兰蔻粉水」= 兰蔻清滢柔肤爽肤水；「理肤泉 B5」= 理肤泉 Cicaplast B5 修复霜。
规则：
1. 先推断用户最可能指的那个**知名**产品（结合品牌昵称、网络通称、明星单品）。能合理确定就继续；只有在完全无法判断指代哪个产品时才 found=false。
2. 给出该产品「公开已知的全成分表 (INCI)」：ingredients 用中文规范成分名（没有中文就用英文 INCI），中文顿号「、」分隔，尽量完整并按官方顺序。不要编造不存在的成分。
3. brand 填品牌，product 填你判断出的**标准全名**（让用户能确认你猜得对不对）。
4. 严格只输出 JSON：{"found":true/false,"kind":"name","brand":"","product":"","ingredients":"成分1、成分2、…","note":"如做了昵称推断可简述"}。`;

const VISION_PROMPT = `你是化妆品识别助手。用户上传一张照片，可能是：(A) 产品的成分表，(B) 产品包装 / 瓶子。
规则：
1. 若照片是成分表：把成分逐字转录(OCR)到 ingredients，按顺序、用中文顿号「、」分隔，kind="inci"。
2. 若照片是产品包装 / 瓶子：识别品牌与品名，并给出该产品「公开已知的全成分表(INCI)」到 ingredients，kind="package"。
3. 看不清、认不出、或没把握就 found=false，绝不编造成分。
4. 严格只输出 JSON：{"found":true/false,"kind":"inci"或"package","brand":"","product":"","ingredients":"成分1、成分2、…","note":""}。`;

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

async function callLLM(base: string, apiKey: string, model: string, messages: any[]) {
  const r = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, temperature: 0.2, messages }),
  });
  if (!r.ok) {
    return { ok: false as const, status: r.status, detail: (await r.text()).slice(0, 200) };
  }
  const data = await r.json();
  return { ok: true as const, content: String(data?.choices?.[0]?.message?.content ?? '') };
}

export async function POST(req: Request) {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) return NextResponse.json({ configured: false });

  let name = '';
  let image = '';
  let suggest = '';
  try {
    const body = await req.json();
    name = String(body?.name ?? '').trim();
    image = String(body?.image ?? '').trim();
    suggest = String(body?.suggest ?? '').trim();
  } catch {
    /* ignore bad body */
  }
  if (!name && !image && !suggest) {
    return NextResponse.json({ configured: true, found: false, error: '请提供产品名称、图片或搜索词' });
  }

  const base = (process.env.LLM_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/$/, '');
  const textModel = process.env.LLM_MODEL || 'qwen-plus';
  const visionModel = process.env.LLM_VISION_MODEL || 'qwen-vl-max';

  try {
    // —— 候选列表模式 ——
    if (suggest) {
      const res = await callLLM(base, apiKey, textModel, [
        { role: 'system', content: SUGGEST_PROMPT },
        { role: 'user', content: `用户输入：${suggest}` },
      ]);
      if (!res.ok) return NextResponse.json({ configured: true, candidates: [], error: `模型调用失败 (${res.status})` });
      const parsed = extractJson(res.content);
      const candidates = Array.isArray(parsed?.candidates) ? parsed.candidates.slice(0, 6) : [];
      return NextResponse.json({ configured: true, candidates });
    }

    // —— 按名查 / 拍图识别 ——
    const isImage = Boolean(image);
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

    const res = await callLLM(base, apiKey, isImage ? visionModel : textModel, messages);
    if (!res.ok) {
      return NextResponse.json({ configured: true, found: false, error: `模型调用失败 (${res.status})`, detail: res.detail });
    }
    const parsed = extractJson(res.content);
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
      candidates: [],
      error: '请求出错，请稍后重试',
      detail: String(e?.message ?? e).slice(0, 200),
    });
  }
}
