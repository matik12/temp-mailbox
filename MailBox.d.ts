declare module 'temp-mailbox' {
  interface MailMessage {
    id: string;
    from: string;
    subject: string;
    preview: string;
    text: string;
    textOnly: string;
    html: string;
    timestamp: Date;
  }

  export default class MailBox {
    address: string;
    messages: MailMessage[];

    constructor(key: string, address?: string, apiUrl?: string);

    getAvailableDomains(): Promise<string[]>;
    getEmailAddress(length?: number): Promise<string>;
    getMessages(address?: string): Promise<MailMessage[]>;
    deleteMessage(messageId: string): Promise<any>;
    deleteAllMessages(): Promise<any>;
  }
}
