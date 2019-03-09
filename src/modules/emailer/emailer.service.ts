import * as nodemailer from "nodemailer";
import * as _ from "lodash";
import createError from "http-errors";

import { Logger } from "../../logging/Logger";
import { SendDto } from "./dtos/send.dto";
import { MailOptions } from "nodemailer/lib/smtp-pool";
import { isDevEnv } from "../../common/helpers/util";
import { PASSWORD_RESET_SNIPPET, StatusCode } from "../../common/constants";
import { passwordResetSnippet } from "./templates/password-reset.snippet";
import { generalTemplate } from "./templates/general";

const _logger = new Logger("EmailerService");

export const send = async ({
  subject,
  snippet,
  to,
  cc,
  bcc,
  from,
  params
}: SendDto) => {
  const transporter = await _getTransporter();
  const mailOptions: MailOptions = {
    from,
    to,
    cc,
    bcc,
    subject,
    html: _compileTemplate(snippet, params).html
  };

  const result = await transporter.sendMail(mailOptions);
  _logger.debug(`Sent email: ${JSON.stringify(result.messageId)}`);
  /* istanbul ignore else */
  if (isDevEnv()) {
    _logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(result)}`);
  }

  return true;
};

const _getTransporter = async () => {
  /* istanbul ignore else */
  if (isDevEnv()) {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } else {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
};

const _compileTemplate = (snippet: string, args: any) => {
  const snippetHtml = _compileSnippet(snippet, args);
  return generalTemplate(snippetHtml);
};

const _compileSnippet = (snippet: string, params: any) => {
  switch (snippet) {
    case PASSWORD_RESET_SNIPPET:
      return passwordResetSnippet(params.token);
    default:
      _logger.error("Invalid email snippet provided");
      throw createError(
        StatusCode.SERVER_ERROR,
        "Invalid email snippet provided"
      );
  }
};
