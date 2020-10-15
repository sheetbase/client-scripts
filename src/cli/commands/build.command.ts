import {execSync} from 'child_process';
import {outputJson, remove} from 'fs-extra';

import {OptionService} from '../../lib/services/option.service';
import {MessageService} from '../../lib/services/message.service';

export class BuildCommand {
  constructor(
    private optionService: OptionService,
    private messageService: MessageService
  ) {}

  async run() {
    const {tsconfigPath} = this.optionService.getOptions();
    await this.compileCode(tsconfigPath);
    return this.messageService.logOk(
      'Build completed, you may now publish the package.'
    );
  }

  private async compileCode(tsconfigPath: string) {
    // save temp tsconfig
    await outputJson(tsconfigPath, {
      extends: './node_modules/gts/tsconfig-google.json',
      compilerOptions: {
        moduleResolution: 'Node',
        module: 'ESNext',
        rootDir: '.',
        skipLibCheck: true,
        lib: ['ESNext', 'DOM'],
      },
      include: ['src/**/*.ts'],
    });
    // compile
    execSync('npx tsc -p ' + tsconfigPath, {stdio: 'ignore'});
    // remove temp tsconfig
    await remove(tsconfigPath);
  }
}
