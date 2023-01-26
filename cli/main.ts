import spawn from "cross-spawn";

const COMMANDS = ["upload"];
const COMMANDS_DIR = "./commands";

process.on("unhandledRejection", (err) => {
  throw err;
});

const args = process.argv.slice(2);
const scriptIndex = args.findIndex((arg) => COMMANDS.includes(arg));
const command = scriptIndex > 0 ? args[scriptIndex] : args[0];
const spawnArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

if (COMMANDS.includes(command)) {
  const result = spawn.sync(
    process.execPath,
    spawnArgs
      .concat(require.resolve(`${COMMANDS_DIR}/${command}`))
      .concat(args.slice(scriptIndex + 1)),
    { stdio: "inherit" }
  );

  if (result.signal) {
    if (result.signal === "SIGKILL") {
      console.log("The script failed because the process exited too early.");
    } else if (result.signal === "SIGTERM") {
      console.log("The script failed because the process is killed.");
    }
  }

  process.exit(result.status ?? undefined);
} else {
  console.log(`Unknown command "${command}".`);
}
