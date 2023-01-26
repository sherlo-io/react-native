export interface TestData {
  projectKey: string
  buildNumber: number
  token: string
  targetId: string
}

export interface Config {
  projectKey: string
  androidApkPath: string
  devices: { platform: 'Android' | 'iOS'; name: string }[]
}
