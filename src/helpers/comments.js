// Build-time configuration shared by the embed and sidebar navigation.
export function commentConfig(data, env = process.env) {
  const enabled = /^(true|1)$/i.test(env.GISCUS_ENABLED || "false");
  const value = (key, fallback) => env[`GISCUS_${key}`] || fallback;
  return {
    enabled: enabled && data.comments !== false && data.dgShowComments !== false,
    repo: value("REPO", "ansatzX/ansatz.work"),
    repoId: value("REPO_ID", "R_kgDOOWabPQ"),
    category: value("CATEGORY", "Announcements"),
    categoryId: value("CATEGORY_ID", "DIC_kwDOOWabPc4C5wnH"),
    mapping: value("MAPPING", "pathname"), strict: value("STRICT", "1"),
    reactions: value("REACTIONS_ENABLED", "1"), metadata: value("EMIT_METADATA", "0"),
    position: value("INPUT_POSITION", "top"), theme: value("THEME", "preferred_color_scheme"),
    language: value("LANG", "zh-CN"), loading: value("LOADING", "lazy"),
  };
}
