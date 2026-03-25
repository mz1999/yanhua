// 言画配置体系 v3
// 7个维度：核心情绪、建筑风格/文化基因、地域、空间功能、天气/氛围、光影质感、绘画风格

// ========== 维度1：核心情绪（单选）==========
export const coreEmotions = [
  {
    id: "healing",
    label: "治愈系",
    description: "温暖、柔和、让人心安",
    useCase: "主打选项，日常舒适场景",
  },
  {
    id: "serene",
    label: "宁静系",
    description: "静谧、禅意、独处感",
    useCase: "阅读、冥想、雨天",
  },
  {
    id: "nostalgic",
    label: "怀旧系",
    description: "复古、时光感、故事性",
    useCase: "老街、旧物、回忆",
  },
  {
    id: "romantic",
    label: "浪漫系",
    description: "温柔、诗意、梦幻",
    useCase: "黄昏、花海、约会",
  },
  {
    id: "solitary",
    label: "孤独系",
    description: "清冷、疏离、思考感",
    useCase: "深夜、窗边、独处",
  },
] as const;

// ========== 维度2：建筑风格/文化基因（单选，按地区分组）==========
export const architecturalStyles = {
  "中国传统": [
    { id: "lingnan", label: "岭南建筑", description: "满洲窗、花砖、骑楼、趟栊门" },
    { id: "jiangnan", label: "江南园林", description: "白墙黛瓦、漏窗、太湖石、曲径" },
    { id: "beijing", label: "北京胡同", description: "四合院、青砖灰瓦、枣树、鸟笼" },
    { id: "shanghai", label: "上海石库门", description: "老钢窗、Art Deco、花园里弄" },
    { id: "sichuan", label: "川西民居", description: "竹编、天井、茶馆、慢生活" },
    { id: "yunnan", label: "云南民族", description: "扎染、火塘、梯田、多彩民族风" },
    { id: "minnan", label: "闽南建筑", description: "红砖厝、燕尾脊、出砖入石" },
    { id: "huizhou", label: "徽派建筑", description: "马头墙、小青瓦、三雕艺术" },
  ],
  "日式": [
    { id: "kyoto-machiya", label: "京都町屋", description: "格子窗、土间、中庭、和纸" },
    { id: "wabi-sabi", label: "日式侘寂", description: "枯山水、苔藓、残缺美、禅意" },
    { id: "showa-retro", label: "昭和复古", description: "昭和风、City Pop、怀旧电器" },
    { id: "okinawa", label: "冲绳琉球", description: "红瓦、狮子、亚热带海洋风" },
    { id: "tokyo-minimal", label: "东京极简", description: "水泥、落地窗、都市冷峻" },
  ],
  "东南亚": [
    { id: "nanyang", label: "南洋复古", description: "花砖、藤编、百叶窗、娘惹文化" },
    { id: "bali", label: "巴厘岛", description: "石雕、茅草、热带植物、泳池" },
    { id: "lanna", label: "泰北兰纳", description: "木雕、金箔、寺庙元素" },
  ],
  "欧洲": [
    { id: "mediterranean", label: "地中海希腊", description: "蓝顶白墙、拱门、海洋元素" },
    { id: "tuscany", label: "托斯卡纳", description: "红瓦、橄榄树、意式乡村、做旧墙面" },
    { id: "provence", label: "南法乡村", description: "薰衣草、石屋、铁艺、田园野趣" },
    { id: "scandinavian", label: "北欧斯堪的纳维亚", description: "原木、hygge、极简功能美学" },
    { id: "british-country", label: "英式乡村", description: "壁炉、碎花、下午茶、庄园" },
    { id: "baroque", label: "巴洛克/洛可可", description: "华丽、繁复、宫廷感" },
  ],
  "美洲": [
    { id: "american-country", label: "美式乡村", description: "手工质朴、Shaker风格、壁炉" },
    { id: "california-midcentury", label: "加州Mid-Century", description: "棕榈树、泳池、复古现代" },
    { id: "ny-loft", label: "纽约Loft", description: "工业风、落地窗、都市精英" },
    { id: "mexican", label: "墨西哥", description: "色彩鲜艳、瓷砖、仙人掌、亡灵节" },
  ],
  "其他": [
    { id: "bohemian", label: "波西米亚", description: "自由奔放、民族元素、地毯织物" },
    { id: "industrial", label: "工业风", description: "金属、水泥、粗犷原始" },
    { id: "bauhaus", label: "包豪斯", description: "几何、功能主义、红黄蓝" },
    { id: "cyberpunk", label: "赛博朋克", description: "霓虹、未来、科技感" },
  ],
} as const;

// 扁平化的建筑风格列表（用于查找）
export const allArchitecturalStyles = Object.values(architecturalStyles).flat();

// ========== 维度3：地域（单选，可选）==========
export const regions = {
  "中国": {
    "华南": ["广州", "深圳", "香港", "澳门", "厦门"],
    "华东": ["上海", "杭州", "苏州", "南京"],
    "华北": ["北京", "天津", "青岛"],
    "西南": ["成都", "重庆", "昆明", "大理"],
    "西北": ["西安", "敦煌", "乌鲁木齐"],
    "华中": ["武汉", "长沙"],
    "东北": ["哈尔滨", "大连", "沈阳"],
  },
  "海外": {
    "日本": ["东京", "京都", "大阪", "冲绳", "北海道"],
    "东南亚": ["新加坡", "曼谷", "清迈", "巴厘岛", "槟城"],
    "欧洲": ["巴黎", "普罗旺斯", "托斯卡纳", "圣托里尼", "伦敦"],
    "美洲": ["纽约", "洛杉矶", "旧金山", "墨西哥城"],
  },
} as const;

// 扁平化的城市列表
export const allCities = Object.values(regions).flatMap(provinces =>
  Object.values(provinces).flat()
);

// ========== 维度4：空间功能（输入+预设）==========
export const spacePresets = [
  // 家居空间
  "客厅", "卧室", "书房", "厨房", "阳台", "庭院", "露台", "天台",
  // 商业空间
  "咖啡馆", "书店", "花店", "bakery", "茶室", "画室",
  // 公共空间
  "老街巷", "市集", "车站", "工作室",
] as const;

// ========== 维度5：天气/氛围（单选）==========
export interface WeatherOption {
  id: string;
  label: string;
  description: string;
}

export interface WeatherCategory {
  category: string;
  options: WeatherOption[];
}

export const weatherOptions: WeatherCategory[] = [
  {
    category: "晴朗",
    options: [
      { id: "sunny-clear", label: "晴空万里", description: "蓝天白云、阳光明媚" },
    ],
  },
  {
    category: "多云",
    options: [
      { id: "cloudy-soft", label: "云层覆盖", description: "柔和散射、阴天静谧" },
    ],
  },
  {
    category: "雨天",
    options: [
      { id: "rain-drizzle", label: "细雨绵绵", description: "湿润、诗意、安静" },
      { id: "rain-heavy", label: "倾盆大雨", description: "雨声轰鸣、室内温暖" },
      { id: "rain-after", label: "雨后湿润", description: "空气清新、地面反光" },
    ],
  },
  {
    category: "极端",
    options: [
      { id: "storm", label: "暴雨天", description: "狂风暴雨、电闪雷鸣" },
      { id: "typhoon", label: "台风过境", description: "风雨交加、室内安全" },
      { id: "blizzard", label: "暴雪封门", description: "银装素裹、室内温暖" },
    ],
  },
  {
    category: "特殊",
    options: [
      { id: "foggy", label: "雾天朦胧", description: "雾气弥漫、神秘朦胧" },
      { id: "sandstorm", label: "沙尘漫天", description: "昏黄天空、沙漠氛围" },
      { id: "aurora", label: "极光之夜", description: "北极光、星空璀璨" },
    ],
  },
  {
    category: "黄昏/夜晚",
    options: [
      { id: "golden-hour", label: "金色黄昏", description: "日落时分、温暖金光" },
      { id: "blue-hour", label: "蓝调时刻", description: "日落后、深蓝天空" },
      { id: "starry", label: "星光璀璨", description: "满天繁星、宁静夜晚" },
    ],
  },
];

// 扁平化的天气选项
export const allWeatherOptions: WeatherOption[] = weatherOptions.flatMap(w => w.options);

// ========== 维度6：光影质感（多选）==========
export const lightingQualities = [
  { id: "window-light", label: "自然窗光", description: "窗户透入的柔和自然光" },
  { id: "rim-light", label: "侧逆光", description: "侧面或背面打来的轮廓光" },
  { id: "dappled", label: "斑驳光影", description: "树影、窗格等产生的光影图案" },
  { id: "candlelight", label: "烛光/暖光", description: "温暖的点光源氛围" },
  { id: "misty-soft", label: "雾气柔光", description: "雾气中的散射柔光" },
  { id: "neon-reflection", label: "霓虹反光", description: "夜晚霓虹的彩色反光" },
  { id: "cinematic-light", label: "电影感打光", description: "类似电影布光的戏剧性光线" },
] as const;

// ========== 维度7：绘画风格（多选）==========
export const paintingStyles = [
  { id: "detailed-comic", label: "精细漫画", description: "插画感、线条精致、日系/国漫风" },
  { id: "realistic", label: "写实细节", description: "精致细腻、照片级质感" },
  { id: "film-look", label: "胶片质感", description: "模拟胶片色彩、颗粒感" },
  { id: "watercolor", label: "水彩晕染", description: "水彩画的晕染效果" },
  { id: "oil-painting", label: "油画质感", description: "油画的笔触和厚重感" },
  { id: "pencil-sketch", label: "铅笔素描", description: "手绘素描风格" },
] as const;

// ========== 旧配置兼容导出（用于向后兼容）==========
// 这些将在未来版本中移除
/** @deprecated 使用 coreEmotions 替代 */
export const baseStyles = [
  { id: "healing", label: "治愈系", description: "温暖柔和，让人感到舒适安宁" },
  { id: "cinematic", label: "电影感", description: "Cinematic 光影，故事叙事感" },
  { id: "minimalist", label: "极简主义", description: "Less is more，简洁线条" },
  { id: "cyberpunk", label: "赛博朋克", description: "霓虹灯光，未来科技感" },
  { id: "countryside", label: "自然田园", description: "乡村气息，质朴有机" },
  { id: "industrial", label: "工业风", description: "金属水泥，粗犷原始" },
  { id: "bohemian", label: "波西米亚", description: "自由奔放，民族元素" },
  { id: "mediterranean", label: "地中海", description: "蓝白配色，海洋气息" },
  { id: "tropical", label: "热带风情", description: "浓绿植物，度假氛围" },
  { id: "pastel", label: "糖果色", description: "柔和pastel，甜美可爱" },
];

/** @deprecated 使用 paintingStyles 替代 */
export const textureOverlays = [
  { id: "detailed-comic", label: "精细漫画", description: "插画感、线条精致、非照片" },
  { id: "realistic-detail", label: "写实细节", description: "精致、细腻、高清质感" },
  { id: "80s-retro", label: "80年代怀旧", description: "复古色调、胶片感、旧时光" },
];

/** @deprecated 使用 spacePresets 替代 */
export const scenes = [
  { id: "living-room", label: "客厅", description: "主要活动空间，最常用" },
  { id: "bedroom", label: "卧室", description: "私密休息空间" },
  { id: "study", label: "书房/工作区", description: "阅读、工作角落" },
  { id: "balcony", label: "阳台/露台", description: "半户外，连接自然" },
  { id: "kitchen", label: "厨房", description: "烹饪生活场景" },
  { id: "cafe", label: "咖啡馆", description: "温馨公共角落" },
  { id: "bookstore", label: "书店", description: "书香空间" },
  { id: "garden", label: "花园庭院", description: "户外绿色空间" },
  { id: "rooftop", label: "屋顶露台", description: "城市高空视角" },
  { id: "old-street", label: "老街巷", description: "历史街道氛围" },
];

/** @deprecated 使用 weatherOptions 替代 */
export const times = [
  { id: "morning", label: "清晨", description: "柔和、希望、静谧", category: "时段" },
  { id: "afternoon", label: "午后", description: "慵懒、温暖、闲适", category: "时段" },
  { id: "sunset", label: "黄昏", description: "浪漫、怀旧、柔和", category: "时段" },
  { id: "night", label: "夜晚", description: "静谧、神秘、灯光", category: "时段" },
  { id: "spring", label: "春天", description: "生机、绿意、花开", category: "季节" },
  { id: "summer", label: "夏天", description: "明媚、浓绿、阳光", category: "季节" },
  { id: "autumn", label: "秋天", description: "金黄、温暖、落叶", category: "季节" },
  { id: "winter", label: "冬天", description: "清冷、温暖室内、雪", category: "季节" },
  { id: "sunny", label: "晴天", description: "明亮、通透、阳光", category: "天气" },
  { id: "cloudy", label: "阴天", description: "柔和、静谧、低对比", category: "天气" },
  { id: "rainy", label: "雨天", description: "湿润、诗意、反光", category: "天气" },
];

/** @deprecated 使用 timesByCategory 替代 */
export const timesByCategory = {
  "时段": times.filter(t => t.category === "时段"),
  "季节": times.filter(t => t.category === "季节"),
  "天气": times.filter(t => t.category === "天气"),
};

/** @deprecated 不再需要 */
export const focuses = [
  { id: "space", label: "空间为主", description: "展示环境，人物小或 absent" },
  { id: "person", label: "人物为主", description: "传统人像，突出人物" },
  { id: "balanced", label: "人与空间平衡", description: "两者兼顾" },
  { id: "detail", label: "细节特写", description: "聚焦某个局部" },
];

/** @deprecated 使用 lightingQualities 替代 */
export const lightings = [
  { id: "natural", label: "自然光", description: "窗户光，柔和真实" },
  { id: "golden-hour", label: "黄金时刻", description: "日出日落，温暖柔和" },
  { id: "overcast", label: "阴天散射", description: "均匀柔和，低对比" },
  { id: "rim-light", label: "侧逆光", description: "轮廓光，戏剧性强" },
  { id: "soft", label: "柔光", description: "无硬影，适合人像" },
];

/** @deprecated 使用 allArchitecturalStyles 替代 */
export const cultures = [
  { id: "lingnan", label: "岭南文化", description: "满洲窗、花砖、骑楼、工夫茶", region: "中国" },
  { id: "shanghai", label: "上海石库门", description: "老钢窗、Art Deco、花园里弄", region: "中国" },
  { id: "jiangnan", label: "江南水乡", description: "白墙黛瓦、漏窗、小桥流水", region: "中国" },
  { id: "beijing", label: "北京胡同", description: "四合院、青砖、枣树、鸟笼", region: "中国" },
  { id: "sichuan", label: "川西民居", description: "竹编、天井、茶馆", region: "中国" },
  { id: "yunnan", label: "云南民族", description: "扎染、火塘、梯田", region: "中国" },
  { id: "silk-road", label: "丝绸之路", description: "敦煌、石窟、大漠", region: "中国" },
  { id: "hongkong", label: "香港复古", description: "霓虹灯、唐楼、茶餐厅", region: "中国" },
  { id: "taiwan", label: "台湾眷村", description: "铁窗花、马赛克、老邮筒", region: "中国" },
  { id: "wabi-sabi", label: "日式侘寂", description: "枯山水、苔藓、残缺美", region: "日本" },
  { id: "kyoto-machiya", label: "京都町屋", description: "格子窗、土间、中庭、和纸", region: "日本" },
  { id: "okinawa", label: "冲绳琉球", description: "红瓦、狮子、亚热带、海洋", region: "日本" },
  { id: "tokyo-modern", label: "东京现代", description: "极简、水泥、落地窗、都市冷峻", region: "日本" },
  { id: "nyonya", label: "南洋复古", description: "花砖、藤编、百叶窗、娘惹文化", region: "东南亚" },
  { id: "bali", label: "巴厘岛", description: "石雕、茅草、热带植物、泳池", region: "东南亚" },
  { id: "thai-lanna", label: "泰北兰纳", description: "木雕、金箔、寺庙元素", region: "东南亚" },
  { id: "provence", label: "南法", description: "薰衣草、石屋、铁艺、田园", region: "欧洲" },
  { id: "tuscany", label: "托斯卡纳", description: "红瓦、橄榄树、意式乡村", region: "欧洲" },
  { id: "scandinavian", label: "北欧", description: "原木、hygge、极简、温馨", region: "欧洲" },
  { id: "greek-islands", label: "希腊", description: "蓝顶白墙、地中海、悬崖", region: "欧洲" },
  { id: "british-country", label: "英式乡村", description: "壁炉、碎花、下午茶、庄园", region: "欧洲" },
  { id: "manhattan-loft", label: "曼哈顿", description: "Loft、工业风、落地窗", region: "美洲" },
  { id: "california", label: "加州", description: "棕榈树、泳池、Mid-century", region: "美洲" },
  { id: "mexican", label: "墨西哥", description: "色彩鲜艳、瓷砖、仙人掌", region: "美洲" },
];

/** @deprecated 使用 allArchitecturalStyles 替代 */
export const culturesByRegion = {
  "中国": cultures.filter(c => c.region === "中国"),
  "日本": cultures.filter(c => c.region === "日本"),
  "东南亚": cultures.filter(c => c.region === "东南亚"),
  "欧洲": cultures.filter(c => c.region === "欧洲"),
  "美洲": cultures.filter(c => c.region === "美洲"),
};

// ========== 状态类型 ==========
export type TaskStatus =
  | "draft"
  | "generating_images"
  | "selecting"
  | "generating_video"
  | "completed";

// ========== Task 类型 - 言画配置体系 v3 ==========
export interface Task {
  id: string;
  status: TaskStatus;

  // 言画配置体系 v3 - 7个维度
  coreEmotion: string;           // 维度1：核心情绪 - 单选
  architecturalStyle: string;    // 维度2：建筑风格/文化基因 - 单选
  region?: string;               // 维度3：地域 - 单选，可选
  spaceFunction: string;         // 维度4：空间功能 - 输入+预设
  weather: string;               // 维度5：天气/氛围 - 单选
  lightingQualities: string[];   // 维度6：光影质感 - 多选
  paintingStyles: string[];      // 维度7：绘画风格 - 多选

  // 补充描述
  description?: string;

  // 输出
  images?: string[];
  selectedImage?: string;
  videoUrl?: string;

  // 发布内容
  title?: string;
  content?: string;
  tags?: string[];

  // 元数据
  createdAt: string;
  updatedAt: string;
}

// ========== 向后兼容的类型（用于旧数据迁移）==========
/** @deprecated 使用 Task 替代 */
export interface LegacyTaskV1 {
  id: string;
  status: TaskStatus;
  style: string;
  scene: string;
  composition: string;
  lighting: string;
  culture: string;
  description?: string;
  images?: string[];
  selectedImage?: string;
  videoUrl?: string;
  title?: string;
  content?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

/** @deprecated 使用 Task 替代 */
export interface LegacyTaskV2 {
  id: string;
  status: TaskStatus;
  // 新配置体系 v2
  baseStyle: string;
  textureOverlays: string[];
  scene: string;
  culture: string;
  time: string[];
  focus: string;
  lighting: string;
  description?: string;
  // 输出
  images?: string[];
  selectedImage?: string;
  videoUrl?: string;
  // 发布内容
  title?: string;
  content?: string;
  tags?: string[];
  // 元数据
  createdAt: string;
  updatedAt: string;
}
