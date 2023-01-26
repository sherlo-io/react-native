function msToTime(duration: number): string {
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const seconds = Math.floor((duration / 1000) % 60);

  const hoursString = `${hours < 10 ? "0" : ""}${hours}`;
  const minutesString = `${minutes < 10 ? "0" : ""}${minutes}`;
  const secondsString = `${seconds < 10 ? "0" : ""}${seconds}`;

  return `${hoursString}:${minutesString}:${secondsString}`;
}

export default msToTime;
