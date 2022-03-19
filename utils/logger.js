import winston from 'winston';
import { createLogger, format, transports } from "winston";
import 'dotenv/config'

const customFormat = format.combine(
  format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
  format.align(),
  format.printf(
    (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
  )
);


export var  logger = createLogger({
    transports: [
        new transports.File({
        filename: 'logs/index.log',
        level: "info",
        maxSize: "20m",
        maxFiles: "14d",
        format: customFormat
        }),
    ],
});;

if (process.env.NODE_ENV === 'development') {
    logger.add(new transports.Console({ format: winston.format.cli() }));
}

export const detaillog = createLogger({
  transports: [
    new transports.File({
      filename: "logs/detail.log",
      level: "info",
      maxSize: "20m",
      maxFiles: "14d",
      format: customFormat
    }),
  ],
})


// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new transports.Console({ format: winston.format.cli() }));

//   // Turn these on to create logs as if it were production
//   // logger.add(new transports.File({ filename: 'log/output/error.log', level: 'error' }));
//   // logger.add(new transports.File({ filename: 'log/output/warn.log', level: 'warn' }));
//   // logger.add(new transports.File({ filename: 'log/output/info.log', level: 'info' }));
// } else {
//   logger.add(new transports.File({ filename: 'log/output/error.log', level: 'error' }));
//   logger.add(new transports.File({ filename: 'log/output/warn.log', level: 'warn' }));
//   logger.add(new transports.File({ filename: 'log/output/info.log', level: 'info' }));
// }