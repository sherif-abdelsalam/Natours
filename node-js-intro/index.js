const fsPromises = require("fs").promises;
const path = require("path");

/**
 * @function fileOps
 * @description performs file operations asynchronously
 * @async
 * @throws {Error} if any of the operations fail
 */
const fileOps = async () => {
  try {
    // Read the file
    const data = await fsPromises.readFile(
      path.join(__dirname, "files", "starter.txt"),
      "utf-8"
    );

    console.log(data);

    await fsPromises.unlink(path.join(__dirname, "files", "starter.txt"));

    // Write the file
    await fsPromises.writeFile(
      path.join(__dirname, "files", "reply.txt"),
      data
    );

    // Append to the file
    await fsPromises.appendFile(
      path.join(__dirname, "files", "reply.txt"),
      "\n\nYes it is."
    );

    // Rename the file
    await fsPromises.rename(
      path.join(__dirname, "files", "reply.txt"),
      path.join(__dirname, "files", "newReply.txt")
    );

    // Read the new file
    const newData = await fsPromises.readFile(
      path.join(__dirname, "files", "newReply.txt"),
      "utf-8"
    );

    console.log(newData);
  } catch (err) {
    console.error(err);
  }
};

fileOps();

// console.log("Hello...");

// fs.writeFile(
//   path.join(__dirname, "files", "reply.txt"),
//   "Nice to meet you",
//   (err) => {
//     if (err) throw err;

//     console.log("Write completed");

//     fs.appendFile(
//       path.join(__dirname, "files", "reply.txt"),
//       "\n\nYes it is.",
//       (err) => {
//         if (err) throw err;
//         console.log("Append completed");
//       }
//     );
//   }
// );
process.on("uncaughtException", (err) => {
  console.error("There was an uncaught exception", err);
  process.exit(1);
});
