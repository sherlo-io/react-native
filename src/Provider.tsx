import React, { ReactElement, useEffect, useState } from "react";
import { Platform, DevSettings } from "react-native";
import { SherloStorybook } from "./getStorybookUI";
import {
  getDocumentDirectoryPath,
  getExternalDirectoryPath,
  readFile,
} from "./viewShot";

interface Props {
  App: () => ReactElement;
  Storybook: SherloStorybook;
}

let path =
  Platform.OS === "android"
    ? getExternalDirectoryPath()
    : getDocumentDirectoryPath();
path += "/sherlo";

const Provider = ({ App, Storybook }: Props): ReactElement => {
  const [sherloEnabled, setSherloEnabled] = useState(false);
  const [storybookEnabled, setStorybookEnabled] = useState(false);

  useEffect(() => {
    if (__DEV__) {
      DevSettings.addMenuItem("Toggle Storybook", () => {
        console.log("Toggle Storybook");
        setStorybookEnabled((value) => !value);
      });
    }

    // TODO: Android 13 throws error when reading files https://stackoverflow.com/questions/36088699/error-open-failed-enoent-no-such-file-or-directory
    readFile(`${path}/config.sherlo`, "utf8")
      .then(() => {
        console.log("setSherloEnabled(true)");
        setSherloEnabled(true);
      })
      .catch((error) => {
        console.log("setSherloEnabled error", error);
        // sherlo is not enabled
      });
  }, []);

  if (sherloEnabled || storybookEnabled) {
    return <Storybook sherloEnabled={sherloEnabled} />;
  }

  return <App />;
};

export default Provider;
