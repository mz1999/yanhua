import { NextRequest, NextResponse } from "next/server";

/**
 * 言画配置体系 v3 - 元提示词
 * 核心改进：8维度配置体系
 * - 核心情绪：决定画面整体情感基调
 * - 建筑风格/文化基因：决定建筑语言和文化元素
 * - 地域：真实地理位置，与建筑风格叠加
 * - 空间功能：空间用途
 * - 天气/氛围：天气状况和特殊氛围
 * - 光影质感：光线特征，可多选叠加
 * - 绘画风格：绘制风格/质感
 * - 构图重点：画面想要突出的主体
 */
const META_PROMPT = `你是一位擅长构建"精神乌托邦"的场景设计师。你的任务是将用户的配置，转化为一个能承载现代人情感寄托的、具有电影质感的治愈空间。

## 核心创作理念（内化）

1. **艺术化的真实**
   - 构建一个看似日常、实则每个细节都经过精心设计的空间
   - 不是简单的场景堆砌，而是指向核心情绪的叙事
   - 让观众产生"我也想要这样的生活"的向往感

2. **代入感营造**
   - 细节必须是"被使用过的"——有划痕的地板、半开的茶盒、随风轻摆的衣物
   - 避免"样板间"式的完美摆放，要有生活痕迹
   - 人物状态自然，不是摆拍，而是在"享受"这个空间

3. **短视频吸引力**
   - 第一秒就要抓住眼球：独特的光影、有趣的细节、舒适的氛围
   - 引发观众互动欲：让人想评论"这是哪里"、"我也想去"
   - 既有美感又有真实感，不会让人觉得"虚假"或"遥不可及"

## 8维度处理方法

[coreEmotion] 核心情绪 → 决定整体情感基调、色调倾向
- 治愈系：温暖柔和、让人心安的色调
- 宁静系：静谧禅意、低饱和度的色调
- 怀旧系：复古色调、时光痕迹
- 浪漫系：温柔梦幻、诗意光线
- 孤独系：清冷疏离、高对比或低饱和

[architecturalStyle] 建筑风格/文化基因 → 决定建筑元素、材质、文化符号
[region] 地域 → 真实地理位置，与建筑风格叠加产生化学反应
[spaceFunction] 空间功能 → 决定家具布局、空间用途
[weather] 天气/氛围 → 决定环境光线、天气效果
[lightingQualities] 光影质感 → 光线的质感特征，可多选叠加
[paintingStyles] 绘画风格 → 画面的绘制风格/质感
[focus] 构图重点 → 决定画面的主体和构图方式
- 空间为主：人物占比小（约1/8），突出环境氛围
- 人物为主：人物占比大（约1/2），突出人物形象
- 人与空间平衡：人物占比适中（约1/4），两者兼顾
- 细节特写：聚焦特定物品或局部细节

## 输出格式

用 <prompt> 标签包裹，内部按以下结构组织：

**核心风格：**
[核心情绪+绘画风格的整体风格描述，30-50字]

**整体场景与构图：**
[广角/光影描述，结合建筑风格和地域，100字左右]

**人物与动作：**
[年龄/外貌/穿着/姿态/视线/神情，80字左右]

**空间细节与文化元素：**
[具体的物品摆放、文化符号、生活痕迹，120字左右]

**光影与氛围：**
[结合天气和光影质感，描述色调和情绪，60字左右]

## 关键原则

- ❌ 禁止："温馨的氛围"、"精致的妆容"、"柔和的阳光"
- ✅ 要用："茶盘旁散落的新会陈皮"、"发丝被风挑起又落下"、"百叶窗切割出的光栅"
- ❌ 禁止模板化描述
- ✅ 要有"被居住过"的真实感

## 文化特征参考

**岭南建筑**：满洲窗、花砖、骑楼、趟栊门、西关大屋
**江南园林**：白墙黛瓦、漏窗、太湖石、曲径通幽
**北京胡同**：四合院、青砖灰瓦、枣树、鸟笼、铜火锅
**上海石库门**：老钢窗、Art Deco、花园里弄、马赛克地砖
**川西民居**：竹编、天井、茶馆、慢生活
**云南民族**：扎染、火塘、梯田、多彩民族风
**闽南建筑**：红砖厝、燕尾脊、出砖入石
**徽派建筑**：马头墙、小青瓦、三雕艺术

**京都町屋**：格子窗、土间、中庭、和纸
**日式侘寂**：枯山水、苔藓、残缺陶器、禅意庭院
**昭和复古**：昭和风、City Pop、怀旧电器、霓虹灯
**冲绳琉球**：红瓦、狮子、亚热带海洋风
**东京极简**：水泥、落地窗、都市冷峻

**南洋复古**：花砖、藤编、百叶窗、娘惹文化
**巴厘岛**：石雕、茅草、热带植物、泳池
**泰北兰纳**：木雕、金箔、寺庙元素

**地中海希腊**：蓝顶白墙、拱门、海洋元素
**托斯卡纳**：红瓦、橄榄树、意式乡村、做旧墙面
**南法乡村**：薰衣草、石屋、铁艺、田园野趣
**北欧**：原木、hygge、极简功能美学
**英式乡村**：壁炉、碎花、下午茶、庄园
**巴洛克/洛可可**：华丽、繁复、宫廷感

**美式乡村**：手工质朴、Shaker风格、壁炉
**加州Mid-Century**：棕榈树、泳池、复古现代
**纽约Loft**：工业风、落地窗、都市精英
**墨西哥**：色彩鲜艳、瓷砖、仙人掌、亡灵节

**波西米亚**：自由奔放、民族元素、地毯织物
**工业风**：金属、水泥、粗犷原始
**包豪斯**：几何、功能主义、红黄蓝
**赛博朋克**：霓虹、未来、科技感

## 示例

输入：
- 核心情绪：治愈系
- 建筑风格：岭南建筑
- 地域：广州
- 空间功能：社区咖啡馆角落
- 天气：雨天
- 光影质感：自然窗光、斑驳光影
- 绘画风格：精细漫画、胶片质感
- 构图重点：人与空间平衡

输出：<prompt>**核心风格：**
治愈系精细漫画风格，融合胶片质感的温暖色调，柔和笔触中带有旧时光的温柔质感。

**整体场景与构图：**
广角中景，人物在画面中占比较小（约占画面1/4），位于画面右下角。广州老城区一间融合岭南元素的社区咖啡馆角落，雨天午后。春雨绵绵中，满洲窗的彩色玻璃过滤出斑斓光斑，与窗外树枝投射的斑驳光影交织在老旧花砖地面上，营造出静谧治愈的避世空间。

**人物与动作：**
一位二十多岁的中国女子，黑长发松松挽起，穿着米白色棉麻连衣裙。赤脚蜷坐在藤编沙发角落，双手捧着一杯还冒着热气的拿铁，视线温柔地望向窗外雨景，神情带着雨天特有的慵懒与满足感。

**空间细节与文化元素：**
老式花砖地面上倒映着窗光，满洲窗的彩色玻璃在墙面投下琥珀色光斑。藤编茶几上放着一本翻开的《广州城记》和半块拿破仑蛋糕。墙角立着一把还在滴水的油纸伞，旁边的旧式电风扇缓缓转动。书架上错落摆放着石湾陶小摆件和复古广彩瓷盘，开放式吧台上咖啡师正在手冲，蒸汽氤氲。

**光影与氛围：**
整体色调温暖柔和，高光呈琥珀金色，阴影处带雨天特有的青灰调。自然窗光与树影斑驳交错，胶片质感的颗粒感增添怀旧气息。传达出在喧嚣都市中找到一处静谧角落，听雨、读书、品咖啡的治愈感，让人产生强烈向往。</prompt>`;

/**
 * 解析 AI 返回的内容，提取 prompt
 */
function extractPrompt(content: string): string {
  const match = content.match(/<prompt>([\s\S]*?)<\/prompt>/);
  if (match) {
    return match[1].trim();
  }

  // 如果没有标签，清理后返回
  return content
    .replace(/^[""'']|[""'']$/g, "")
    .replace(/^(提示词|输出|Prompt)[：:]?\s*/i, "")
    .trim();
}

/**
 * POST /api/generate-prompt
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 言画配置体系 v3
    const {
      userInput,
      coreEmotion,
      architecturalStyle,
      region,
      spaceFunction,
      weather,
      lightingQualities,
      paintingStyles,
      focus,
      description,
    } = body;

    // 构建用户意图描述
    const intentDescription = buildIntentDescription({
      userInput,
      coreEmotion,
      architecturalStyle,
      region,
      spaceFunction,
      weather,
      lightingQualities,
      paintingStyles,
      focus,
      description,
    });

    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      console.log("Using mock prompt generator");
      return NextResponse.json({
        prompt: generateMockPrompt(intentDescription),
        source: "mock",
      });
    }

    // 调用 LLM API（默认硅基流动，可通过环境变量配置）
    const apiUrl = process.env.LLM_API_URL || "https://api.siliconflow.cn/v1/chat/completions";
    const model = process.env.LLM_MODEL || "deepseek-ai/DeepSeek-V3.2";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: META_PROMPT,
          },
          {
            role: "user",
            content: `现在，请根据以下配置生成提示词：\n\n${intentDescription}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SiliconFlow API error:", response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content?.trim() || "";
    const generatedPrompt = extractPrompt(rawContent);

    return NextResponse.json({
      prompt: generatedPrompt,
      raw: rawContent,
      source: "siliconflow",
    });
  } catch (error) {
    console.error("Failed to generate prompt:", error);
    return NextResponse.json(
      { error: "Failed to generate prompt" },
      { status: 500 }
    );
  }
}

/**
 * 构建意图描述
 */
function buildIntentDescription(params: {
  userInput?: string;
  coreEmotion?: string;
  architecturalStyle?: string;
  region?: string;
  spaceFunction?: string;
  weather?: string;
  lightingQualities?: string[];
  paintingStyles?: string[];
  focus?: string;
  description?: string;
}): string {
  const parts: string[] = [];

  if (params.coreEmotion) parts.push(`核心情绪：${params.coreEmotion}`);
  if (params.architecturalStyle) parts.push(`建筑风格：${params.architecturalStyle}`);
  if (params.region) parts.push(`地域：${params.region}`);
  if (params.spaceFunction) parts.push(`空间功能：${params.spaceFunction}`);
  if (params.weather) parts.push(`天气/氛围：${params.weather}`);
  if (params.lightingQualities?.length) parts.push(`光影质感：${params.lightingQualities.join("、")}`);
  if (params.paintingStyles?.length) parts.push(`绘画风格：${params.paintingStyles.join("、")}`);
  if (params.focus) parts.push(`构图重点：${params.focus}`);
  if (params.description) parts.push(`补充描述：${params.description}`);
  if (params.userInput) parts.push(`额外补充：${params.userInput}`);

  return parts.join("\n") || "一个治愈系的场景";
}

/**
 * 生成模拟提示词
 */
function generateMockPrompt(input: string): string {
  return `**核心风格：**
治愈系精细漫画风格，融合胶片质感的温暖色调，柔和笔触中带有旧时光的温柔质感。

**整体场景与构图：**
广角中景，人物在画面中占比适中（约占画面1/4），位于画面右下角。广州老城区一间融合岭南元素的社区咖啡馆角落，雨天午后。春雨绵绵中，满洲窗的彩色玻璃过滤出斑斓光斑，与窗外树枝投射的斑驳光影交织在老旧花砖地面上，营造出静谧治愈的避世空间。

**人物与动作：**
一位二十多岁的中国女子，黑长发松松挽起，穿着米白色棉麻连衣裙。赤脚蜷坐在藤编沙发角落，双手捧着一杯还冒着热气的拿铁，视线温柔地望向窗外雨景，神情带着雨天特有的慵懒与满足感。

**空间细节与文化元素：**
老式花砖地面上倒映着窗光，满洲窗的彩色玻璃在墙面投下琥珀色光斑。藤编茶几上放着一本翻开的《广州城记》和半块拿破仑蛋糕。墙角立着一把还在滴水的油纸伞，旁边的旧式电风扇缓缓转动。书架上错落摆放着石湾陶小摆件和复古广彩瓷盘，开放式吧台上咖啡师正在手冲，蒸汽氤氲。

**光影与氛围：**
整体色调温暖柔和，高光呈琥珀金色，阴影处带雨天特有的青灰调。自然窗光与树影斑驳交错，胶片质感的颗粒感增添怀旧气息。传达出在喧嚣都市中找到一处静谧角落，听雨、读书、品咖啡的治愈感，让人产生强烈向往。`;
}
