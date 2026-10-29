// Edit this list to change the order of every commercial/art project.
export const PROJECT_ORDER = Object.freeze([
  "seedance",
  "capcut",
  "reno",
  "lixiang",
  "oppo",
  "recruitment",
  "dreame",
  "airforce",
  "vivix",
  "volcano",
  "force",
  "doubao"
]);

export function orderProjects(projects) {
  const rank = new Map(PROJECT_ORDER.map((id, index) => [id, index]));
  return [...projects].sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999));
}
