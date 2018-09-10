const { getOptions } = require('loader-utils');
const CodegenWidgetsConfig = require('./CodegenWidgetsConfig');

module.exports = async function tangramWidgetsLoader(source) {
  const {
    placeholderCode,
    type,
    absolutePath,
    projectName,
  } = getOptions(this) || {};
  const equalPlaceHolderCode = source.trim() === placeholderCode.trim();
  const isConifg = type === 'config' && equalPlaceHolderCode;
  const isIndex = type === 'index' && equalPlaceHolderCode;
  // 不是目标文件直接返回
  if (!isIndex && !isConifg) return source;

  const codegenWidgetsConfig = new CodegenWidgetsConfig({ absolutePath, projectName });
  const { indexCode, configCode } = await codegenWidgetsConfig.main();
  if (isIndex) return indexCode;
  if (isConifg) return configCode;
  const error = `console.error('[tangramWidgetsLoader error] type is ${type}, placeholderCode is ${placeholderCode}')`;
  console.error(error); // eslint-disable-line
  return error;
};
