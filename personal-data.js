// Editable personal portfolio data. Project order lives in project-order.js.
import { orderProjects } from './project-order.js';
import { cgStudies } from './cg-studies-data.js';

export const person = {
  "name": "李明泽",
  "englishName": "MINGZE LI",
  "role": "AI ART & VISUAL DESIGN",
  "intro": "将导演创意转化为广告视觉，专注画风、光影与质感。",
  "bio": "从三维与动态设计走向 AI 广告美术。在商业项目中探索写实影像、风格化表达与连续镜头的视觉统一，让想法拥有具体的画面。",
  "email": "1158609347@qq.com",
  "wechat": "lmz-Apr18",
  "roleZh": "AI 美术与视觉设计",
  "introEn": "Translating a director’s ideas into advertising visuals, with a focus on style, light and material quality.",
  "bioEn": "My practice spans 3D, motion design and AI advertising art. I work with realistic imagery, stylized expression and visual continuity across shots.",
  "currentWork": "三不五时 · AI 广告美术 / 视觉设计",
  "currentWorkEn": "SOMEWHILE · AI Art / Visual Design",
  "emailHref": "mailto:1158609347@qq.com",
  "resume": "resume.html",
  "resumePdf": "assets/mingze-li-resume.pdf",
  "portrait": "assets/mingze-studio-portrait.jpg",
  "portraitFallback": "MINGZE LI / 李明泽 文字身份，不使用 AI 项目角色或他人照片冒充本人",
  "tools": [
    "Cinema 4D",
    "Octane",
    "After Effects",
    "Photoshop"
  ],
  "focus": [
    "广告画风",
    "角色与场景",
    "光影与材质",
    "视觉一致性",
    "三维与动态设计"
  ],
  "education": {
    "school": "西安外国语大学",
    "schoolEn": "Xi’an International Studies University",
    "degree": "视觉传达设计 · 本科",
    "degreeEn": "BA, Visual Communication Design",
    "period": "2022.09 — 2026.06"
  },
  "experience": [
    {
      "company": "三不五时",
      "companyEn": "SOMEWHILE",
      "role": "AI 广告美术 / 视觉设计",
      "roleEn": "AI Art / Visual Design",
      "period": "2026 — 至今",
      "description": "将导演创意转化为广告画风、光影与美术质感，交付整体视觉方向与关键视觉。"
    },
    {
      "company": "CCLAB",
      "companyEn": "CCLAB",
      "role": "三维动态设计师助理 · 实习",
      "roleEn": "3D Motion Design Assistant · Internship",
      "period": "2024.07 — 2024.09",
      "description": "参与商业动画项目的模型构建、场景搭建与动态效果制作。"
    }
  ],
  "honors": [
    {
      "title": "米兰设计周非命题组 国赛二等奖",
      "year": "2025"
    },
    {
      "title": "大学生广告艺术大赛 省赛三等奖",
      "year": "2023"
    }
  ]
};

export const projectCatalog = {
  "seedance": {
    "id": "seedance",
    "title": "Seedance 2.5 发布会",
    "englishTitle": "REALITY, REIMAGINED",
    "category": "写实奇观 / 角色与场景",
    "year": "2026",
    "duration": "02:37",
    "tagline": "让奇观发生在真实的世界里。",
    "summary": "从日常街景到超现实城市，以真实的光影和材质连接角色、空间与想象。",
    "focus": [
      "真实影调",
      "角色设定",
      "场景统一"
    ],
    "description": "以写实影像为视觉基础，让纸牌建筑、积木城市与日常生活出现在同一个世界。围绕角色外观、场景结构和镜头取景展开美术设计，并通过设定表与版本迭代逐步明确画面。",
    "chapters": [
      {
        "title": "现实中的奇观",
        "text": "纸牌建筑、彩色积木与巨型仓鼠出现在城市水岸。街道、车辆和建筑提供熟悉的尺度，日照与表面质感连接真实环境和奇观元素。",
        "image": "assets/seedance-city-surreal.webp"
      },
      {
        "title": "角色的视觉身份",
        "text": "角色以正面、侧面、斜侧和背面展开，服装配色、体态与发型保持对应。设定图将人物外观具体化，提供不同观看角度的视觉参照。",
        "image": "assets/seedance-character.webp"
      },
      {
        "title": "空间与影调",
        "text": "货架与柜台分列两侧，玻璃入口连接明亮街道与偏暗室内。商品包装、表面反光和空间纵深共同呈现便利店的日常生活质感。",
        "image": "assets/seedance-scene-01.webp"
      },
      {
        "title": "场景细节的落点",
        "text": "浇花远景保留连续白色栅栏、墙边花架和成排住宅。人物置于花草之间，建筑的透视与侧向日光构成场景的层次和生活氛围。",
        "image": "assets/seedance-iteration-02.webp"
      }
    ],
    "tools": [],
    "processNote": "",
    "titleEn": "Seedance 2.5 Launch",
    "headlineEn": "REALITY, REIMAGINED",
    "categoryEn": "Surreal Realism / Character & Environment",
    "summaryEn": "Everyday streets and extraordinary cities, connected through natural light, material detail and a coherent visual world.",
    "role": "AI 美术 / 视觉风格与质感",
    "roleEn": "AI Art / Visual Style & Look Development",
    "contribution": "承接导演转译的创意方向，负责广告画风、美术质感、整体视觉方向与美术视觉。",
    "contributionEn": "Developing the advertising look, visual quality and key art from the director’s creative direction.",
    "cover": "assets/seedance-cover.webp",
    "preview": "assets/seedance-preview.mp4",
    "film": "assets/seedance-film.mp4",
    "stills": [
      "assets/seedance-01.webp",
      "assets/seedance-02.webp",
      "assets/seedance-03.webp",
      "assets/seedance-04.webp"
    ],
    "process": {
      "character": [
        "assets/seedance-character.webp",
        "assets/seedance-expressions.webp"
      ],
      "environment": [
        "assets/seedance-scene-01.webp",
        "assets/seedance-scene-02.webp",
        "assets/seedance-scene-03.webp"
      ],
      "iteration": [
        "assets/seedance-iteration-01.webp",
        "assets/seedance-iteration-02.webp"
      ],
      "world": [
        "assets/seedance-city-normal.webp",
        "assets/seedance-city-surreal.webp"
      ]
    },
    "sourceFile": "seedance2.5发布会/0622_Seedance2.5_16比9.mp4",
    "durationSeconds": 156.95
  },
  "lixiang": {
    "id": "lixiang",
    "title": "李想的一天",
    "englishTitle": "BETWEEN REAL & DRAWN",
    "category": "汽车视觉 / 风格转换",
    "year": "2026",
    "duration": "03:53",
    "tagline": "在现实与漫画之间，寻找共同的视觉语言。",
    "summary": "围绕汽车与人物，将写实质感与漫画表达放入同一支影像。",
    "focus": [
      "汽车质感",
      "漫画表达",
      "风格衔接"
    ],
    "description": "写实与漫画形成两种观看方式。以人物、汽车和场景为主要视觉元素，处理材质、轮廓与色彩在不同画风中的变化，让每种表达保留自身特点，也能在影像中相互呼应。",
    "chapters": [
      {
        "title": "工作室的材质",
        "text": "高窗侧光照亮工作室中的汽车造型与人物，前景工具和台面形成纵深。偏暖的色彩将车身、木质陈设与空间表面连接在一起。",
        "image": "assets/lixiang-01.webp"
      },
      {
        "title": "漫画的表达",
        "text": "分格画面并置人物与汽车，黑色轮廓、网点和色块形成漫画质感。车身反光与人物近景以不同尺度展开，保留清楚的形体关系。",
        "image": "assets/lixiang-02.webp"
      },
      {
        "title": "沙漠中的汽车",
        "text": "汽车位于起伏沙丘之间，车辙延伸至前景，远山压低在地平线上。暖色日照勾勒车身轮廓，也呈现沙面与产品材质的区别。",
        "image": "assets/lixiang-03.webp"
      },
      {
        "title": "漫画中的空间",
        "text": "飞机穿过层叠云海，放射线和拟声字强化方向感。大幅外景与小格内部场景并置，暖色天空和绿色机身形成鲜明的视觉对比。",
        "image": "assets/lixiang-04.webp"
      }
    ],
    "tools": [],
    "processNote": "",
    "titleEn": "A Day with Li Xiang",
    "headlineEn": "BETWEEN REAL & DRAWN",
    "categoryEn": "Automotive Visuals / Mixed Styles",
    "summaryEn": "Realistic automotive imagery meets a graphic comic world through shape, color and surface detail.",
    "role": "AI 美术 / 视觉风格与质感",
    "roleEn": "AI Art / Visual Style & Look Development",
    "contribution": "承接导演转译的创意方向，负责广告画风、美术质感、整体视觉方向与美术视觉。",
    "contributionEn": "Developing the advertising look, visual quality and key art from the director’s creative direction.",
    "cover": "assets/lixiang-cover.webp",
    "preview": "assets/lixiang-preview.mp4",
    "film": "assets/lixiang-film.mp4",
    "stills": [
      "assets/lixiang-01.webp",
      "assets/lixiang-02.webp",
      "assets/lixiang-03.webp",
      "assets/lixiang-04.webp"
    ],
    "process": null,
    "sourceFile": "李想的一天/李想的一天.mp4",
    "durationSeconds": 233.27
  },
  "capcut": {
    "id": "capcut",
    "title": "CapCut World",
    "englishTitle": "EVERYDAY CINEMA",
    "category": "生活影像 / 创作想象",
    "year": "2026",
    "duration": "01:49",
    "tagline": "从日常片段，延伸到创作的想象。",
    "summary": "自然光下的生活、创作现场与微缩空间，在同一支影像中展开。",
    "focus": [
      "自然光感",
      "生活质感",
      "视觉想象"
    ],
    "description": "画面从日常人物与室内生活延伸到动作捕捉场景，再进入悬浮球体中的微缩空间。自然光、环境细节与不同尺度的变化，构成生活质感和视觉想象之间的联系。",
    "chapters": [
      {
        "title": "逆光中的人物",
        "text": "低角度日光从人物身后进入，发丝和侧脸边缘带有暖色亮部。背景建筑与涂鸦保留环境信息，明暗关系呈现户外生活的真实气息。",
        "image": "assets/capcut-01.webp"
      },
      {
        "title": "室内的光与生活",
        "text": "阳光从敞开的门口落入房间，在地面形成清楚的光影。人物处于室内外的交界，家具、织物与日常陈设共同构成生活空间。",
        "image": "assets/capcut-02.webp"
      },
      {
        "title": "创作现场的层次",
        "text": "人物身穿带标记点的服装展开双臂，显示器与工作人员分布在后景。服装、设备和屏幕光构成动作捕捉场景中不同层次的质感。",
        "image": "assets/capcut-03.webp"
      },
      {
        "title": "悬浮的微缩世界",
        "text": "悬浮球体中出现人物与桌面，窗景则保留日常空间的尺度。球面反射、室内光线与微缩场景并置，让熟悉的环境带有超现实意味。",
        "image": "assets/capcut-04.webp"
      }
    ],
    "tools": [],
    "processNote": "",
    "titleEn": "CapCut World",
    "headlineEn": "EVERYDAY CINEMA",
    "categoryEn": "Everyday Cinema / Creative Worlds",
    "summaryEn": "Natural light, lived-in spaces and unexpected changes of scale connect everyday life with creative imagination.",
    "role": "AI 美术 / 视觉风格与质感",
    "roleEn": "AI Art / Visual Style & Look Development",
    "contribution": "承接导演转译的创意方向，负责广告画风、美术质感、整体视觉方向与美术视觉。",
    "contributionEn": "Developing the advertising look, visual quality and key art from the director’s creative direction.",
    "cover": "assets/capcut-cover.webp",
    "preview": "assets/capcut-preview.mp4",
    "film": "assets/capcut-film.mp4",
    "stills": [
      "assets/capcut-01.webp",
      "assets/capcut-02.webp",
      "assets/capcut-03.webp",
      "assets/capcut-04.webp"
    ],
    "process": null,
    "sourceFile": "cupcut/CAPCUT WORLD_Delivery_21比9.mp4",
    "durationSeconds": 109.04
  },
  "recruitment": {
    "id": "recruitment",
    "title": "字节跳动校招",
    "englishTitle": "A WORLD OF POSSIBILITIES",
    "category": "实景融合 / 卡通与科技",
    "year": "2026",
    "duration": "02:03",
    "tagline": "让不同的视觉世界，在同一支影像里相遇。",
    "summary": "将实景、卡通与科技元素组合，探索多种美术语言的连接方式。",
    "focus": [
      "实景融合",
      "卡通表达",
      "科技氛围"
    ],
    "description": "实景提供熟悉的空间，卡通与科技元素拓展视觉想象。围绕不同形态之间的色彩、尺度和层次展开设计，让多种表达在同一支影像中形成清晰而活跃的视觉关系。",
    "chapters": [
      {
        "title": "城市里的音乐形象",
        "text": "半透明的卡通形象与键盘、萨克斯悬浮在城市上方。暖色天光下，蓝紫渐变与柔和高光形成区别于实景建筑的材质表达。",
        "image": "assets/recruitment-01.webp"
      },
      {
        "title": "卡通与城市尺度",
        "text": "橙色卡通形象居于城市上空，环形轨道与小型星球围绕主体。柔软圆润的造型与密集建筑形成尺度和材质上的鲜明对比。",
        "image": "assets/recruitment-02.webp"
      },
      {
        "title": "透明界面中的人物",
        "text": "卡通人物置于明亮的办公空间，蓝色光柱与图表叠在前景。透明界面、玻璃反射和柔和人物材质共同构成轻盈的科技画面。",
        "image": "assets/recruitment-03.webp"
      },
      {
        "title": "知识的想象空间",
        "text": "人物站在由公式、结构图与发光螺旋组成的空间中。冷色环境与明亮线条延伸至画面上方，形成包围人物的纵向尺度和层次。",
        "image": "assets/recruitment-04.webp"
      }
    ],
    "tools": [],
    "processNote": "",
    "titleEn": "ByteDance Campus Recruitment",
    "headlineEn": "A WORLD OF POSSIBILITIES",
    "categoryEn": "Live-action Worlds / Character & Technology",
    "summaryEn": "Playful characters, real environments and technological imagery meet through color, scale and composition.",
    "role": "AI 美术 / 视觉风格与质感",
    "roleEn": "AI Art / Visual Style & Look Development",
    "contribution": "承接导演转译的创意方向，负责广告画风、美术质感、整体视觉方向与美术视觉。",
    "contributionEn": "Developing the advertising look, visual quality and key art from the director’s creative direction.",
    "cover": "assets/recruitment-cover.webp",
    "preview": "assets/recruitment-preview.mp4",
    "film": "assets/recruitment-film.mp4",
    "stills": [
      "assets/recruitment-01.webp",
      "assets/recruitment-02.webp",
      "assets/recruitment-03.webp",
      "assets/recruitment-04.webp"
    ],
    "process": null,
    "sourceFile": "字节校招/260914_字节校招_clean.mp4",
    "durationSeconds": 122.6
  },
  "reno": {
    "id": "reno",
    "title": "OPPO Reno 开场片",
    "englishTitle": "YOUTH IN THE SUN",
    "category": "青春影像 / 日夜光影",
    "year": "2026",
    "duration": "00:34",
    "tagline": "从日光到烟火，记录青春的明亮。",
    "summary": "海边公路、街头自拍、日落草地与烟火夜景，共同组成明亮活跃的视觉片段。",
    "focus": [
      "暖阳影调",
      "青春色彩",
      "昼夜氛围"
    ],
    "description": "海边车行与大字排版、街头自拍与图形元素、草地人物与夜间烟火共同展开。日光的暖色和夜景的冷暖对照，让不同生活场景呈现各自的光线与情绪。",
    "chapters": [
      {
        "title": "海边公路与排版",
        "text": "汽车沿海边公路前行，暖色日照覆盖车身与岸边植物。大幅 Reno 字样叠入画面，以轮廓和实色的变化连接文字与环境。",
        "image": "assets/reno-01.webp"
      },
      {
        "title": "街头自拍与图形",
        "text": "人物近景置于明亮街道，彩色线条、星形与图形点缀周围。底部连续帧和画面中的界面元素并置，形成生活影像与图形的组合。",
        "image": "assets/reno-02.webp"
      },
      {
        "title": "日落草地的暖色",
        "text": "三人在开阔草地中奔跑，低处日光勾勒衣物与发丝。远山、天空和金色草地拉开空间层次，浅色服装让人物保持清晰可见。",
        "image": "assets/reno-03.webp"
      },
      {
        "title": "烟火夜景的冷暖",
        "text": "人物位于较暗前景，烟火在身后化作明亮散景。蓝色环境光与面部暖光形成对照，主体轮廓和背景光点共同组成夜间氛围。",
        "image": "assets/reno-04.webp"
      }
    ],
    "tools": [],
    "processNote": "",
    "titleEn": "OPPO Reno Opening Film",
    "headlineEn": "YOUTH IN THE SUN",
    "categoryEn": "Youthful Visuals / Day & Night",
    "summaryEn": "Coastal roads, street portraits, warm sunsets and fireworks create a bright, energetic visual sequence.",
    "role": "AI 美术 / 视觉风格与质感",
    "roleEn": "AI Art / Visual Style & Look Development",
    "contribution": "承接导演转译的创意方向，负责广告画风、美术质感、整体视觉方向与美术视觉。",
    "contributionEn": "Developing the advertising look, visual quality and key art from the director’s creative direction.",
    "cover": "assets/reno-cover.webp",
    "preview": "assets/reno-preview.mp4",
    "film": "assets/reno-film.mp4",
    "stills": [
      "assets/reno-01.webp",
      "assets/reno-02.webp",
      "assets/reno-03.webp",
      "assets/reno-04.webp"
    ],
    "process": null,
    "sourceFile": "OPPOReno开场片/260518_OPPO_reno_国际版.mp4",
    "durationSeconds": 34
  },
  "oppo": {
    "id": "oppo",
    "title": "OPPO × 孙颖莎",
    "englishTitle": "A MOMENT IN GREEN",
    "category": "人物与产品 / 自然绿意",
    "year": "2026",
    "duration": "00:21",
    "tagline": "在自然绿意中，连接人物与产品。",
    "summary": "草地、人物与绿色产品相互呼应，展现清爽自然的蓝绿影调与细腻材质。",
    "focus": [
      "人物质感",
      "绿色视觉",
      "产品光影"
    ],
    "description": "开阔草地与浅蓝天空构成主要环境，人物服装和绿色产品与场景色彩相互呼应。远景中的空间、近景中的人物，以及产品局部的微光与表面细节，呈现不同尺度的视觉质感。",
    "chapters": [
      {
        "title": "草地中的人物",
        "text": "开阔草地与浅蓝天空形成大面积色彩，人物立于画面偏左的位置。草叶的细密质感与远处起伏地形，构成自然空间的纵深。",
        "image": "assets/oppo-01.webp"
      },
      {
        "title": "人物与产品近景",
        "text": "人物手持绿色产品出现在近景，浅紫服装与蓝绿背景相互映衬。自然肤色、衣物褶皱与柔和天光，共同呈现清爽的人物质感。",
        "image": "assets/oppo-03.webp"
      },
      {
        "title": "产品的光与形",
        "text": "产品局部放大后，绿色表面、圆形结构与边缘高光成为画面主体。浅景深和细微反射拉开层次，呈现不同区域的材质差别。",
        "image": "assets/oppo-02.webp"
      },
      {
        "title": "舒展的远景",
        "text": "人物张开双臂站在草地中央，前景草叶与远处丘陵层层展开。留出大片天空和环境，让人物姿态与开阔空间形成轻松的视觉关系。",
        "image": "assets/oppo-04.webp"
      }
    ],
    "tools": [],
    "processNote": "",
    "titleEn": "OPPO × Sun Yingsha",
    "headlineEn": "A MOMENT IN GREEN",
    "categoryEn": "Portrait & Product / Natural Greens",
    "summaryEn": "Fresh blue-green tones connect open landscapes, portrait detail and the subtle surfaces of the product.",
    "role": "AI 美术 / 视觉风格与质感",
    "roleEn": "AI Art / Visual Style & Look Development",
    "contribution": "承接导演转译的创意方向，负责广告画风、美术质感、整体视觉方向与美术视觉。",
    "contributionEn": "Developing the advertising look, visual quality and key art from the director’s creative direction.",
    "cover": "assets/oppo-cover.webp",
    "preview": "assets/oppo-preview.mp4",
    "film": "assets/oppo-film.mp4",
    "stills": [
      "assets/oppo-01.webp",
      "assets/oppo-02.webp",
      "assets/oppo-03.webp",
      "assets/oppo-04.webp"
    ],
    "process": null,
    "sourceFile": "oppo孙颖莎迁移/0323_OPPO_v2.m4v",
    "durationSeconds": 20.72
  },
  "dreame": {
    "year": "2026",
    "role": "AI 美术 / 视觉风格与质感",
    "roleEn": "AI Art / Visual Style & Look Development",
    "contribution": "承接导演转译的创意方向，负责广告画风、美术质感、整体视觉方向与美术视觉。",
    "contributionEn": "Developing the advertising look, visual quality and key art from the director’s creative direction.",
    "tools": [],
    "processNote": "",
    "id": "dreame",
    "title": "追觅手机",
    "titleEn": "Dreame Phone",
    "englishTitle": "FORM / ORNAMENT",
    "headlineEn": "FORM / ORNAMENT",
    "type": "still",
    "format": "美术静帧",
    "formatEn": "ART STUDIES",
    "category": "产品视觉 / 材质与装饰",
    "categoryEn": "Product Imagery / Materials & Ornament",
    "duration": "",
    "durationSeconds": null,
    "tagline": "用材质与装饰，建立产品的气质。",
    "summary": "围绕手机的形体与表面，以织物、金属、宝石感细节与不同色彩环境展开产品美术视觉。",
    "summaryEn": "Phone forms and surfaces explored through textiles, metal, jewel-like details and distinct color environments.",
    "description": "六组美术拼版从红色织物、珠宝般的局部，到浅色丝绸、绿色背景和蓝金花纹，呈现不同产品配色与装饰语言。画面通过高光、表面细节与环境材质建立视觉层次。",
    "focus": [
      "产品形体",
      "装饰材质",
      "配色与光影"
    ],
    "cover": "assets/dreame-cover.webp",
    "preview": "",
    "film": "",
    "stills": [
      "assets/dreame-01.webp",
      "assets/dreame-02.webp",
      "assets/dreame-03.webp",
      "assets/dreame-04.webp",
      "assets/dreame-05.webp",
      "assets/dreame-06.webp"
    ],
    "process": null,
    "chapters": [
      {
        "title": "红色织物与珠宝细节",
        "text": "红色产品置于深色织物之间，金属边缘与宝石般的局部形成明暗和材质对比。上下画面分别呈现整体与细节。",
        "image": "assets/dreame-01.webp",
        "layout": "portrait"
      },
      {
        "title": "浅色与绿色的产品气质",
        "text": "浅色手机与柔软丝绸相互映衬，绿色产品则与深绿环境连接。金色线条为两种画面提供细致的轮廓。",
        "image": "assets/dreame-02.webp",
        "layout": "portrait"
      },
      {
        "title": "装饰图案与金属曲面",
        "text": "浅金色图案、珍珠般的光泽与流动金属表面组合，强调产品背板装饰和镜头区域的形体。",
        "image": "assets/dreame-03.webp",
        "layout": "portrait"
      },
      {
        "title": "深色结构与红色纹理",
        "text": "棱角明确的背景、深色表面与红色纹理并置，以局部高光呈现边框和镜头结构。",
        "image": "assets/dreame-04.webp",
        "layout": "portrait"
      },
      {
        "title": "金色光线与时间意象",
        "text": "金色产品与钟面、流动颗粒共同构成画面，表面纹理和刻度形成细密的视觉节奏。",
        "image": "assets/dreame-05.webp",
        "layout": "portrait"
      },
      {
        "title": "蓝金花纹与流动线条",
        "text": "蓝色花朵与金色线条围绕产品展开，装饰纹样从手机表面延伸到环境。",
        "image": "assets/dreame-06.webp",
        "layout": "portrait"
      }
    ]
  },
  "airforce": {
    "year": "2026",
    "role": "AI 美术 / 视觉风格与质感",
    "roleEn": "AI Art / Visual Style & Look Development",
    "contribution": "承接导演转译的创意方向，负责广告画风、美术质感、整体视觉方向与美术视觉。",
    "contributionEn": "Developing the advertising look, visual quality and key art from the director’s creative direction.",
    "tools": [],
    "processNote": "",
    "id": "airforce",
    "title": "空军",
    "titleEn": "Air Force",
    "englishTitle": "ABOVE THE CLOUDS",
    "headlineEn": "ABOVE THE CLOUDS",
    "type": "film",
    "format": "完整影片",
    "formatEn": "FULL FILM",
    "category": "航空影像 / 叙事场景",
    "categoryEn": "Aviation Imagery / Narrative Scenes",
    "duration": "01:15",
    "durationSeconds": 75.31,
    "tagline": "从云层与座舱，展开飞行的视觉尺度。",
    "summary": "从历史场景到云层与海面，以航空器、座舱和人物串联宏观空间与叙事氛围。",
    "summaryEn": "From historical scenes to clouds and open water, aircraft, cockpit views and characters connect expansive spaces with narrative atmosphere.",
    "description": "影片围绕历史场景、云层飞行、座舱近景与空中协同展开，将地面叙事和航空空间连接起来。项目同时保留人物与航空场景美术静帧，呈现宏观空间和近距离观看的关系。",
    "focus": [
      "天空与尺度",
      "航空材质",
      "人物与场景"
    ],
    "cover": "assets/airforce-cover.webp",
    "preview": "assets/airforce-preview.mp4",
    "film": "assets/airforce-film.mp4",
    "stills": [
      "assets/airforce-01.webp",
      "assets/airforce-02.webp",
      "assets/airforce-03.webp",
      "assets/airforce-04.webp",
      "assets/airforce-05.webp",
      "assets/airforce-06.webp",
      "assets/airforce-07.webp",
      "assets/airforce-08.webp"
    ],
    "process": null,
    "chapters": [
      {
        "title": "云层之上",
        "text": "尾部视角将战机轮廓置于大面积云海前方，亮色天空与发动机光点构成画面的远近层次。",
        "image": "assets/airforce-01.webp",
        "layout": "wide"
      },
      {
        "title": "机体与弧形云海",
        "text": "近距离侧前方视角强调机身曲面，云层的弧形走势与飞行方向共同组织空间。",
        "image": "assets/airforce-03.webp",
        "layout": "wide"
      },
      {
        "title": "座舱中的人物",
        "text": "飞行员面罩与头盔位于前景，甲板和远处海面在后景延伸，连接人物近景与飞行环境。",
        "image": "assets/airforce-05.webp",
        "layout": "wide"
      },
      {
        "title": "运输机与天空轨迹",
        "text": "运输机周围的明亮弧线展开在深浅交叠的云层中，形成机体、光点与天空的尺度对比。",
        "image": "assets/airforce-08.webp",
        "layout": "wide"
      }
    ],
    "sourceFile": "空军项目/111.mp4"
  },
  "vivix": {
    "year": "2026",
    "role": "AI 美术 / 视觉风格与质感",
    "roleEn": "AI Art / Visual Style & Look Development",
    "contribution": "承接导演转译的创意方向，负责广告画风、美术质感、整体视觉方向与美术视觉。",
    "contributionEn": "Developing the advertising look, visual quality and key art from the director’s creative direction.",
    "tools": [],
    "processNote": "",
    "id": "vivix",
    "title": "vivix 世界模型",
    "titleEn": "VIVIX World Model",
    "englishTitle": "WORLDS WITHIN REACH",
    "headlineEn": "WORLDS WITHIN REACH",
    "type": "film",
    "category": "世界模型影像 / 城市与奇想",
    "categoryEn": "World Model Imagery / Cities & Imagination",
    "duration": "01:50",
    "durationSeconds": 110.33,
    "tagline": "从熟悉的城市，进入不断变化的世界。",
    "summary": "真实街区、巨型猫咪、幻想城市与空间变化，共同组成世界模型展示中的视觉想象。",
    "summaryEn": "Real city streets, a giant cat, imagined cities and spatial transformations unfold in a world-model showcase.",
    "description": "影片从人物与日常城市进入多种视觉世界。建筑、角色与环境在不同尺度和画风中变化，真实的表面细节与风格化空间并置，形成连续的视觉探索。",
    "focus": [
      "城市尺度",
      "空间变化",
      "风格化世界"
    ],
    "cover": "assets/vivix-cover.webp",
    "preview": "assets/vivix-preview.mp4",
    "film": "assets/vivix-film.mp4",
    "stills": [
      "assets/vivix-01.webp",
      "assets/vivix-02.webp",
      "assets/vivix-03.webp",
      "assets/vivix-04.webp"
    ],
    "process": null,
    "sourceFile": "vivix世界模型/世界模型_双语.mp4",
    "chapters": [
      {
        "title": "城市的日常尺度",
        "text": "建筑、道路与沿街细节构成熟悉的城市空间，为后续尺度和画风变化提供参照。",
        "image": "assets/vivix-01.webp",
        "layout": "wide"
      },
      {
        "title": "巨型猫咪与彩色街区",
        "text": "猫咪被放大到建筑尺度，暖色毛发与粉色街角并置，在熟悉城市中形成超现实画面。",
        "image": "assets/vivix-02.webp",
        "layout": "wide"
      },
      {
        "title": "云间的幻想城市",
        "text": "层叠云雾包围起伏地形与彩色建筑，柔和光线连接复杂空间与轻盈的幻想氛围。",
        "image": "assets/vivix-03.webp",
        "layout": "wide"
      },
      {
        "title": "转动中的建筑空间",
        "text": "倾斜建筑与云雾从不同方向进入画面，透视变化让原本熟悉的空间呈现新的观看方式。",
        "image": "assets/vivix-04.webp",
        "layout": "wide"
      }
    ]
  },
  "volcano": {
    "year": "2026",
    "role": "AI 美术 / 视觉风格与质感",
    "roleEn": "AI Art / Visual Style & Look Development",
    "contribution": "承接导演转译的创意方向，负责广告画风、美术质感、整体视觉方向与美术视觉。",
    "contributionEn": "Developing the advertising look, visual quality and key art from the director’s creative direction.",
    "tools": [],
    "processNote": "",
    "id": "volcano",
    "title": "火山汽车",
    "titleEn": "Volcano Engine · Automotive",
    "englishTitle": "MOTION / EVERYDAY",
    "headlineEn": "MOTION / EVERYDAY",
    "type": "film",
    "category": "汽车与科技 / 生活场景",
    "categoryEn": "Automotive & Technology / Everyday Scenes",
    "duration": "04:15",
    "durationSeconds": 254.7,
    "tagline": "让汽车，进入不同生活的风景。",
    "summary": "从城市道路到山景与森林，以汽车、人物和生活环境串联科技应用的视觉场景。",
    "summaryEn": "From city streets to mountain roads and forests, cars, people and everyday environments connect the film’s technology scenarios.",
    "description": "影片围绕汽车相关技术与生活应用展开。城市街道、山间道路和森林停车场景提供不同环境，车身反光、自然光线和人物状态共同呈现产品与生活的关系。",
    "focus": [
      "汽车视觉",
      "自然环境",
      "生活影调"
    ],
    "cover": "assets/volcano-cover.webp",
    "preview": "assets/volcano-preview.mp4",
    "film": "assets/volcano-film.mp4",
    "stills": [
      "assets/volcano-01.webp",
      "assets/volcano-02.webp",
      "assets/volcano-03.webp",
      "assets/volcano-04.webp"
    ],
    "process": null,
    "sourceFile": "火山汽车/火山车企海外宣传视频_Final_FHD_5Mbps_0817.mp4",
    "chapters": [
      {
        "title": "行驶中的城市",
        "text": "汽车在城市环境中前行，车身反射与建筑、道路形成连贯的明暗和空间关系。",
        "image": "assets/volcano-01.webp",
        "layout": "wide"
      },
      {
        "title": "山景公路",
        "text": "开阔山景与蜿蜒道路延伸至远处，车辆处于自然环境中，明亮天光描绘车身表面。",
        "image": "assets/volcano-02.webp",
        "layout": "wide"
      },
      {
        "title": "海岸道路的光线",
        "text": "暖色光线照亮沿海岩壁，道路沿海岸弯曲延伸。岩石、海面与车身前景构成不同层次的色彩和空间。",
        "image": "assets/volcano-03.webp",
        "layout": "wide"
      },
      {
        "title": "森林中的汽车",
        "text": "树干的竖向线条围绕车辆，日光透过林间形成分层明暗，让产品与自然环境产生联系。",
        "image": "assets/volcano-04.webp",
        "layout": "wide"
      }
    ]
  },
  "force": {
    "year": "2026",
    "role": "AI 美术 / 视觉风格与质感",
    "roleEn": "AI Art / Visual Style & Look Development",
    "contribution": "承接导演转译的创意方向，负责广告画风、美术质感、整体视觉方向与美术视觉。",
    "contributionEn": "Developing the advertising look, visual quality and key art from the director’s creative direction.",
    "tools": [],
    "processNote": "",
    "id": "force",
    "title": "Force 大会 · 周星驰",
    "titleEn": "FORCE Conference · Stephen Chow",
    "englishTitle": "A WORLD OF WONDER",
    "headlineEn": "A WORLD OF WONDER",
    "type": "film",
    "category": "电影感叙事 / 人物与奇想",
    "categoryEn": "Cinematic Narrative / Character & Wonder",
    "duration": "02:08",
    "durationSeconds": 127.98,
    "tagline": "在熟悉的影像气质中，展开新的奇想。",
    "summary": "人物、室内场景、游戏姿态与天空幻想交织，形成兼具生活质感和童趣的影像段落。",
    "summaryEn": "Characters, interiors, playful poses and sky-bound fantasy combine everyday texture with a sense of childhood wonder.",
    "description": "影片在人与人的日常关系、富有戏剧性的场景和超现实想象之间切换。木质室内、彩色光线、天空与毛绒角色展现不同的视觉质感，并通过人物状态连接情绪。",
    "focus": [
      "人物状态",
      "电影影调",
      "幻想角色"
    ],
    "cover": "assets/force-cover.webp",
    "preview": "assets/force-preview.mp4",
    "film": "assets/force-film.mp4",
    "stills": [
      "assets/force-01.webp",
      "assets/force-02.webp",
      "assets/force-03.webp",
      "assets/force-04.webp"
    ],
    "process": null,
    "sourceFile": "Force大会周星驰/FORCE_B COPY_0622_04_4k.mp4",
    "chapters": [
      {
        "title": "室内的人物关系",
        "text": "人物置于木质室内空间，侧向光线、服装与背景细节共同呈现场景的生活质感。",
        "image": "assets/force-01.webp",
        "layout": "wide"
      },
      {
        "title": "游戏般的姿态",
        "text": "两个人物以相近姿态面对镜头，鲜艳道具在暗色背景中成为视觉重点。",
        "image": "assets/force-02.webp",
        "layout": "wide"
      },
      {
        "title": "天空中的想象",
        "text": "人物悬浮于蓝色天空与云层之间，身体姿态和大面积留白带来轻盈的空间感。",
        "image": "assets/force-03.webp",
        "layout": "wide"
      },
      {
        "title": "毛绒角色的近景",
        "text": "毛发、眼睛与柔和明暗塑造角色表情，近距离观看强调细腻表面与情绪。",
        "image": "assets/force-04.webp",
        "layout": "wide"
      }
    ]
  },
  "doubao": {
    "year": "2026",
    "role": "AI 美术 / 视觉风格与质感",
    "roleEn": "AI Art / Visual Style & Look Development",
    "contribution": "承接导演转译的创意方向，负责广告画风、美术质感、整体视觉方向与美术视觉。",
    "contributionEn": "Developing the advertising look, visual quality and key art from the director’s creative direction.",
    "tools": [],
    "processNote": "",
    "id": "doubao",
    "title": "豆包语音",
    "titleEn": "Doubao Voice",
    "englishTitle": "SCENES / EXPRESSION",
    "headlineEn": "SCENES / EXPRESSION",
    "type": "film",
    "category": "古装叙事 / 动漫运动",
    "categoryEn": "Period Narrative / Animated Sports",
    "duration": "01:50",
    "durationSeconds": 110.46,
    "tagline": "在不同世界里，让人物与情绪清晰可见。",
    "summary": "古装客栈与动漫排球两种视觉方向并置，展现人物表情、空间光影与运动张力。",
    "summaryEn": "A period inn and an animated volleyball world present contrasting approaches to character expression, spatial light and movement.",
    "description": "古装段落以木质空间、烛光和人物状态构成电影感氛围；排球段落以明亮赛场、鲜艳队服和夸张动作呈现运动节奏。两种画风共同展示不同场景中的人物与情绪表达。",
    "focus": [
      "人物与表情",
      "空间光影",
      "风格化运动"
    ],
    "cover": "assets/doubao-cover.webp",
    "preview": "assets/doubao-preview.mp4",
    "film": "assets/doubao-film.mp4",
    "stills": [
      "assets/doubao-01.webp",
      "assets/doubao-02.webp",
      "assets/doubao-03.webp",
      "assets/doubao-04.webp"
    ],
    "process": null,
    "sourceFile": "豆包语音/豆包语音FINAL_完整版_4k.mp4",
    "chapters": [
      {
        "title": "烛光中的人物",
        "text": "人物位于木桌与烛光之间，暖色局部光与较暗背景形成层次，衣物纹理和表情保留清晰细节。",
        "image": "assets/doubao-01.webp",
        "layout": "wide"
      },
      {
        "title": "客栈的俯视空间",
        "text": "高处机位展开客栈的楼梯、栏杆与桌椅关系，入口光线在地面形成明确方向。",
        "image": "assets/doubao-02.webp",
        "layout": "wide"
      },
      {
        "title": "赛场中的运动张力",
        "text": "人物向排球伸展身体，地板、队服和球体形成鲜明色彩关系，透视强化动作幅度。",
        "image": "assets/doubao-03.webp",
        "layout": "wide"
      },
      {
        "title": "表情与竞技情绪",
        "text": "近景聚焦人物紧张的面部状态，发丝、皮肤明暗与赛场灯光共同强化情绪。",
        "image": "assets/doubao-04.webp",
        "layout": "wide"
      }
    ]
  }
};

export const cgProjects = cgStudies;

export const portfolio = { person, projects: orderProjects(Object.values(projectCatalog)), cgProjects };
