const logEvent = require("./logEvent");
const EventEmitter = require("events");

class MyEmitter extends EventEmitter { };
const myEmitter = new MyEmitter();

myEmitter.on("log", (eventMessage) => logEvent(eventMessage));

myEmitter.emit("log", "Event emitted");
