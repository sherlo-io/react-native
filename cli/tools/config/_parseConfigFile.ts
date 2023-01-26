import fs from "fs";

const parseConfigFile = (path = "sherlo.config.json"): any => {
  let configFile;
  try {
    configFile = fs.readFileSync(path, "utf8");
  } catch (error) {
    switch (error.code) {
      case "ENOENT":
        throw new Error(
          `${path} file was not found at the root of your project. Learn how to specify the config file at https://docs.sherlo.io`
        );
      case "EACCES":
        throw new Error(
          `${path} was found but couldn't be accessed due to lack of permissions, make sure that file has read permissions`
        );
      default:
        // TODO Tego typu errory powinny trafiac do sentry
        throw error;
    }
  }

  let configJSON;
  try {
    configJSON = JSON.parse(configFile);
  } catch (error) {
    throw new Error(
      `${path} is not a valid JSON file, please validate your JSON with external tools like https://jsonformatter.curiousconcept.com/`
    );
  }

  return configJSON;
};

export default parseConfigFile;
