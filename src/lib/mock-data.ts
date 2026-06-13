// Mock data for SkinSight MVP

export interface Ingredient {
  id: string;
  name: string;
  nameCn: string;
  safetyScore: number; // 0-10, higher = safer
  category: string;
 功效: string[];
  description: string;
  structureUrl?: string;
}

export interface SkinAnalysisResult {
  skinType: 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal';
  skinTypeCn: string;
  moisture: number; // 0-100
  oiliness: number; // 0-100
  sensitivity: number; // 0-100
  concerns: string[];
  recommendedIngredients: string[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  keyIngredients: string[];
  skinTypes: string[];
  description: string;
}

export const mockIngredients: Ingredient[] = [
  {
    id: '1',
    name: 'Niacinamide',
    nameCn: '烟酰胺',
    safetyScore: 9,
    category: '维生素',
    功效: ['美白', '控油', '修护屏障'],
    description: '维生素B3衍生物，具有多种护肤功效，包括减少色素沉着、控制油脂分泌和强化皮肤屏障。',
  },
  {
    id: '2',
    name: 'Hyaluronic Acid',
    nameCn: '透明质酸',
    safetyScore: 10,
    category: '保湿剂',
    功效: ['深层保湿', '填充细纹', '舒缓'],
    description: '天然存在于人体的多糖类物质，能吸收自身重量1000倍的水分，是优秀的保湿成分。',
  },
  {
    id: '3',
    name: 'Retinol',
    nameCn: '视黄醇',
    safetyScore: 6,
    category: '维生素A衍生物',
    功效: ['抗衰老', '促进胶原', '改善细纹'],
    description: '维生素A的活性形式，是研究最充分的抗衰老成分之一，能促进细胞更新和胶原蛋白生成。',
  },
  {
    id: '4',
    name: 'Salicylic Acid',
    nameCn: '水杨酸',
    safetyScore: 7,
    category: 'BHA',
    功效: ['去角质', '疏通毛孔', '控油'],
    description: '脂溶性β-羟基酸，能深入毛孔清洁，适合油性和痘痘肌肤使用。',
  },
  {
    id: '5',
    name: 'Vitamin C',
    nameCn: '维生素C',
    safetyScore: 8,
    category: '抗氧化剂',
    功效: ['抗氧化', '提亮肤色', '促进胶原'],
    description: '强效抗氧化剂，能中和自由基，减少光老化损伤，促进胶原蛋白合成。',
  },
  {
    id: '6',
    name: 'Ceramides',
    nameCn: '神经酰胺',
    safetyScore: 10,
    category: '脂质',
    功效: ['修护屏障', '保湿', '舒缓'],
    description: '皮肤天然屏障的重要组成部分，补充神经酰胺可以修复受损的皮肤屏障。',
  },
];

export const mockSkinResults: SkinAnalysisResult = {
  skinType: 'combination',
  skinTypeCn: '混合性肌肤',
  moisture: 65,
  oiliness: 72,
  sensitivity: 35,
  concerns: ['T区出油', '毛孔粗大', '两颊偏干'],
  recommendedIngredients: ['烟酰胺', '透明质酸', '水杨酸'],
};

export const mockProducts: Product[] = [
  {
    id: '1',
    name: '烟酰胺精华液',
    brand: 'The Ordinary',
    price: 68,
    image: '/products/niacinamide.jpg',
    category: '精华',
    rating: 4.5,
    keyIngredients: ['Niacinamide', 'Zinc PCA'],
    skinTypes: ['oily', 'combination'],
    description: '10%高浓度烟酰胺配方，有效控油、细致毛孔、改善肤色不均。',
  },
  {
    id: '2',
    name: '透明质酸保湿精华',
    brand: 'Vichy',
    price: 289,
    image: '/products/hyaluronic.jpg',
    category: '精华',
    rating: 4.7,
    keyIngredients: ['Hyaluronic Acid', 'Vitamin B5'],
    skinTypes: ['dry', 'normal', 'sensitive'],
    description: '81%温泉水+三重透明质酸，深层补水，修护皮肤屏障。',
  },
  {
    id: '3',
    name: '视黄醇抗老面霜',
    brand: 'CeraVe',
    price: 158,
    image: '/products/retinol.jpg',
    category: '面霜',
    rating: 4.3,
    keyIngredients: ['Retinol', 'Ceramides', 'Niacinamide'],
    skinTypes: ['normal', 'combination'],
    description: '温和视黄醇配方，配合神经酰胺，抗老同时修护屏障。',
  },
  {
    id: '4',
    name: '维生素C精华',
    brand: 'SkinCeuticals',
    price: 1280,
    image: '/products/vitc.jpg',
    category: '精华',
    rating: 4.8,
    keyIngredients: ['Vitamin C', 'Ferulic Acid', 'Vitamin E'],
    skinTypes: ['normal', 'dry', 'combination'],
    description: '15%左旋维C+1%阿魏酸经典配方，强效抗氧化，提亮肤色。',
  },
  {
    id: '5',
    name: '水杨酸洁面',
    brand: 'CeraVe',
    price: 98,
    image: '/products/salicylic.jpg',
    category: '洁面',
    rating: 4.4,
    keyIngredients: ['Salicylic Acid', 'Ceramides'],
    skinTypes: ['oily', 'combination'],
    description: '含水杨酸的温和洁面，有效清除多余油脂，不破坏皮肤屏障。',
  },
  {
    id: '6',
    name: '神经酰胺修护霜',
    brand: 'Illiyoon',
    price: 89,
    image: '/products/ceramides.jpg',
    category: '面霜',
    rating: 4.6,
    keyIngredients: ['Ceramides', 'Squalane', 'Panthenol'],
    skinTypes: ['dry', 'sensitive'],
    description: '含神经酰胺胶囊的修护面霜，深层滋润，强化皮肤屏障功能。',
  },
];

export interface ConflictRule {
  ingredients: string[];
  severity: 'safe' | 'warning' | 'danger';
  message: string;
}

export const conflictRules: ConflictRule[] = [
  {
    ingredients: ['Retinol', 'Vitamin C'],
    severity: 'warning',
    message: '视黄醇与高浓度维生素C同时使用可能引起刺激，建议早晚分开使用。',
  },
  {
    ingredients: ['Retinol', 'Salicylic Acid'],
    severity: 'danger',
    message: '视黄醇与水杨酸同时使用可能导致过度去角质和皮肤屏障受损。',
  },
  {
    ingredients: ['Vitamin C', 'Salicylic Acid'],
    severity: 'safe',
    message: '可以搭配使用，但敏感肌肤建议降低频率。',
  },
];
