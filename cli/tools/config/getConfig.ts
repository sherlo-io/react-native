import addConfigDefaults from "./_addConfigDefaults";
import parseConfigFile from "./_parseConfigFile";
import validateConfigFile from "./_validateConfigFile";
import { Config } from "./types";

// powinnismy przetestowac co sie dzieje jak niektore rzeczy w configu sa nieprawidlowe
// np token, apkPath, packageName itp. jak to sie manifestuje?
const getConfig = (path?: string): Config => {
  const parsedConfig = parseConfigFile(path);
  const validatedConfig = validateConfigFile(parsedConfig);
  const configWithDefaults = addConfigDefaults(validatedConfig);
  return configWithDefaults;
};

export default getConfig;
