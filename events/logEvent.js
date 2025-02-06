const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const uuid = require("uuid");
const { format } = require("date-fns");

const logEvent = async (eventMessage) => {
  const dateTime = `${format(new Date(), "yyyy-MM-dd    HH:mm:ss")}`;
  const logItem = `${dateTime}\t${uuid.v4()}\t${eventMessage}\n`;
  try {
    if (!fs.existsSync(path.join(__dirname, "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "logs", "eventLog.txt"),
      logItem
    );
  } catch (error) {
    console.error("Failed to log event:", error);
  }
};

module.exports = logEvent;
