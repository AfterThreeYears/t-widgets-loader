/**
 * 1. 根据变量project=cms 读取tangram/client/projects/cms/widgets下的文件夹
 * 2. 根据每个目录生成模板
 * 3. 写入index.js 和 config.js
 */
const assert = require('assert');
const { promisifyAll } = require('bluebird');
const fs = require('fs');
const find = require('find-folder');

const header = "import { appendConfig } from '@/utils/widget';";
const annotation = '/* 本文件由脚本生成请不要直接修改 */';

promisifyAll(fs);

module.exports = class CodegenWidgetsConfig {
  constructor(options) {
    this.projectName = options.projectName;
    assert(this.projectName, '请输入projectName');
    assert(options.absolutePath, '请输入absolutePath');
    this.configStr = `import config from '@/projects/${this.projectName}/widgets/config';`;
    this.footer = `appendConfig(widget, config);
    export default widget;
    export const project = '${this.projectName}';`;
    this.absolutePath = options.absolutePath;
    this.aliasPath = `@/projects/${this.projectName}/widgets`;
  }

  async main() {
    let indexCode = null;
    let configCode = null;
    try {
      let files = await find(this.absolutePath);
      // 收集所有组件的路径
      files = this.getComponentFolders(files);
      const nodes = this.getComponentPaths(files);

      indexCode = this.codegenIndex(nodes);
      configCode = this.codegenConfig(nodes);
    } catch (error) {
      console.error(`[start错误]: ${this.absolutePath}`, error); // eslint-disable-line
      process.exit(1);
    }
    return { indexCode, configCode };
  }

  getComponentFolders(files) {
    // 删除第一个
    const first = files.shift();
    console.log(`删除第一个组件路径, ${JSON.stringify(first)}`); // eslint-disable-line
    const { filenames, dirs } = files.reduce(({ dirs, filenames }, { path, type }) => { // eslint-disable-line
      if (type === 'dir') dirs = [...dirs, path];
      if (type === 'file') filenames = [...filenames, path];
      return {
        dirs,
        filenames,
      };
    }, { dirs: [], filenames: [] });
    const filteredDirs = dirs.filter((dir) => {
      const indexPath = `${dir}/index.js`;
      const configPath = `${dir}/config.js`;
      if (
        filenames.includes(indexPath) && filenames.includes(configPath)
      ) return dir;
      return false;
    });
    return filteredDirs;
  }

  getComponentPaths(files) {
    return files.map((file) => {
      const row = file.replace(this.absolutePath, '');
      return {
        identifier: row.split('/').join(''),
        literal: `${this.aliasPath}${row}`,
      };
    });
  }

  generateImportExpression(nodes) {
    return nodes.map(({ identifier, literal }) => `import ${identifier} from '${literal}';`).join('\n');
  }

  generateArrayExpression(identifier) {
    return `const widget = [
      ${identifier.join(',\n  ')}
    ];`;
  }

  generateExportExpression(identifier) {
    return `export default [
      ${identifier.join(',\n  ')}
    ];`;
  }

  codegenIndex(nodes) {
    const importExpression = this.generateImportExpression(nodes);
    const arrayExpression = this.generateArrayExpression(nodes.map(node => node.identifier));
    const codeStr = `${annotation}
      ${header}
      ${importExpression}
      ${this.configStr}
      ${arrayExpression}
      ${this.footer}
    `;
    return codeStr;
  }

  codegenConfig(nodes) {
    const exportExpression = this.generateExportExpression(nodes.map(node => node.identifier));
    const importExpression = this.generateImportExpression(
      nodes.map(node => ({ ...node, literal: `${node.literal}/config` })),
    );

    const codeStr = `${annotation}
      ${importExpression}
      ${exportExpression}
    `;
    return codeStr;
  }
};
