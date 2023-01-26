import {
  getStorybookUI as originalGetStorybookUI,
  raw,
} from "@storybook/react-native";
import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DevSettings,
  Keyboard,
  LogBox,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  writeFile,
  readFile,
  mkdir,
  getExternalDirectoryPath,
  getDocumentDirectoryPath,
  captureRef,
  appendFile,
  captureScreen,
} from "./viewShot";

class ErrorBoundary extends React.Component<{
  children: ReactNode[];
  logDebug: (...messages: any[]) => Promise<void>;
  onError: () => void;
}> {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  componentDidCatch(error: unknown) {
    this.props.onError();
    throw error;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  render() {
    // this.props.logDebug("rendered component", decycle(this.props.children));
    return this.props.children;
  }
}

const wait = (seconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });

let path =
  Platform.OS === "android"
    ? getExternalDirectoryPath()
    : getDocumentDirectoryPath();
path += "/sherlo";

LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by message
LogBox.ignoreAllLogs(true);
console.warn = () => null;
console.error = () => null;

// @ts-ignore
console.reportErrorsAsExceptions = false;

const STABILIZATION_TIMEOUT = 12 * 1000;
const STABILIZATION_INTERVAL = 4 * 1000;
const RESPONSE_READ_INTERVAL = 1 * 1000;
const POST_INDEX_WRITE_TIMEOUT = 1000;
const PRE_END_WRITE_TIMEOUT = 1000;
const POST_START_WRITE_TIMEOUT = 5000;
const CAPTURE_STORY_AFTER_RENDER_TIMEOUT = 1000;

interface Props {
  sherloEnabled?: boolean;
}

type KeyboardStatus = "willShow" | "willHide" | "shown" | "hidden";

const getStorybookUI =
  (...storybookProps: Parameters<typeof originalGetStorybookUI>) =>
  ({ sherloEnabled }: Props): ReactElement => {
    const [selectionIndex, setSelectionIndex] = useState(0);
    const [initialized, setInitialized] = useState(false);
    const keyboardStateRef = useRef<KeyboardStatus>();
    const [sherloPreview, setSherloPreview] = useState(false);
    const snapshotHasError = useRef(false);
    const [stories, setStories] = useState<any | undefined>();
    const storybookRef = useRef();

    const logDebug = (...messages: any[]): Promise<void> => {
      console.log(...messages);
      return appendFile(
        `${path}/tmp/log.sherlo`,
        `\n\n${new Date().toTimeString().split(" ")[0]} : ${JSON.stringify(
          messages,
          null,
          2
        )}`
      );
    };

    const waitForKeyboardStatus = (
      status: KeyboardStatus,
      timeoutMs: number = 5 * 1000
    ): Promise<void> =>
      new Promise((resolve) => {
        // if (Platform.OS === "ios") {
        //   setTimeout(() => resolve(), 500);
        //   return;
        // }

        const startTime = Date.now();
        let time = 0;
        // let interval: NodeJS.Timeout | undefined;

        const interval = setInterval((): void => {
          time = Date.now() - startTime;
          if (time > timeoutMs) {
            clearInterval(interval);
            logDebug(
              `waiting for keyboard status: ${status} failed after ${timeoutMs} ms, acutal status was ${keyboardStateRef.current}`
            );
            resolve();
          }

          if (keyboardStateRef.current === status) {
            clearInterval(interval);
            logDebug(
              `waiting for keyboard status: ${status} succeeded after ${time} ms`
            );
            resolve();
          }
        }, 500);
      });

    useEffect(() => {
      if (sherloEnabled) {
        // TODO powinnismy usunac listenery na return useEffecta
        Keyboard.addListener("keyboardDidChangeFrame", () => {
          logDebug("keyboardDidChangeFrame");
          // setKeyboardState("keyboardDidChangeFrame");
        });
        Keyboard.addListener("keyboardDidHide", () => {
          logDebug("keyboardDidHide");
          keyboardStateRef.current = "hidden";
        });
        Keyboard.addListener("keyboardDidShow", () => {
          logDebug("keyboardDidShow");
          keyboardStateRef.current = "shown";
        });
        Keyboard.addListener("keyboardWillChangeFrame", () => {
          logDebug("keyboardWillChangeFrame");
        });
        Keyboard.addListener("keyboardWillHide", () => {
          logDebug("keyboardWillHide");
          keyboardStateRef.current = "willHide";
        });
        Keyboard.addListener("keyboardWillShow", () => {
          logDebug("keyboardWillShow");
          keyboardStateRef.current = "willShow";
        });
        readFile(`${path}/config.sherlo`, "utf8")
          .then((configString) => {
            const config = JSON.parse(configString);

            const filteredStories = raw()
              .filter(
                (value) => !config.stories || config.stories.includes(value.id)
              )
              .filter(
                (value) =>
                  !config.storiesRegex ||
                  new RegExp(config.storiesRegex, "g")?.test(value.kind)
              )
              .filter((value) => !value.parameters.sherlo?.exclude)
              .filter(
                (value) =>
                  !value.parameters.sherlo?.platform ||
                  value.parameters.sherlo?.platform === Platform.OS
              )
              .map(({ hooks, ...value }) => ({
                displayName: `${value.kind} - ${value.name}`,
                ...value,
              }));

            logDebug({ storiesCount: filteredStories.length, filteredStories });
            setStories(filteredStories);
          })
          .catch((error) => {
            logDebug({ error });
            // sherlo is not enabled
          });
      } else if (__DEV__) {
        DevSettings.addMenuItem("Toggle Sherlo preview", () => {
          setSherloPreview((value) => !value);
        });
      }
    }, [sherloEnabled]);

    const invisibleTextInputRef = React.useRef<TextInput>(null);

    const capture = (currentSelection: number): Promise<string> => {
      if (stories[currentSelection].parameters.sherlo?.captureScrollView) {
        // @ts-ignore
        return captureRef(storybookRef, {
          format: "png",
          result: "base64",
          snapshotContentContainer: true,
        });
      }
      return captureScreen({
        format: "png",
        result: "base64",
      });
    };

    const captureUntilStable = async (
      currentSelection: number
    ): Promise<string> => {
      const startTime = Date.now();
      let snapshotIsStable = false;
      let stabilizationAttempts = 1;
      let snapshotBase64 = await capture(currentSelection);

      while (
        !snapshotIsStable &&
        Date.now() - startTime < STABILIZATION_TIMEOUT
      ) {
        logDebug(Platform.OS, "stabilization attempt: ", stabilizationAttempts);
        // eslint-disable-next-line no-await-in-loop
        await new Promise<void>((r) =>
          setTimeout(() => r(), STABILIZATION_INTERVAL)
        );

        // eslint-disable-next-line no-await-in-loop
        const newSnapshotBase64 = await capture(currentSelection);

        snapshotIsStable =
          newSnapshotBase64.localeCompare(snapshotBase64) === 0;
        snapshotBase64 = newSnapshotBase64;
        stabilizationAttempts += 1;
      }

      if (!snapshotIsStable) {
        logDebug(
          Platform.OS,
          "couldn't stabilize this screenshot with attempts of",
          stabilizationAttempts
        );
      }

      return snapshotBase64;
    };

    const captureStory = (currentSelection: number) => async () => {
      if (snapshotHasError.current) {
        logDebug("reporting error snapshot to master script", {
          currentSelection,
          story: stories[currentSelection],
        });

        await capture(currentSelection).then((snapshotBase64) => {
          // TODO usunac ten log, tylko do tymaczasowego debugowania
          if (snapshotBase64.length === 0) {
            logDebug(
              "snapshotBase64 is empty for ",
              stories[selectionIndex].id
            );
          }
          return writeFile(
            `${path}/tmp/${stories[selectionIndex].id}.sherlo.error.png`,
            snapshotBase64,
            "base64"
          );
        });
        return;
      }

      logDebug("captureStory", {
        currentSelection,
        story: stories[currentSelection],
      });

      try {
        if (!stories[currentSelection].parameters.sherlo?.captureScrollView) {
          logDebug("requesting screenshot from master script");

          // dont change to destructed arguments, it will fail when sherlo object is undefined
          const figmaUrl = stories[selectionIndex].parameters?.sherlo?.figmaUrl;

          await writeFile(
            `${path}/tmp/${stories[selectionIndex].id}.request.sherlo`,
            `${stories[selectionIndex].displayName}${
              figmaUrl ? `;;;;${figmaUrl}` : ""
            }`
          );
          await new Promise<void>((resolve) => {
            const responseReadInterval = setInterval(async () => {
              const response = await readFile(
                `${path}/tmp/${stories[selectionIndex].id}.response.sherlo`
              ).catch(() => false);
              if (response) {
                clearInterval(responseReadInterval);
                resolve();
              }
            }, RESPONSE_READ_INTERVAL);
          });

          logDebug("received screenshot from master script");
        } else {
          await captureUntilStable(currentSelection).then((snapshotBase64) => {
            // TODO usunac ten log, tylko do tymaczasowego debugowania
            if (snapshotBase64.length === 0) {
              logDebug(
                "snapshotBase64 is empty for ",
                stories[selectionIndex].id
              );
            }
            return writeFile(
              `${path}/snapshots/${stories[selectionIndex].id}.screenshot.sherlo.png`,
              // `${stories[selectionIndex].displayName};;;;${snapshotBase64}`
              snapshotBase64,
              "base64"
            ).then(() => {
              logDebug(
                Platform.OS,
                `${selectionIndex + 1} / ${stories.length}`,
                stories[selectionIndex].id,
                "suceeded"
              );
            });
          });
        }
        if (currentSelection + 1 < stories.length) {
          // go to next story
          const nextIndex = currentSelection + 1;
          logDebug(Platform.OS, "writing new current index: ", nextIndex);
          await writeFile(
            `${path}/tmp/current_index.sherlo`,
            `${nextIndex};;;;${stories[nextIndex].id};;;;${stories[nextIndex].displayName};;;;${stories.length}`
          );
          // timeout dodany zeby sprawdzic czy szybki crash nie sprawia ze writeFile dla current_index sie nie wykonuje i powoduje bledy
          await new Promise<void>((r) =>
            setTimeout(() => r(), POST_INDEX_WRITE_TIMEOUT)
          );

          setSelectionIndex(nextIndex);
        } else {
          logDebug("finishing test with submiting end.sherlo file");
          await new Promise<void>((r) =>
            setTimeout(() => r(), PRE_END_WRITE_TIMEOUT)
          );
          await writeFile(`${path}/tmp/end.sherlo`, `1`);
        }
      } catch (error) {
        logDebug(
          Platform.OS,
          `${selectionIndex + 1} / ${stories.length}`,
          stories[selectionIndex].id,
          "failed: ",
          error
        );
        // snapshot failed
      }
    };

    useEffect(() => {
      if (stories === undefined) return;
      const initializeAsync = async () => {
        let initialSelectionIndex = selectionIndex;
        let isFreshStart = true;

        // get current index if the app crashed and restarting from specific state
        // we start from next story after the one that crashed
        try {
          const currentIndexFile = await readFile(
            `${path}/tmp/current_index.sherlo`,
            "utf8"
          );
          const [
            snapshotsCountString,
            _snapshotName,
            _snapshotDisplayName,
            _storiesLength,
          ] = currentIndexFile.split(";;;;");
          initialSelectionIndex = parseInt(snapshotsCountString, 10) + 1;
          isFreshStart = false;
        } catch (error) {
          //
        }
        logDebug("initializeAsync", { isFreshStart, initialSelectionIndex });

        if (isFreshStart) {
          await mkdir(`${path}/tmp`).catch(() => {
            //
          });
          await mkdir(`${path}/snapshots`).catch(() => {
            //
          });
          await writeFile(`${path}/tmp/log.sherlo`, ``);
          await writeFile(`${path}/tmp/start.sherlo`, JSON.stringify(stories));
          await new Promise<void>((r) =>
            setTimeout(() => r(), POST_START_WRITE_TIMEOUT)
          );
        }

        await writeFile(`${path}/tmp/launch_timestamp.sherlo`, `${Date.now()}`);

        // there is no next snapshot
        // this can happen if previous snapshot had errors, was screenshot by master script
        // and we reboot to screenshot next snapshot
        if (initialSelectionIndex >= stories.length) {
          if (isFreshStart) {
            await new Promise<void>((r) =>
              setTimeout(() => r(), PRE_END_WRITE_TIMEOUT)
            );
          }
          await writeFile(`${path}/tmp/end.sherlo`, `1`);
          return;
        }

        // writie initial files with current index and total stories count
        logDebug("writing current_index", {
          initialSelectionIndex,
        });
        await writeFile(
          `${path}/tmp/current_index.sherlo`,
          `${initialSelectionIndex};;;;${stories[initialSelectionIndex].id};;;;${stories[initialSelectionIndex].displayName};;;;${stories.length}`
        );

        // timeout dodany zeby sprawdzic czy szybki crash nie sprawia ze writeFile dla current_index sie nie wykonuje i powoduje bledy
        await new Promise<void>((r) =>
          setTimeout(() => r(), POST_INDEX_WRITE_TIMEOUT)
        );

        setSelectionIndex(initialSelectionIndex);
        setInitialized(true);
      };

      initializeAsync();
    }, [stories]);

    useEffect(() => {
      logDebug("check for captureStory", {
        initialized,
        storiesLength: stories?.length,
        selectionIndex,
      });

      if (
        initialized &&
        stories.length > 0 &&
        selectionIndex < stories.length
      ) {
        setTimeout(async () => {
          if (stories[selectionIndex].parameters.sherlo?.timeout) {
            await wait(stories[selectionIndex].parameters.sherlo?.timeout);
          }

          await waitForKeyboardStatus("shown");

          if (keyboardStateRef.current === "shown") {
            logDebug("keyboardAction -- Keyboard.dismiss()");
            Keyboard.dismiss();
            await waitForKeyboardStatus("hidden");
          }

          if (
            stories[selectionIndex].parameters.sherlo?.defocus ||
            stories[selectionIndex].parameters.sherlo?.withKeyboard
          ) {
            logDebug("keyboardAction -- defocus");
            invisibleTextInputRef.current?.focus();
            await waitForKeyboardStatus("shown");
            invisibleTextInputRef.current?.blur();
            await waitForKeyboardStatus("hidden");
            // } else if (stories[selectionIndex].parameters.sherlo?.withKeyboard) {
            //   logDebug("keyboardAction -- withKeyboard focus");
            //   // invisibleTextInputRef.current?.focus();
            //   // await waitForKeyboardStatus("shown");
          }

          setTimeout(
            captureStory(selectionIndex),
            CAPTURE_STORY_AFTER_RENDER_TIMEOUT
          );
        }, CAPTURE_STORY_AFTER_RENDER_TIMEOUT);
      }
    }, [initialized, selectionIndex, snapshotHasError]);

    const memoized = React.useMemo(() => {
      if (!sherloEnabled && !sherloPreview) {
        const StorybookUI = originalGetStorybookUI(...storybookProps);
        return <StorybookUI />;
      }

      if (initialized || sherloPreview) {
        let StorybookUI;
        if (sherloPreview) {
          // TODO dobrze by bylo tez emulowac co sie dzieje z klawiatura
          // const allStories = raw();
          StorybookUI = originalGetStorybookUI({
            ...storybookProps,
            isUIHidden: true,
            disableWebsockets: true,
            resetStorybook: true,
            onDeviceUI: false,
            shouldDisableKeyboardAvoidingView: true,
            keyboardAvoidingViewVerticalOffset: 0,
          });
        } else {
          StorybookUI = originalGetStorybookUI({
            ...storybookProps,
            initialSelection: stories[selectionIndex].id,
            isUIHidden: true,
            disableWebsockets: true,
            resetStorybook: true,
            onDeviceUI: false,
            shouldDisableKeyboardAvoidingView: true,
            keyboardAvoidingViewVerticalOffset: 0,
          });

          logDebug("rendering story", {
            storyId: stories[selectionIndex].id,
            selectionIndex,
          });
        }

        return (
          // @ts-ignore
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: "white",
            }}
          >
            {/** @ts-ignore */}
            <ErrorBoundary
              onError={() => {
                snapshotHasError.current = true;
              }}
              logDebug={logDebug}
            >
              <StorybookUI // @ts-ignore
                ref={storybookRef}
              />
            </ErrorBoundary>
            {/** @ts-ignore */}
            <TextInput
              collapsable={false}
              keyboardType={
                Platform.OS === "android" ? "visible-password" : "email-address"
              }
              autoComplete={"off"}
              autoCorrect={false}
              spellCheck={false}
              style={{ display: "none" }}
              ref={invisibleTextInputRef}
            />
          </View>
        );
      }

      return <></>;
    }, [initialized, sherloPreview, selectionIndex]);

    return memoized;
  };

export type SherloStorybook = ReturnType<typeof getStorybookUI>;

export default getStorybookUI;
