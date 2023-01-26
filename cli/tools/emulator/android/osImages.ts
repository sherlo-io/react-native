export const osKeys = ["13", "12L", "12", "11"] as const;
type OSKey = typeof osKeys[number];

// Mozliwe ze na niektorych kompach powinno byc arm64-v8a a na innych x86... to moze stworzyc problemu, trzeba przerestowac
// na macu z intelem tez
export const osImages: Record<
  OSKey,
  { imageDownloadKey: string; imageSysDir: string }
> = {
  "11": {
    imageDownloadKey: "system-images;android-30;google_apis;arm64-v8a",
    imageSysDir: "system-images/android-30/google_apis/arm64-v8a/",
  },
  "12": {
    imageDownloadKey: "system-images;android-31;google_apis;arm64-v8a",
    imageSysDir: "system-images/android-31/google_apis/arm64-v8a/",
  },
  "12L": {
    imageDownloadKey: "system-images;android-32;google_apis;arm64-v8a",
    imageSysDir: "system-images/android-32/google_apis/arm64-v8a/",
  },
  "13": {
    imageDownloadKey: "system-images;android-33;google_apis;arm64-v8a",
    imageSysDir: "system-images/android-33/google_apis/arm64-v8a/",
  },
};
