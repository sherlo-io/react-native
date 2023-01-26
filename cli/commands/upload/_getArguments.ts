const getArguments = (): {
  debug: boolean;
  dryRun: boolean;
  help: boolean;
  showDevices: boolean;
  concurrency?: number;
  configPath?: string;
} => {
  const processArgs = process.argv.slice(2);

  const concurrencyArg = processArgs.filter((arg) =>
    arg.includes("--concurrency")
  )[0];

  let concurrency;
  if (concurrencyArg) {
    const concurrencyArgParts = concurrencyArg.split("=");
    concurrency = parseInt(concurrencyArgParts[1], 10);
  }

  const configArg = processArgs.filter((arg) => arg.includes("--config"))[0];
  let configPath;
  if (configArg) {
    const configArgParts = configArg.split("=");
    // eslint-disable-next-line prefer-destructuring
    configPath = configArgParts[1];
  }

  return {
    debug: processArgs.includes("--debug"),
    dryRun: processArgs.includes("--dry-run"),
    showDevices: processArgs.includes("--show-devices"),
    concurrency,
    configPath,
    help: processArgs.includes("--help"),
  };
};

export default getArguments;
