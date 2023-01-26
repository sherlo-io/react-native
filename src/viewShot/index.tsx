// @flow
// import React, { Component, ReactNode } from "react";
import { View, NativeModules, Platform, findNodeHandle } from "react-native";

const base64 = require("base-64");
const utf8 = require("utf8");
// import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
// import type { LayoutEvent } from "react-native/Libraries/Types/CoreEventTypes";

const { RNViewShot } = NativeModules;

// const neverEndingPromise = new Promise(() => {});

type Options = {
  format: "png" | "jpg" | "webm" | "raw";
  result: "tmpfile" | "base64" | "data-uri" | "zip-base64";
  height?: number;
  quality?: number;
  snapshotContentContainer?: boolean;
  width?: number;
};

if (!RNViewShot) {
  console.warn(
    "react-native-view-shot: NativeModules.RNViewShot is undefined. Make sure the library is linked on the native side."
  );
}

const acceptedFormats = ["png", "jpg"].concat(
  Platform.OS === "android" ? ["webm", "raw"] : []
);

const acceptedResults = ["tmpfile", "base64", "data-uri"].concat(
  Platform.OS === "android" ? ["zip-base64"] : []
);

const defaultOptions: Pick<
  Required<Options>,
  "format" | "quality" | "result" | "snapshotContentContainer"
> = {
  format: "png",
  quality: 1,
  result: "tmpfile",
  snapshotContentContainer: false,
};

// validate and coerce options
function validateOptions(input?: Options): {
  errors: Array<string>;
  options: Options;
} {
  const options: Options = {
    ...defaultOptions,
    ...input,
  };
  const errors = [];
  if (
    "width" in options &&
    (typeof options.width !== "number" || options.width <= 0)
  ) {
    errors.push("option width should be a positive number");
    delete options.width;
  }
  if (
    "height" in options &&
    (typeof options.height !== "number" || options.height <= 0)
  ) {
    errors.push("option height should be a positive number");
    delete options.height;
  }
  if (
    typeof options.quality !== "number" ||
    options.quality < 0 ||
    options.quality > 1
  ) {
    errors.push("option quality should be a number between 0.0 and 1.0");
    options.quality = defaultOptions.quality;
  }
  if (typeof options.snapshotContentContainer !== "boolean") {
    errors.push("option snapshotContentContainer should be a boolean");
  }
  if (acceptedFormats.indexOf(options.format) === -1) {
    options.format = defaultOptions.format;
    errors.push(
      `option format '${
        options.format
      }' is not in valid formats: ${acceptedFormats.join(" | ")}`
    );
  }
  if (acceptedResults.indexOf(options.result) === -1) {
    options.result = defaultOptions.result;
    errors.push(
      `option result '${
        options.result
      }' is not in valid formats: ${acceptedResults.join(" | ")}`
    );
  }
  return { options, errors };
}

export function ensureModuleIsLoaded(): void {
  if (!RNViewShot) {
    throw new Error(
      "react-native-view-shot: NativeModules.RNViewShot is undefined. Make sure the library is linked on the native side."
    );
  }
}

export function captureRef<T extends React.ElementType>(
  view: number | View | React.Ref<T>,
  optionsObject?: any
): Promise<string> {
  ensureModuleIsLoaded();
  if (
    view &&
    typeof view === "object" &&
    "current" in view &&
    // $FlowFixMe view is a ref
    view.current
  ) {
    // $FlowFixMe view is a ref
    // @ts-ignore
    view = view.current;
    if (!view) {
      return Promise.reject(new Error("ref.current is null"));
    }
  }
  if (typeof view !== "number") {
    // @ts-ignore
    const node = findNodeHandle(view);
    if (!node) {
      return Promise.reject(
        new Error(`findNodeHandle failed to resolve view=${String(view)}`)
      );
    }
    // @ts-ignore
    view = node;
  }
  const { errors, options } = validateOptions(optionsObject);
  if (__DEV__ && errors.length > 0) {
    console.warn(
      `react-native-view-shot: bad options:\n${errors
        .map((e) => `- ${e}`)
        .join("\n")}`
    );
  }
  return RNViewShot.captureRef(view, options);
}

export function captureScreen(optionsObject?: Options): Promise<string> {
  ensureModuleIsLoaded();
  const { errors, options } = validateOptions(optionsObject);
  if (__DEV__ && errors.length > 0) {
    console.warn(
      `react-native-view-shot: bad options:\n${errors
        .map((e) => `- ${e}`)
        .join("\n")}`
    );
  }
  return RNViewShot.captureScreen(options);
}

// type Props = {
//   children: ReactNode;
//   captureMode?: "mount" | "continuous" | "update";
//   onCapture?: (uri: string) => void;
//   onCaptureFailure?: (e: Error) => void;
//   onLayout?: (e: *) => void;
//   options?: any;
//   style?: ViewStyleProp;
// };

// function checkCompatibleProps(props: Props): any {
//   if (!props.captureMode && props.onCapture) {
//     // in that case, it's authorized if you call capture() yourself
//   } else if (props.captureMode && !props.onCapture) {
//     console.warn(
//       "react-native-view-shot: captureMode prop is defined but onCapture prop callback is missing"
//     );
//   } else if (
//     (props.captureMode === "continuous" || props.captureMode === "update") &&
//     props.options &&
//     props.options.result &&
//     props.options.result !== "tmpfile"
//   ) {
//     console.warn(
//       `react-native-view-shot: result=tmpfile is recommended for captureMode=${props.captureMode}`
//     );
//   }
// }

// export default class ViewShot extends Component<Props> {
//   static captureRef = captureRef;

//   static releaseCapture = releaseCapture;

//   root: View;

//   _raf: *;

//   lastCapturedURI: string;

//   resolveFirstLayout: (layout: Object) => void;

//   firstLayoutPromise: Promise<Object> = new Promise((resolve) => {
//     this.resolveFirstLayout = resolve;
//   });

//   capture = (): Promise<string> =>
//     this.firstLayoutPromise
//       .then(() => {
//         const { root } = this;
//         if (!root) return neverEndingPromise; // component is unmounted, you never want to hear back from the promise
//         return captureRef(root, this.props.options);
//       })
//       .then(
//         (uri: string) => {
//           this.onCapture(uri);
//           return uri;
//         },
//         (e: Error) => {
//           this.onCaptureFailure(e);
//           throw e;
//         }
//       );

//   onCapture = (uri: string) => {
//     if (!this.root) return;
//     if (this.lastCapturedURI) {
//       // schedule releasing the previous capture
//       setTimeout(releaseCapture, 500, this.lastCapturedURI);
//     }
//     this.lastCapturedURI = uri;
//     const { onCapture } = this.props;
//     if (onCapture) onCapture(uri);
//   };

//   onCaptureFailure = (e: Error) => {
//     if (!this.root) return;
//     const { onCaptureFailure } = this.props;
//     if (onCaptureFailure) onCaptureFailure(e);
//   };

//   syncCaptureLoop = (captureMode: ?string) => {
//     cancelAnimationFrame(this._raf);
//     if (captureMode === "continuous") {
//       let previousCaptureURI = "-"; // needs to capture at least once at first, so we use "-" arbitrary string
//       const loop = () => {
//         this._raf = requestAnimationFrame(loop);
//         if (previousCaptureURI === this.lastCapturedURI) return; // previous capture has not finished, don't capture yet
//         previousCaptureURI = this.lastCapturedURI;
//         this.capture();
//       };
//       this._raf = requestAnimationFrame(loop);
//     }
//   };

//   onRef = (ref: React$ElementRef<*>) => {
//     this.root = ref;
//   };

//   onLayout = (e: LayoutEvent) => {
//     const { onLayout } = this.props;
//     this.resolveFirstLayout(e.nativeEvent.layout);
//     if (onLayout) onLayout(e);
//   };

//   componentDidMount() {
//     if (__DEV__) checkCompatibleProps(this.props);
//     if (this.props.captureMode === "mount") {
//       this.capture();
//     } else {
//       this.syncCaptureLoop(this.props.captureMode);
//     }
//   }

//   componentDidUpdate(prevProps: Props) {
//     if (this.props.captureMode !== undefined) {
//       if (this.props.captureMode !== prevProps.captureMode) {
//         this.syncCaptureLoop(this.props.captureMode);
//       }
//     }
//     if (this.props.captureMode === "update") {
//       this.capture();
//     }
//   }

//   componentWillUnmount() {
//     this.syncCaptureLoop(null);
//   }

//   render() {
//     const { children } = this.props;
//     return (
//       <View
//         ref={this.onRef}
//         collapsable={false}
//         onLayout={this.onLayout}
//         style={this.props.style}
//       >
//         {children}
//       </View>
//     );
//   }
// }

const normalizeFilePath = (path: string) =>
  path.startsWith("file://") ? path.slice(7) : path;

export function writeFile(
  filepath: string,
  contents: string,
  encodingOrOptions?: any
): Promise<void> {
  let b64;

  let options = {
    encoding: "utf8",
  };

  if (encodingOrOptions) {
    if (typeof encodingOrOptions === "string") {
      options.encoding = encodingOrOptions;
    } else if (typeof encodingOrOptions === "object") {
      options = {
        ...options,
        ...encodingOrOptions,
      };
    }
  }

  if (options.encoding === "utf8") {
    b64 = base64.encode(utf8.encode(contents));
  } else if (options.encoding === "ascii") {
    b64 = base64.encode(contents);
  } else if (options.encoding === "base64") {
    b64 = contents;
  } else {
    throw new Error(`Invalid encoding type "${options.encoding}"`);
  }

  return RNViewShot.writeFile(normalizeFilePath(filepath), b64, options).then(
    () => void 0
  );
}

export function appendFile(
  filepath: string,
  contents: string,
  encodingOrOptions?: any
): Promise<void> {
  let b64;

  let options = {
    encoding: "utf8",
  };

  if (encodingOrOptions) {
    if (typeof encodingOrOptions === "string") {
      options.encoding = encodingOrOptions;
    } else if (typeof encodingOrOptions === "object") {
      options = encodingOrOptions;
    }
  }

  if (options.encoding === "utf8") {
    b64 = base64.encode(utf8.encode(contents));
  } else if (options.encoding === "ascii") {
    b64 = base64.encode(contents);
  } else if (options.encoding === "base64") {
    b64 = contents;
  } else {
    throw new Error(`Invalid encoding type "${options.encoding}"`);
  }

  return RNViewShot.appendFile(normalizeFilePath(filepath), b64);
}

function readFileGeneric(
  filepath: string,
  encodingOrOptions: string,
  command: (arg: any) => Promise<string>
): Promise<string> {
  let options = {
    encoding: "utf8",
  };

  if (encodingOrOptions) {
    if (typeof encodingOrOptions === "string") {
      options.encoding = encodingOrOptions;
    } else if (typeof encodingOrOptions === "object") {
      options = encodingOrOptions;
    }
  }

  return command(normalizeFilePath(filepath)).then((b64) => {
    let contents;

    if (options.encoding === "utf8") {
      contents = utf8.decode(base64.decode(b64));
    } else if (options.encoding === "ascii") {
      contents = base64.decode(b64);
    } else if (options.encoding === "base64") {
      contents = b64;
    } else {
      throw new Error(`Invalid encoding type "${String(options.encoding)}"`);
    }

    return contents;
  });
}

export function readFile(
  filepath: string,
  encodingOrOptions?: any
): Promise<string> {
  return readFileGeneric(filepath, encodingOrOptions, RNViewShot.readFile);
}

export function unlink(filepath: string): Promise<void> {
  return RNViewShot.unlink(normalizeFilePath(filepath)).then(() => void 0);
}

type MkdirOptions = {
  // iOS only
  NSFileProtectionKey?: string;
  NSURLIsExcludedFromBackupKey?: boolean; // IOS only
};

export function mkdir(
  filepath: string,
  options: MkdirOptions = {}
): Promise<void> {
  return RNViewShot.mkdir(normalizeFilePath(filepath), options).then(
    () => void 0
  );
}

export function getExternalDirectoryPath(): string {
  return RNViewShot.getConstants().RNFSExternalDirectoryPath;
}

export function getDocumentDirectoryPath(): string {
  return RNViewShot.getConstants().RNFSDocumentDirectoryPath;
}
