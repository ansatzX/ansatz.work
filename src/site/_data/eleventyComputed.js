import { commentConfig } from "../../helpers/comments.js";
import { computedSeo } from "../../helpers/seo.js";
import { getGraph } from "../../helpers/linkUtils.js";
import { getFileTree } from "../../helpers/filetreeUtils.js";
import { userComputed } from "../../helpers/userUtils.js";

export default {
  seo: computedSeo,
  commentConfig,
  graph: (data) => getGraph(data),
  filetree: (data) => getFileTree(data),
  userComputed: (data) => userComputed(data)
};
