export const deviceKeys = [
  "nexus",
  "nexus.10",
  "nexus.4",
  "nexus.5",
  "nexus.5x",
  "nexus.6",
  "nexus.6p",
  "nexus.7.2013",
  "nexus.7.2012",
  "nexus.9",
  "nexus.one",
  "nexus.s",
  "pixel",
  "pixel.2",
  "pixel.2.xl",
  "pixel.3",
  "pixel.3.xl",
  "pixel.3a",
  "pixel.3a.xl",
  "pixel.4",
  "pixel.4.xl",
  "pixel.4a",
  "pixel.5",
  "pixel.c",
  "pixel.xl",
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
  displayName?: string;
  isTablet?: boolean;
}

const devices: Record<DeviceKey, Device> = {
  nexus: {
    name: "Galaxy Nexus",
    id: "nexus",
    resolution: {
      width: 720,
      height: 1280,
    },
    displayInInches: 4.7,
  },
  "nexus.10": {
    name: "Nexus 10",
    id: "nexus.10",
    resolution: {
      width: 1600,
      height: 2560,
    },
    displayInInches: 10.1,
    isTablet: true,
  },
  "nexus.4": {
    name: "Nexus 4",
    id: "nexus.4",
    resolution: {
      width: 768,
      height: 1280,
    },
    displayInInches: 4.7,
  },
  "nexus.5": {
    name: "Nexus 5",
    id: "nexus.5",
    resolution: {
      width: 1080,
      height: 1920,
    },
    displayInInches: 4.95,
  },
  "nexus.5x": {
    name: "Nexus 5X",
    id: "nexus.5x",
    resolution: {
      width: 1080,
      height: 1920,
    },
    displayInInches: 5.2,
  },
  "nexus.6": {
    name: "Nexus 6",
    id: "nexus.6",
    resolution: {
      width: 1440,
      height: 2560,
    },
    displayInInches: 5.96,
  },
  "nexus.6p": {
    name: "Nexus 6P",
    id: "nexus.6p",
    resolution: {
      width: 1440,
      height: 2560,
    },
    displayInInches: 5.7,
  },
  "nexus.7.2013": {
    name: "Nexus 7 2013",
    id: "nexus.7.2013",
    resolution: {
      width: 800,
      height: 1280,
    },
    displayInInches: 7.0,
    isTablet: true,
  },
  "nexus.7.2012": {
    name: "Nexus 7",
    id: "nexus.7.2012",
    resolution: {
      width: 800,
      height: 1280,
    },
    displayInInches: 7.0,
    isTablet: true,
  },
  "nexus.9": {
    name: "Nexus 9",
    id: "nexus.9",
    resolution: {
      width: 1536,
      height: 2048,
    },
    displayInInches: 8.9,
    isTablet: true,
  },
  "nexus.one": {
    name: "Nexus One",
    id: "nexus.one",
    resolution: {
      width: 480,
      height: 800,
    },
    displayInInches: 3.7,
  },
  "nexus.s": {
    name: "Nexus S",
    id: "nexus.s",
    resolution: {
      width: 480,
      height: 800,
    },
    displayInInches: 3.7,
  },
  pixel: {
    name: "pixel",
    id: "pixel",
    displayName: "Pixel",
    resolution: {
      width: 1080,
      height: 1920,
    },
    displayInInches: 5.0,
  },
  "pixel.2": {
    name: "pixel_2",
    id: "pixel.2",
    displayName: "Pixel 2",
    resolution: {
      width: 1080,
      height: 1920,
    },
    displayInInches: 5.0,
  },
  "pixel.2.xl": {
    name: "pixel_2_xl",
    id: "pixel.2.xl",
    displayName: "Pixel 2 XL",
    resolution: {
      width: 1440,
      height: 2880,
    },
    displayInInches: 6.0,
  },
  "pixel.3": {
    name: "pixel_3",
    id: "pixel.3",
    displayName: "Pixel 3",
    resolution: {
      width: 1080,
      height: 2160,
    },
    displayInInches: 5.5,
  },
  "pixel.3.xl": {
    name: "pixel_3_xl",
    id: "pixel.3.xl",
    displayName: "Pixel 3 XL",
    resolution: {
      width: 1440,
      height: 2960,
    },
    displayInInches: 6.3,
  },
  "pixel.3a": {
    name: "pixel_3a",
    id: "pixel.3a",
    displayName: "Pixel 3a",
    resolution: {
      width: 1080,
      height: 2220,
    },
    displayInInches: 5.6,
  },
  "pixel.3a.xl": {
    name: "pixel_3a_xl",
    id: "pixel.3a.xl",
    displayName: "Pixel 3a XL",
    resolution: {
      width: 1080,
      height: 2160,
    },
    displayInInches: 6.0,
  },
  "pixel.4": {
    name: "pixel_4",
    id: "pixel.4",
    displayName: "Pixel 4",
    resolution: {
      width: 1080,
      height: 2280,
    },
    displayInInches: 5.7,
  },
  "pixel.4.xl": {
    name: "pixel_4_xl",
    id: "pixel.4.xl",
    displayName: "Pixel 4 XL",
    resolution: {
      width: 1440,
      height: 3040,
    },
    displayInInches: 6.3,
  },
  "pixel.4a": {
    name: "pixel_4a",
    id: "pixel.4a",
    displayName: "Pixel 4a",
    resolution: {
      width: 1080,
      height: 2340,
    },
    displayInInches: 5.81,
  },
  "pixel.5": {
    name: "pixel_5",
    id: "pixel.5",
    displayName: "Pixel 5",
    resolution: {
      width: 1080,
      height: 2340,
    },
    displayInInches: 6.0,
  },
  "pixel.c": {
    name: "pixel_c",
    id: "pixel.c",
    displayName: "Pixel C",
    resolution: {
      width: 1800,
      height: 2560,
    },
    displayInInches: 10.2,
  },
  "pixel.xl": {
    name: "pixel_xl",
    id: "pixel.xl",
    displayName: "Pixel XL",
    resolution: {
      width: 1440,
      height: 2560,
    },
    displayInInches: 5.5,
  },
};

export default devices;
