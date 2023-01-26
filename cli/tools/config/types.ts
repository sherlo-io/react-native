import * as ioTs from "io-ts";
import {
  deviceKeys as androidDeviceKeys,
  osKeys as androidOsKeys,
} from "../emulator/android";
import {
  deviceKeys as iOSDeviceKeys,
  osKeys as iOSOSKeys,
} from "../emulator/ios";

function keyObject<T extends readonly string[]>(
  arr: T
): { [K in T[number]]: null } {
  return Object.fromEntries(arr.map((v) => [v, null])) as any;
}

export const IOSDeviceType = ioTs.type({
  name: ioTs.keyof(keyObject(iOSDeviceKeys)),
  version: ioTs.keyof(keyObject(iOSOSKeys)),
});

export const AndroidDeviceType = ioTs.type({
  name: ioTs.keyof(keyObject(androidDeviceKeys)),
  version: ioTs.keyof(keyObject(androidOsKeys)),
});

export const ConfigType = ioTs.type({
  projectToken: ioTs.string,
  android: ioTs.union([
    ioTs.type({
      apkPath: ioTs.string,
      packageName: ioTs.string,
      devices: ioTs.array(AndroidDeviceType),
    }),
    ioTs.undefined,
  ]),
  ios: ioTs.union([
    ioTs.type({
      appPath: ioTs.union([ioTs.string, ioTs.undefined]),
      project: ioTs.union([
        ioTs.type({
          workspace: ioTs.union([ioTs.string, ioTs.undefined]),
          project: ioTs.union([ioTs.string, ioTs.undefined]),
          scheme: ioTs.string,
          configuration: ioTs.string,
        }),
        ioTs.undefined,
      ]),
      bundleIdentifier: ioTs.string,
      devices: ioTs.array(IOSDeviceType),
    }),
    ioTs.undefined,
  ]),
  storiesRegex: ioTs.union([ioTs.string, ioTs.undefined]),
  stories: ioTs.union([ioTs.array(ioTs.string), ioTs.undefined]),
});

export type AndroidDevice = ioTs.TypeOf<typeof AndroidDeviceType>;
export type IOsDevice = ioTs.TypeOf<typeof IOSDeviceType>;

type IOSConfig = {
  bundleIdentifier: string;
  devices: IOsDevice[];
  appPath?: string;
  project?: {
    configuration: string;
    scheme: string;
    project?: string;
    workspace?: string;
  };
};

export type Config = {
  projectToken: string;
  android?: {
    apkPath: string;
    devices: AndroidDevice[];
    packageName: string;
  };
  ios?: IOSConfig;
  stories?: string[];
  storiesRegex?: string;
};
