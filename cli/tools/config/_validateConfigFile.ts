import { getOrElse } from "fp-ts/lib/Either";
import { failure } from "io-ts/lib/PathReporter";
import { Config, ConfigType } from "./types";

// https://til.cybertec-postgresql.com/post/2019-09-16-Typescript-json-validation-with-io-ts/
const validateConfigFile = (untypedConfig: any): Config => {
  const toError = (errors: any): Error => new Error(failure(errors).join("\n"));
  // @ts-ignore
  const config = getOrElse(toError)(ConfigType.decode(untypedConfig));

  if (config instanceof Error) {
    throw config;
  }

  return config;
};

export default validateConfigFile;
