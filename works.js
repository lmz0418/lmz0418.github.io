// Cards and case pages share the same data and order.
import { portfolio } from './personal-data.js';

export const works = [...portfolio.projects, ...portfolio.cgProjects].map(project => ({
  id: project.id,
  cg: portfolio.cgProjects.includes(project),
  title: project.title,
  titleEn: project.titleEn || project.englishTitle || project.title,
  poster: project.cover,
  video: project.film || '',
  preview: project.preview || '',
  url: 'project.html?id=' + encodeURIComponent(project.id),
  kind: project.film ? 'film' : 'project',
  format: project.format || '',
  formatEn: project.formatEn || '',
  role: project.role,
  roleEn: project.roleEn,
  summary: project.summary,
  summaryEn: project.summaryEn,
  stills: project.stills || [],
  category: project.category,
  duration: project.duration || ''
}));
