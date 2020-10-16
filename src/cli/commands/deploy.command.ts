import {execSync} from 'child_process';
import {resolve} from 'path';
import {minify} from 'terser';

import {OptionService, Options} from '../../lib/services/option.service';
import {MessageService} from '../../lib/services/message.service';
import {FileService} from '../../lib/services/file.service';
import {RollupService} from '../../lib/services/rollup.service';

export class DeployCommand {
  constructor(
    private optionService: OptionService,
    private messageService: MessageService,
    private fileService: FileService,
    private rollupService: RollupService
  ) {}

  async run(dryRun: boolean) {
    const options = this.optionService.getOptions();
    // staging
    await this.staging(options);
    // publish
    if (!dryRun) {
      // npm publish
      this.publish(options.deployDir);
      // remove /.deploy
      await this.cleanup(options.deployDir);
    } else {
      return this.messageService.logOk('Publishing content saved.');
    }
  }

  private async staging(options: Options) {
    const {deployDir, commonjsConfig, bundles} = options;
    const {version: moduleVersion} = (await this.fileService.readJson(
      'package.json'
    )) as {version: string};
    // copy package.json & src
    await this.fileService.copy(['package.json'], deployDir);
    await this.fileService.copy(['src'], deployDir + '/src');
    // bundling & minification
    for (let i = 0; i < bundles.length; i++) {
      // bundling
      const {input, file, name} = bundles[i];
      const outputPath = resolve(deployDir, file);
      await this.rollupService.bundleCode(
        input,
        [
          {
            file: outputPath,
            format: 'umd',
            sourcemap: true,
            name: name,
          },
        ],
        {
          commonjs: commonjsConfig,
        }
      );
      // minify
      const outputContent = await this.fileService.readFile(outputPath);
      const minifyCodePath = outputPath.replace('.js', '.min.js');
      const minifyCodeFileName = minifyCodePath
        .replace(/\\/g, '/')
        .split('/')
        .pop() as string;
      const minifyMapPath = outputPath.replace('.js', '.min.js.map');
      const minifyMapFileName = minifyMapPath
        .replace(/\\/g, '/')
        .split('/')
        .pop() as string;
      const {code: minifyCode, map: minifyMap} = await minify(outputContent, {
        sourceMap: {
          filename: minifyCodeFileName,
          url: minifyMapFileName,
        },
      });
      if (minifyCode && minifyMap) {
        await this.fileService.outputFile(minifyCodePath, minifyCode);
        await this.fileService.outputFile(minifyMapPath, minifyMap.toString());
      }
      // save component packages
      if (file === 'sheetbase-app.js' || name.indexOf('.') !== -1) {
        let [, componentName] = name.split('.');
        if (!componentName) {
          componentName = 'app';
        }
        const componentSrcName =
          componentName === 'app' ? 'lib' : componentName;
        const packagePath = resolve(deployDir, componentName, 'package.json');
        await this.fileService.outputFile(
          packagePath,
          [
            '{',
            `  "name": "@sheetbase/client-${componentName}",`,
            `  "version": "${moduleVersion}",`,
            `  "main": "../src/${componentSrcName}/exports.js",`,
            `  "types": "../src/${componentSrcName}/exports.d.ts",`,
            '}',
            '',
          ].join('\n')
        );
      }
    }
  }

  private publish(deployDir: string) {
    return execSync('npm publish', {stdio: 'inherit', cwd: deployDir});
  }

  private cleanup(deployDir: string) {
    return this.fileService.remove(deployDir);
  }
}
