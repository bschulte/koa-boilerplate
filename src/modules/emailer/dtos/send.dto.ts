export class SendDto {
  public to: string[];
  public cc?: string[];
  public bcc?: string[];
  public from: string;
  public subject: string;
  public snippet: string;
  public params: any;
}
