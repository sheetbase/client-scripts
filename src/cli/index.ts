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

  deployCommandDef: CommandDef = ['deploy', 'Command description.'];

  constructor() {
    this.clientScriptsModule = new ClientScriptsModule();
    this.buildCommand = new BuildCommand();
    this.deployCommand = new DeployCommand();
  }

  getApp() {
    const commander = new Command();

    // general
    const [command, description] = this.commander;
    commander
      // eslint-disable-next-line @typescript-eslint/no-var-requires
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
      const [command, description] = this.deployCommandDef;
      commander
        .command(command)
        .description(description)
        .action(() => this.deployCommand.run());
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
