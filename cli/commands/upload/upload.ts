import path from "path";
import SDKApiClient from "@sherlo/api-client/dist/client/SDKApiClient";
import shell from "shelljs";
import { printHeader } from "../../tools/cli";
import { getConfig } from "../../tools/config";
import getGitInfo from "../../tools/getGitInfo";
import getArguments from "./_getArguments";

const HELP_OUTPUT = `
yarn sherlo upload <options>

Available options:
--config <path>     
`;

const STAGE = "dev";

async function upload(): Promise<void> {
  try {
    printHeader();

    const { configPath, help } = getArguments();

    if (help) {
      console.log(HELP_OUTPUT);
      return;
    }

    const { android, ios, projectToken, stories, storiesRegex } =
      getConfig(configPath);

    const apiToken = projectToken.slice(0, 32);
    const teamId = projectToken.slice(32, 32 + 8);
    const projectIndex = Number(projectToken.slice(32 + 8));
    const gitInfo = getGitInfo();

    const client = SDKApiClient(apiToken);

    const { build, presignedBuildUrls } = await client.initBuild({
      teamId,
      projectIndex,
      config: {
        stories,
        storiesRegex,
        android: android && {
          devices: android.devices,
          packageName: android.packageName,
        },
        ios: ios && {
          devices: ios.devices,
          bundleIdentifier: ios.bundleIdentifier,
        },
      },
      gitInfo,
    });

    if (android?.apkPath && presignedBuildUrls.android) {
      shell.exec(
        `curl -v -X PUT -T ${android?.apkPath} "${presignedBuildUrls.android}"`,
        {
          silent: false,
        }
      );
    }

    if (ios?.appPath && presignedBuildUrls.ios) {
      const filename = path.basename(ios?.appPath);

      shell.exec(`tar czf ios.tar.gz -C ${ios?.appPath}/.. ${filename}`, {
        silent: false,
      });
      shell.exec(`curl -v -X PUT -T ios.tar.gz "${presignedBuildUrls.ios}"`, {
        silent: false,
      });
    }

    await client.openBuild({
      buildIndex: build.index,
      projectIndex,
      teamId,
    });

    console.log(
      `\nSee report at https://${
        STAGE === "dev" && "dev."
      }app.sherlo.io/build?t=${teamId}&p=${projectIndex}&b=${build.index}`
    );
  } catch (error) {
    console.error(error.message);
  } finally {
    process.exit();
  }
}

upload();
