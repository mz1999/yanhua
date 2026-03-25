/**
 * 构建 AI 绘图提示词
 * 将用户选择的配置转换为最终的绘图提示词
 */

interface PromptConfig {
  style: string;
  scene: string;
  composition: string;
  lighting: string;
  culture: string;
  description?: string;
}

/**
 * 风格关键词映射
 */
const styleKeywords: Record<string, string> = {
  "治愈系": "healing, warm and soft, cozy atmosphere, comforting, peaceful",
  "极简主义": "minimalist, clean lines, simple, less is more, uncluttered",
  "复古怀旧": "vintage, retro, film grain, nostalgic, old times atmosphere",
  "电影感": "cinematic, cinematic lighting, storytelling, film still, movie scene",
  "自然田园": "countryside, pastoral, rustic, organic, nature",
  "赛博朋克": "cyberpunk, neon lights, futuristic, high tech, dystopian",
  "工业风": "industrial, metal, concrete, raw, rugged",
  "奢华精致": "luxury, elegant, high-end details, golden accents, sophisticated",
  "波西米亚": "bohemian, boho, free spirited, ethnic elements, eclectic",
  "北欧简约": "scandinavian, hygge, cozy, functional beauty, nordic",
  "日式侘寂": "wabi-sabi, japanese aesthetic, imperfect beauty, zen, tranquil",
  "地中海": "mediterranean, blue and white, ocean vibe, coastal, greek",
  "热带风情": "tropical, lush greenery, vacation vibe, exotic, palm trees",
  "哥特暗黑": "gothic, dark, mysterious, dramatic, medieval",
  "糖果色": "pastel colors, soft sweet, cute, dreamy, kawaii",
  "蒸汽波": "vaporwave, 80s retro, neon, surreal, glitch art",
  "浮世绘": "ukiyo-e, japanese art, flat decoration, woodblock print style",
  "野兽派": "brutalist, raw concrete, sculptural, bold forms",
};

/**
 * 场景关键词映射
 */
const sceneKeywords: Record<string, string> = {
  "现代家居": "modern home interior, contemporary design, stylish furniture",
  "乡村别墅": "countryside villa, rural house, pastoral, farmhouse",
  "城市公寓": "city apartment, urban loft, downtown living, modern flat",
  "海边度假屋": "beach house, seaside cottage, ocean view, coastal home",
  "山间小屋": "mountain cabin, forest retreat, woodland, nature escape",
  "咖啡馆": "coffee shop, cafe corner, warm coffee atmosphere, barista",
  "书店": "bookstore, library, bookshelves, reading space, literary",
  "花园庭院": "garden courtyard, outdoor green space, patio, backyard",
  "厨房": "kitchen, cooking scene, culinary, dining preparation",
  "卧室": "bedroom, private rest space, cozy bed, intimate",
  "书房": "study room, home office, reading corner, workspace",
  "阳台": "balcony, terrace, outdoor view, semi-outdoor space",
  "老街巷": "old street alley, historic lane, traditional architecture",
  "市场集市": "market bazaar, street market, lively atmosphere, vendors",
  "车站码头": "train station, pier, transit hub, journey",
  "屋顶露台": "rooftop terrace, skyline view, urban panorama",
};

/**
 * 构图关键词映射
 */
const compositionKeywords: Record<string, string> = {
  "广角全景": "wide angle, panoramic view, grand scene, spacious",
  "标准中景": "medium shot, balanced composition, narrative framing",
  "特写细节": "close-up, detail shot, macro, texture focus",
  "低角度仰视": "low angle, looking up, imposing, heroic perspective",
  "高角度俯视": "high angle, top-down view, bird eye view, overview",
  "对称构图": "symmetrical composition, balanced, centered, formal",
  "三分法则": "rule of thirds, golden ratio, visually pleasing",
  "框架构图": "framing composition, foreground frame, window frame",
};

/**
 * 光影关键词映射
 */
const lightingKeywords: Record<string, string> = {
  "黄金时刻": "golden hour, sunrise sunset, warm soft light, magical",
  "蓝调时刻": "blue hour, twilight, cool mysterious, dawn dusk",
  "自然光": "natural light, window light, soft realistic, daylight",
  "侧逆光": "rim lighting, backlight, dramatic, silhouette edge",
  "柔光": "soft light, diffused lighting, no harsh shadows, flattering",
  "硬光": "hard light, strong shadows, texture emphasis, dramatic",
  "霓虹灯光": "neon lighting, city night, colorful lights, cyber",
  "烛光/火光": "candlelight, fire light, warm flickering, intimate",
  "阴天散射": "overcast light, soft diffused, even lighting, low contrast",
  "剪影逆光": "silhouette, backlighting, contour, mysterious shadow",
};

/**
 * 文化元素关键词映射
 */
const cultureKeywords: Record<string, string> = {
  // 亚洲
  "🇨🇳 中国风": "chinese style, traditional chinese architecture, oriental elements, chinese garden, bamboo",
  "🇯🇵 日式": "japanese style, tatami, shoji screen, zen garden, cherry blossom, minimalist japanese",
  "🇰🇷 韩式": "korean style, hanok, modern korean, k-pop aesthetic",
  "🇹🇭 东南亚": "southeast asian, balinese, thai temple, colonial style, tropical asian",
  "🇮🇳 印度": "indian style, colorful, arch, mandala, sari fabric, bohemian indian",
  // 欧洲
  "🇬🇷 地中海": "mediterranean, santorini, greek islands, blue white, arches, seaside greek",
  "🇮🇹 意大利": "italian style, tuscan, renaissance, roman columns, mediterranean italian",
  "🇫🇷 法式": "french style, parisian apartment, provence, versailles, art deco, elegant french",
  "🇪🇸 西班牙": "spanish style, gaudi, moorish influence, ironwork, spanish tiles",
  "🇸🇪 北欧": "scandinavian, swedish, norwegian, danish, nordic design, hygge",
  "🇬🇧 英式": "british style, victorian, english country manor, library, fireplace",
  "🇳🇱 荷兰": "dutch style, canal house, windmill, delft blue, amsterdam",
  // 美洲
  "🇺🇸 美式": "american style, modern loft, manhattan apartment, suburban house, industrial american",
  "🇲🇽 墨西哥": "mexican style, colorful, dia de los muertos, cactus, talavera tiles",
  "🇧🇷 巴西": "brazilian style, tropical modernism, concrete, lush plants, rio style",
  "🇨🇺 古巴": "cuban style, colonial, vintage cars, caribbean, salsa atmosphere",
  // 其他
  "🇲🇦 摩洛哥": "moroccan style, zellige tiles, arches, courtyard, moroccan rug",
  "🇹🇷 土耳其": "turkish style, turkish blue, mosaic, lanterns, turkish carpet",
  "🇦🇪 阿拉伯": "arabic style, geometric patterns, arches, desert modernism, middle eastern",
  "🇿🇦 南非": "south african, safari, wildlife, tribal patterns, nature",
  "🇦🇺 澳洲": "australian style, coastal, modernist, natural materials, beach house",
};

/**
 * 构建完整的绘图提示词
 */
export function buildImagePrompt(config: PromptConfig): string {
  const parts: string[] = [];

  // 1. 主体描述（场景）
  const scenePrompt = sceneKeywords[config.scene] || config.scene;
  parts.push(scenePrompt);

  // 2. 风格
  const stylePrompt = styleKeywords[config.style] || config.style;
  parts.push(stylePrompt);

  // 3. 文化元素
  const culturePrompt = cultureKeywords[config.culture] || config.culture;
  if (culturePrompt) {
    parts.push(culturePrompt);
  }

  // 4. 光影
  const lightingPrompt = lightingKeywords[config.lighting] || config.lighting;
  parts.push(lightingPrompt);

  // 5. 构图
  const compositionPrompt = compositionKeywords[config.composition] || config.composition;
  parts.push(compositionPrompt);

  // 6. 用户补充描述
  if (config.description) {
    parts.push(config.description);
  }

  // 7. 通用质量后缀
  parts.push("high quality, professional photography, 8k, detailed, masterpiece");

  // 组合成最终提示词
  return parts.join(", ");
}

/**
 * 构建负面提示词（可选）
 */
export function buildNegativePrompt(): string {
  return "low quality, blurry, distorted, deformed, ugly, duplicate, watermark, signature, text, logo, cropped, worst quality, low resolution";
}

/**
 * 示例用法
 */
export function example() {
  const config: PromptConfig = {
    style: "治愈系",
    scene: "现代家居",
    composition: "广角全景",
    lighting: "自然光",
    culture: "🇨🇳 中国风",
    description: "女主角是个漂亮的中国女人，20多岁，坐在窗边看书",
  };

  const prompt = buildImagePrompt(config);
  console.log("最终提示词:\n", prompt);
  console.log("\n负面提示词:\n", buildNegativePrompt());

  return prompt;
}
