// Personal content. Counts reflect 11 films and 1 art-study project, plus 6 CG series.
import { cgStudies } from './cg-studies-data.js?v=20261030-smooth1';
import { artCollections } from './art-collections-data.js?v=20261030-smooth1';

const acerStudy = cgStudies.find(study => study.id === 'acer');
const acerCover = acerStudy?.cover || 'assets/cg-studies-20261020/acer-cover.webp';

export const knowledge = {
  "eyebrow": {
    "zh": "VISUAL LANGUAGE",
    "en": "VISUAL LANGUAGE"
  },
  "title": {
    "zh": "美术语言 — 从一个设定到一个世界",
    "en": "Visual language — from a study to a world"
  },
  "lead": {
    "zh": "角色、场景、画风、光影、材质与运动，构成我观察画面的六个角度。通过商业项目与三维作品，探索画面如何成立，以及不同镜头如何共享同一种视觉气质。",
    "en": "Character, environment, style, light, material and motion are six ways I read an image. My commercial and CG work explores how images hold together and how different shots share a visual identity."
  },
  "chips": [
    {
      "zh": "角色与表情",
      "en": "Character"
    },
    {
      "zh": "场景与空间",
      "en": "Environment"
    },
    {
      "zh": "画风与转换",
      "en": "Style"
    },
    {
      "zh": "光影与色彩",
      "en": "Light & colour"
    },
    {
      "zh": "产品与材质",
      "en": "Material"
    },
    {
      "zh": "镜头与运动",
      "en": "Motion"
    }
  ],
  "stats": [
    {
      "value": "12",
      "zh": "商业与美术项目",
      "en": "Commercial & art projects"
    },
    {
      "value": "06",
      "zh": "CG 作品系列",
      "en": "CG studies"
    },
    {
      "value": "03",
      "zh": "角色 · 场景 · 版本",
      "en": "Character · space · iteration"
    },
    {
      "value": "Art",
      "zh": "画风 · 光影 · 质感",
      "en": "Style · light · material"
    }
  ]
};

export const team = {
  "eyebrow": {
    "zh": "MY PRACTICE",
    "en": "MY PRACTICE"
  },
  "title": {
    "zh": "从画风，到每一处细节",
    "en": "From visual style to the smallest detail"
  },
  "lead": {
    "zh": "AI ART / LOOK DEVELOPMENT / CHARACTER / SPACE / CGI / MOTION",
    "en": "AI ART / LOOK DEVELOPMENT / CHARACTER / SPACE / CGI / MOTION"
  },
  "group": "assets/seedance-city-surreal.webp",
  "people": [
    {
      "photo": "assets/lixiang-02.webp",
      "name": "画风探索",
      "nameEn": "Visual Style",
      "role": "写实与风格化",
      "roleEn": "Realism & stylization",
      "bio": "围绕导演创意，处理色彩、轮廓与材质，探索适合项目的视觉表达。",
      "bioEn": "Exploring color, shape and surfaces to develop a visual language from the director’s creative direction."
    },
    {
      "photo": "assets/art-study/character-01.webp",
      "name": "角色设定",
      "nameEn": "Character",
      "role": "人物多角度设定",
      "roleEn": "Multi-view character studies",
      "bio": "通过 CapCut 项目的人物多角度设定，统一服装、体态与面部细节。",
      "bioEn": "Defining clothing, posture and facial detail through multi-view character studies for CapCut."
    },
    {
      "photo": "assets/seedance-scene-01.webp",
      "name": "场景构建",
      "nameEn": "Environment",
      "role": "空间与氛围",
      "roleEn": "Space & atmosphere",
      "bio": "组织场景结构、生活细节与机位关系，让不同取景拥有共同的空间逻辑。",
      "bioEn": "Organizing structure, lived-in details and camera views into a coherent sense of space."
    },
    {
      "photo": "assets/capcut-01.webp",
      "name": "光影质感",
      "nameEn": "Light & Look",
      "role": "影调与材质",
      "roleEn": "Tone & surfaces",
      "bio": "关注自然光、肤色与环境表面的关系，让明暗和反射共同塑造画面。",
      "bioEn": "Working with natural light, skin tones and environmental surfaces to shape images through value and reflection."
    },
    {
      "photo": "assets/cg2-porsche-cover.webp",
      "name": "三维视觉",
      "nameEn": "CG Imagery",
      "role": "产品与空间",
      "roleEn": "Product & space",
      "bio": "以建模、场景搭建与灯光渲染为基础，观察产品形体和材料细节。",
      "bioEn": "Using modeling, scene construction and lighting to explore product forms and material details."
    },
    {
      "photo": acerCover,
      "name": "动态表达",
      "nameEn": "Motion",
      "role": "镜头与节奏",
      "roleEn": "Camera & rhythm",
      "bio": "通过 Acer 的 Demo、白模对比与成片，呈现产品镜头、动态节奏和材质变化。",
      "bioEn": "Exploring product framing, visual rhythm and materials through Acer’s demo, blocking comparison and finished film."
    }
  ]
};

export const about = {
  "eyebrow": {
    "zh": "ABOUT MINGZE",
    "en": "ABOUT MINGZE"
  },
  "title": {
    "zh": "关于李明泽",
    "en": "About Mingze Li"
  },
  "card": "assets/mingze-studio-portrait.jpg",
  "photoAlt": {
    "zh": "李明泽在工作室中的个人照片，周围是摄影灯光与拍摄设备",
    "en": "Mingze Li in a studio with lighting and camera equipment"
  },
  "photoCaption": {
    "zh": "MINGZE LI · 工作室日常",
    "en": "MINGZE LI · IN THE STUDIO"
  },
  "name": {
    "zh": "李明泽",
    "en": "MINGZE LI"
  },
  "role": {
    "zh": "AI 广告美术 / 视觉开发 / CG 与动态设计",
    "en": "AI Art for Advertising / Visual Development / CG & Motion"
  },
  "bio": [
    {
      "zh": "专注 AI 广告美术与视觉开发，将导演创意转化为画风、光影、材质与关键视觉。围绕角色、场景和道具展开设定，控制不同视角与连续镜头的视觉一致性。",
      "en": "I translate a director’s ideas into visual style, lighting, materials and key art. My work spans character, environment and prop design, with a focus on consistency across viewpoints and shots."
    },
    {
      "zh": "熟练运用 AI 生图与视频工作流，整理可复用的美术资产，结合三维、Photoshop 与 After Effects 完成画面精修与后期处理。",
      "en": "I work confidently with AI image and video workflows, organize reusable art assets, and use 3D, Photoshop and After Effects for refinement and finishing."
    },
    {
      "zh": "通过模型与生成版本对比，识别造型、空间、质感和一致性问题，将美术判断转化为具体的改进方向，推动画面迭代。",
      "en": "By comparing models and generated versions, I identify issues in form, space, surface quality and consistency, turning visual judgments into specific directions for improvement."
    }
  ],
  "background": {
    "zh": "目前在三不五时从事 AI 广告美术与视觉设计，曾于 CCLAB 担任三维动态设计师助理实习生。本科毕业于西安外国语大学视觉传达设计专业。",
    "en": "Currently working in AI advertising art and visual design at SOMEWHILE, following an internship as a 3D motion design assistant at CCLAB. BA in Visual Communication Design, Xi’an International Studies University."
  },
  "capabilities": [
    {
      "title": { "zh": "视觉开发", "en": "Look Development" },
      "zh": "画风 · 光影 · 材质 · 关键视觉",
      "en": "Style, lighting, materials & key art"
    },
    {
      "title": { "zh": "设定与一致性", "en": "Design & Continuity" },
      "zh": "角色 · 场景 · 道具 · 连续镜头",
      "en": "Characters, environments, props & shots"
    },
    {
      "title": { "zh": "工作流与评估", "en": "Workflow & Evaluation" },
      "zh": "资产复用 · 生成对比 · 迭代反馈",
      "en": "Reusable assets, comparisons & feedback"
    },
    {
      "title": { "zh": "CG 与后期", "en": "CG & Finishing" },
      "zh": "三维辅助 · 图像精修 · 动态表达",
      "en": "3D, image refinement & motion"
    }
  ],
  "socials": [
    "1158609347@qq.com",
    "微信 / WeChat：lmz-Apr18",
    "Cinema 4D · Octane · After Effects · Photoshop"
  ]
};

export const product = {
  "badge": {
    "zh": "CG & MOTION · ACER",
    "en": "CG & MOTION · ACER"
  },
  "title": "CG / MOTION",
  "headline": {
    "zh": acerStudy?.title || "Acer · 3C 数码广告",
    "en": acerStudy?.titleEn || "Acer · Digital Product Film"
  },
  "body": {
    "zh": acerStudy?.summary || "从 Demo、白模对比到最终成片，观察镜头运动、产品结构与灯光材质的变化。",
    "en": acerStudy?.summaryEn || "Explore the demo, blocking comparison and finished film — from camera movement to light and materials."
  },
  "flow": [
    {
      "zh": "Demo",
      "en": "Demo"
    },
    {
      "zh": "白模对比",
      "en": "Blocking comparison"
    },
    {
      "zh": "灯光与材质",
      "en": "Light & material"
    },
    {
      "zh": "最终成片",
      "en": "Final film"
    }
  ],
  "actions": [
    {
      "zh": "观看完整成片",
      "en": "WATCH THE FILM",
      "href": acerStudy?.media?.film?.src || "#idtalk",
      "primary": true
    },
    {
      "zh": "观看白模对比",
      "en": "VIEW COMPARISON",
      "href": acerStudy?.media?.comparison?.src || "#idtalk"
    }
  ],
  "note": {
    "zh": "Acer / 3C 数码广告 · Demo、白模对比与成片。",
    "en": "Acer / Digital product film · Demo, blocking comparison and final film."
  },
  "poster": acerCover
};

export const tools = {
  "eyebrow": {
    "zh": "CRAFT & WORKFLOW",
    "en": "CRAFT & WORKFLOW"
  },
  "title": {
    "zh": "工具服务于画面",
    "en": "Tools in service of the image"
  },
  "lead": {
    "zh": "从理解导演创意到形成美术视觉，围绕画风、角色、场景和质感逐步展开。三维、渲染、动态与图像处理，组成我的视觉制作基础。",
    "en": "From understanding a director’s idea to developing key art, the work moves through style, characters, environments and surfaces. 3D, rendering, motion and image processing form my production foundation."
  },
  "pipeline": [
    {
      "step": "01",
      "name": "DIRECTION",
      "zh": "理解创意",
      "en": "Direction",
      "desc": {
        "zh": "承接导演转译的创意，明确画面的视觉重点",
        "en": "Read the director’s creative direction and define visual priorities"
      }
    },
    {
      "step": "02",
      "name": "EXPLORATION",
      "zh": "画风探索",
      "en": "Exploration",
      "desc": {
        "zh": "通过色彩、构图、光线与材质形成视觉方向",
        "en": "Explore color, composition, light and material"
      }
    },
    {
      "step": "03",
      "name": "DEVELOPMENT",
      "zh": "美术展开",
      "en": "Development",
      "desc": {
        "zh": "将方向展开为人物、场景与关键画面",
        "en": "Develop characters, environments and key images"
      }
    },
    {
      "step": "04",
      "name": "REFINEMENT",
      "zh": "画面推敲",
      "en": "Refinement",
      "desc": {
        "zh": "比较版本，调整比例、取景和环境细节",
        "en": "Compare versions and refine proportion, framing and detail"
      }
    },
    {
      "step": "05",
      "name": "DELIVERY",
      "zh": "视觉交付",
      "en": "Delivery",
      "desc": {
        "zh": "交付整体视觉风格方向与美术视觉",
        "en": "Deliver overall visual direction and key art"
      }
    }
  ],
  "metrics": [
    {
      "value": "Style",
      "zh": "广告画风",
      "en": "Advertising look"
    },
    {
      "value": "Light",
      "zh": "光影与氛围",
      "en": "Light and atmosphere"
    },
    {
      "value": "Surface",
      "zh": "材质与细节",
      "en": "Materials and detail"
    },
    {
      "value": "Motion",
      "zh": "镜头与节奏",
      "en": "Camera and rhythm"
    }
  ],
  "groups": [
    {
      "zh": "AI ART · 美术视觉",
      "en": "AI ART · VISUAL DEVELOPMENT",
      "lead": {
        "zh": "以角色、空间与版本推敲，展开整体美术方向",
        "en": "Developing an art direction through character, environment and iteration"
      },
      "items": [
        {
          "name": "CHARACTER",
          "collectionId": "art-character",
          "zh": "角色设定",
          "en": "Character studies",
          "desc": {
            "zh": "浏览 CapCut 的人物设定，观察外观、服装与人物气质",
            "en": "Explore character, clothing and presence in CapCut studies"
          },
          "shot": artCollections.find(item => item.id === 'art-character').cover
        },
        {
          "name": "ENVIRONMENT",
          "collectionId": "art-environment",
          "zh": "场景设定",
          "en": "Environment studies",
          "desc": {
            "zh": "浏览 CapCut 的场景设定，观察空间、光线与生活细节",
            "en": "Explore space, light and lived-in detail in CapCut environments"
          },
          "shot": artCollections.find(item => item.id === 'art-environment').cover
        },
        {
          "name": "ITERATION",
          "collectionId": "art-iteration",
          "zh": "版本比较",
          "en": "Visual iteration",
          "desc": {
            "zh": "拖动分割线，对照同一场景或人物的两种视觉方案",
            "en": "Drag to compare two visual approaches to a scene or character"
          },
          "shot": artCollections.find(item => item.id === 'art-iteration')?.cover || 'assets/seedance-iteration-02.webp'
        }
      ]
    },
    {
      "zh": "CG · 三维与渲染",
      "en": "CG · 3D & RENDERING",
      "lead": {
        "zh": "通过形体、空间、材质与反射塑造视觉质感",
        "en": "Shaping a visual through form, space, material and reflection"
      },
      "items": [
        {
          "name": "Cinema 4D",
          "zh": "三维与场景",
          "en": "3D and scene construction",
          "desc": {
            "zh": "模型构建、场景搭建与动态制作",
            "en": "Modeling, scene construction and motion"
          },
          "shot": "assets/cg2-porsche-04.webp"
        },
        {
          "name": "Octane",
          "zh": "灯光与渲染",
          "en": "Lighting and rendering",
          "desc": {
            "zh": "通过材质、灯光与反射，观察产品表面的层次",
            "en": "Using surfaces, light and reflections to describe product detail"
          },
          "shot": "assets/cg2-materials-01.webp"
        }
      ]
    },
    {
      "zh": "POST · 动态与图像",
      "en": "POST · MOTION & IMAGE",
      "lead": {
        "zh": "连接动态制作、局部精修与参考调色",
        "en": "Connecting motion, local retouching and reference-based colour"
      },
      "items": [
        {
          "name": "After Effects",
          "zh": "动态与后期",
          "en": "Motion and post-production",
          "desc": {
            "zh": "产品动态、镜头节奏与后期整理",
            "en": "Product motion, visual rhythm and finishing"
          },
          "shot": acerCover
        },
        {
          "name": "Photoshop × Codex",
          "zh": "Skill 精修与调色",
          "en": "Skill-assisted retouching & colour",
          "desc": {
            "zh": "将美术要求转化为操作步骤，保留可编辑图层与核验记录",
            "en": "Turn art direction into actionable steps, editable layers and review records"
          },
          "workflow": "photoshop"
        }
      ]
    }
  ],
  "principles": [
    {
      "name": "INPUT",
      "zh": "从创意方向出发",
      "en": "Start with the creative direction",
      "desc": {
        "zh": "理解画面需要表达的气质，明确视觉探索的重点",
        "en": "Understand the intended character of the image and its visual priorities"
      }
    },
    {
      "name": "LOOK",
      "zh": "让画面形成共同语言",
      "en": "Build a shared visual language",
      "desc": {
        "zh": "关注角色、场景、光影和材质之间的关系",
        "en": "Connect characters, environments, light and materials"
      }
    },
    {
      "name": "OUTPUT",
      "zh": "把方向变成具体视觉",
      "en": "Turn direction into visual work",
      "desc": {
        "zh": "以设定、关键画面与版本对照呈现美术结果",
        "en": "Present the art through studies, key images and version comparisons"
      }
    }
  ],
  "shots": [
    "assets/seedance-character.webp",
    "assets/seedance-expressions.webp",
    "assets/seedance-scene-01.webp",
    "assets/seedance-scene-02.webp",
    "assets/seedance-iteration-01.webp",
    "assets/seedance-iteration-02.webp",
    "assets/cg2-porsche-cover.webp",
    acerCover
  ]
};

export const clientsDetail = {
  "eyebrow": {
    "zh": "PROJECT EXPERIENCE",
    "en": "PROJECT EXPERIENCE"
  },
  "title": {
    "zh": "商业项目中的美术实践",
    "en": "Art practice in commercial projects"
  },
  "groups": [
    {
      "zh": "AI / 技术发布",
      "en": "AI and technology",
      "names": "Seedance 2.5 · VIVIX 世界模型 · 豆包语音"
    },
    {
      "zh": "产品 / 人物",
      "en": "Product and portrait",
      "names": "OPPO Reno · OPPO × 孙颖莎 · 追觅手机"
    },
    {
      "zh": "汽车影像",
      "en": "Automotive imagery",
      "names": "李想的一天 · 火山汽车"
    },
    {
      "zh": "品牌 / 叙事",
      "en": "Brand and narrative",
      "names": "CapCut World · 字节跳动校招 · Force 大会 · 空军美术"
    }
  ],
  "influence": [
    {
      "value": "12",
      "zh": "11 支成片 · 1 组美术静帧",
      "en": "11 films · 1 art study project"
    },
    {
      "value": "Look",
      "zh": "整体视觉风格方向",
      "en": "Overall visual direction"
    },
    {
      "value": "Art",
      "zh": "角色、场景与美术视觉",
      "en": "Character, environment and key art"
    },
    {
      "value": "CG",
      "zh": "三维与动态设计基础",
      "en": "3D and motion design foundation"
    }
  ]
};

export const contact = {
  "eyebrow": {
    "zh": "LET’S CREATE TOGETHER",
    "en": "LET’S CREATE TOGETHER"
  },
  "title": {
    "zh": "一起，把想象变成下一帧。",
    "en": "Let’s make the next frame."
  },
  "cta": {
    "zh": "联系李明泽 ↗",
    "en": "CONTACT MINGZE ↗"
  },
  "links": [
    "1158609347@qq.com",
    "微信 / WeChat：lmz-Apr18",
    "AI 广告美术 · 视觉设计 · CG 与动态设计"
  ]
};
