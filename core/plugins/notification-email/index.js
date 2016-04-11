import nodemailer from 'nodemailer';

export default function setup(options, imports) {

  const logger = imports.logger;
  const transporter = nodemailer.createTransport(options.transport);

  return function send(to, message) {
    const mailOptions = {
      to: to,
      from: options.from,
      subject: options.subject || 'DevExp notification',
      text: message
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          logger.error(error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };

}
