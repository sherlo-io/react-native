export const osKeys = ["15.0", "15.2", "15.5", "16.0"] as const;
type OSKey = typeof osKeys[number];

export const osImages: Record<OSKey, string> = {
  "15.0": "com.apple.CoreSimulator.SimRuntime.iOS-15-0",
  "15.2": "com.apple.CoreSimulator.SimRuntime.iOS-15-2",
  "15.5": "com.apple.CoreSimulator.SimRuntime.iOS-15-5",
  "16.0": "com.apple.CoreSimulator.SimRuntime.iOS-16-0",
};
