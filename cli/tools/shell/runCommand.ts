import { exec } from "child_process";
import shell from "shelljs";

shell.config.execPath = String(shell.which("node"));
const projectPath = process.cwd();

function execSync(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(stdout || stderr);
    });
  });
}

async function runCommand(
  script: string,
  settings: { keepWindow?: boolean; root?: string; silent?: boolean } = {}
): Promise<any> {
  let path = projectPath;

  if (settings.root) {
    path = settings.root;
  }

  let cmd = `cd ${path} && ${script}`;

  const processFileIndex = Math.floor(Math.random() * 100);
  const processFileName = `/tmp/sherlo/tty_id_${processFileIndex}`;

  if (!settings.silent) {
    try {
      await execSync(`rm -f ${processFileName}`);
    } catch {
      //
    }

    try {
      await execSync("mkdir /tmp/sherlo");
    } catch {
      //
    }

    shell.exec(`osascript -e 'tell application "Terminal" to activate'`);
    shell.exec(
      `osascript -e 'tell application "Terminal" to do script "tty > ${processFileName} && while test -f \\"${processFileName}\\"; do sleep 10; done"'`
    );

    let retries = 10;
    let ttyId;
    while (!ttyId && retries > 0) {
      try {
        // eslint-disable-next-line no-await-in-loop
        ttyId = await execSync(`sleep 1 && cat ${processFileName}`);
      } catch (err) {
        if (retries <= 0) {
          break;
        }
      }

      retries -= 1;
    }

    cmd += `>${ttyId}`;
  }

  const execPromise = execSync(cmd);

  return settings.silent
    ? execPromise
    : execPromise.then(() => execSync(`rm -f ${processFileName}`));
}

export default runCommand;
