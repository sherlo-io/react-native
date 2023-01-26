import { pickBy } from "lodash";
import { Config } from "./types";

const configDefaults: Partial<Config> = {
  storiesRegex: "(.*?)",
};

const addConfigDefaults = (config: Config): any => {
  const configWithoutUndefined = pickBy(config, (v) => v !== undefined);

  return { ...configDefaults, ...configWithoutUndefined };
};

export default addConfigDefaults;
