import chokidar from "chokidar";
import { spawn } from "child_process";
import { __$dirname } from "./utils.mjs";
import { resolve } from "path";

const ___dirname = __$dirname(); // like __dirname variable
const serverPath = resolve(___dirname, "./server.mjs");
const configPath = resolve(___dirname, "./config.mjs");
const mocksPaths = resolve(___dirname, "./mocks");

const debouncedRestart = debounce(startServer, 1000);
let childProcess;
chokidar
  .watch([serverPath, configPath, mocksPaths])
  .on("all", (event, path) => {
    childProcess && childProcess.kill();
    debouncedRestart();
  });

function startServer() {
  childProcess = spawn("node", [serverPath], {
    stdio: [process.stdin, process.stdout, process.stderr],
  });
}

function debounce(fn, wait = 500, thisArg = null) {
  let timer;
  return (...args) => {
    timer && clearTimeout(timer);
    timer = setTimeout(() => fn.apply(thisArg, args), wait);
  };
}
