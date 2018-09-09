const { getOptions } = require('loader-utils');
const CodegenWidgetsConfig = require('./CodegenWidgetsConfig');

let codegenWidgetsConfig = null;

module.exports = async function emmmmmmmm(source) {
  const { placeholderCode, type, absolutePath } = getOptions(this) || {};
  // 不是目标文件直接返回
  if ( type !== 'index' || type !== 'config' ) return source;

  if (!codegenWidgetsConfig) codegenWidgetsConfig = new CodegenWidgetsConfig({ absolutePath });
  const { indexCode, configCode } = await codegenWidgetsConfig.main();
  if ( type === 'index' || placeholderCode.trim() === source.trim() ) return indexCode;
  if ( type === 'config' || placeholderCode.trim() === source.trim() ) return configCode;
  return `console.error('[emmmmmmmm error] type is ${type}, placeholderCode is ${placeholderCode}')`;
};
