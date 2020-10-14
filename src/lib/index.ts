import {MessageService} from './services/message.service';

export class Lib {
  messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }
}
