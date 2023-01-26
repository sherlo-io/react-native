export const deviceKeys = [
  "iphone.x",
  "iphone.8.plus",
  "ipad.mini.6.gen",
  "iphone.11",
  "iphone.12.mini",
  "iphone.13",
  "iphone.13.pro.max",
  "iphone.14",
] as const;
type DeviceKey = typeof deviceKeys[number];

interface Device {
  displayInInches: number;
  id: string;
  name: string;
  resolution: {
    height: number;
    width: number;
  };
  isTablet?: boolean;
}

const devices: Record<DeviceKey, Device> = {
  "iphone.12.mini": {
    resolution: {
      width: 1080,
      height: 2340,
    },
    displayInInches: 5.4,
    name: "iPhone 12 mini",
    id: "iphone.12.mini",
  },
  "iphone.x": {
    name: "iPhone X",
    resolution: {
      width: 1125,
      height: 2436,
    },
    displayInInches: 5.85,
    id: "iphone.x",
  },
  "iphone.8.plus": {
    name: "iPhone 8 Plus",
    resolution: {
      width: 1080,
      height: 1920,
    },
    displayInInches: 5.5,
    id: "iphone.8.plus",
  },
  "ipad.mini.6.gen": {
    name: "iPad mini (6th generation)",
    resolution: {
      width: 1488,
      height: 2266,
    },
    displayInInches: 8.3,
    isTablet: true,
    id: "ipad.mini.6.gen",
  },
  "iphone.11": {
    name: "iPhone 11",
    resolution: {
      width: 1170,
      height: 2532,
    },
    displayInInches: 6.1,
    id: "iphone.11",
  },
  "iphone.13": {
    name: "iPhone 13",
    resolution: {
      width: 1170,
      height: 2532,
    },
    displayInInches: 6.1,
    id: "iphone.13",
  },
  "iphone.13.pro.max": {
    name: "iPhone 13 Pro Max",
    resolution: {
      width: 1284,
      height: 2778,
    },
    displayInInches: 6.7,
    id: "iphone.13.pro.max",
  },
  "iphone.14": {
    name: "iPhone 14",
    resolution: {
      width: 1170,
      height: 2532,
    },
    displayInInches: 6.1,
    id: "iphone.14",
  },
};

export default devices;
