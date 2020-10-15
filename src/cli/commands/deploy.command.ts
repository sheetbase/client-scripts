import {execSync} from 'child_process';
import {resolve} from 'path';
import {minify} from 'uglify-js';

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
      // this.publish(options.deployDir);
      console.log('puslish ...');
      // remove /.deploy
      // await this.cleanup(options.deployDir);
      console.log('cleanup ...');
      // done
      return this.messageService.logOk('Package published.');
    } else {
      return this.messageService.logOk('Publishing content saved.');
    }
  }

  private async staging(options: Options) {
    const {deployDir, commonjsConfig, bundles} = options;
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
      // TODO: minification
    }
  }

  private publish(deployDir: string) {
    return execSync('npm publish', {stdio: 'inherit', cwd: deployDir});
  }

  private cleanup(deployDir: string) {
    return this.fileService.remove(deployDir);
  }
}
