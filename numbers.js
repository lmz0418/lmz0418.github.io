import { portfolio } from './personal-data.js';

const allProjects = [...portfolio.projects, ...portfolio.cgProjects];
export const numbers = [
  { value: String(allProjects.length), label: 'Selected projects', labelZh: '精选项目' },
  { value: String(allProjects.filter(project => project.film).length), label: 'Complete films', labelZh: '完整成片' },
  { value: String(portfolio.cgProjects.length), label: 'CG & motion projects', labelZh: 'CG 与动态作品系列' },
  { value: String(portfolio.cgProjects.reduce((sum, project) => sum + (project.comparisons?.length || 0), 0)), label: 'Clay / render image pairs', labelZh: '白模／渲染图对比' }
];
