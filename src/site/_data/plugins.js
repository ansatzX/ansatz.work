import loader from "../../helpers/pluginLoader.cjs";
export default () => {
  loader.loadPlugins({ force: true });
  return loader.getTemplateData();
};
