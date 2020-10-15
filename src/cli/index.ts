import {red} from 'chalk';
import {Command} from 'commander';
import {Lib as ClientScriptsModule} from '../lib/index';
import {BuildCommand} from './commands/build.command';
import {DeployCommand} from './commands/deploy.command';

export class Cli {
  private clientScriptsModule: ClientScriptsModule;
  buildCommand: BuildCommand;
  deployCommand: DeployCommand;

  commander = ['sheetbase-client-scripts', 'Scripts for Sheetbase client.'];

  buildCommandDef: CommandDef = ['build', 'Command description.'];

  deployCommandDef: CommandDef = [
    'deploy',
    'Command description.',
    ['-d, --dry-run', 'Staging only.'],
  ];

  constructor() {
    this.clientScriptsModule = new ClientScriptsModule();
    this.buildCommand = new BuildCommand(
      this.clientScriptsModule.optionService,
      this.clientScriptsModule.messageService
    );
    this.deployCommand = new DeployCommand(
      this.clientScriptsModule.optionService,
      this.clientScriptsModule.messageService,
      this.clientScriptsModule.fileService,
      this.clientScriptsModule.rollupService
    );
  }

  getApp() {
    const commander = new Command();

    // general
    const [command, description] = this.commander;
    commander
      .version(require('../../package.json').version, '-v, --version')
      .name(`${command}`)
      .usage('[options] [command]')
      .description(description);

    // build
    (() => {
      const [command, description] = this.buildCommandDef;
      commander
        .command(command)
        .description(description)
        .action(() => this.buildCommand.run());
    })();

    // deploy
    (() => {
      const [command, description, dryRunOpt] = this.deployCommandDef;
      commander
        .command(command)
        .description(description)
        .option(...dryRunOpt) // -d, --dry-run
        .action(({dryRun}) => this.deployCommand.run(dryRun));
    })();

    // help
    commander
      .command('help')
      .description('Display help.')
      .action(() => commander.outputHelp());

    // *
    commander
      .command('*')
      .description('Any other command is not supported.')
      .action(cmd => console.error(red(`Unknown command '${cmd.args[0]}'`)));

    return commander;
  }
}

type CommandDef = [string, string, ...Array<[string, string]>];
