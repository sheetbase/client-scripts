import {OptionService} from './services/option.service';
import {MessageService} from './services/message.service';
import {RollupService} from './services/rollup.service';
import {FileService} from './services/file.service';

export class Lib {
  optionService: OptionService;
  messageService: MessageService;
  rollupService: RollupService;
  fileService: FileService;

  constructor() {
    this.optionService = new OptionService();
    this.messageService = new MessageService();
    this.rollupService = new RollupService();
    this.fileService = new FileService();
  }
}
