/* eslint-disable no-console */
import gradient from "gradient-string";

const HEADER_ASCII = `
             888                       888          
             888                       888          
             888                       888          
    .d8888b  888 8b.   .d88b.  .d88888 888  .d88b.  
    88K      888 "88b d8P  Y8b 888"    888 d88""88b 
    "Y8888b. 888  888 88888888 888     888 888  888 
         X88 888  888 Y8b.     888     888 Y88..88P 
     88888P' 888  888  "Y8888  888     888  "Y88P"

Make sure your mobile app looks perfect on every device
`;

export const UNREVIEWED_COLOR = "FF906C";
export const APPROVED_COLOR = "79E8A5";
export const NO_CHANGES_COLOR = "64B5F6";

const printHeader = (): void => {
  const sherloStatusesGradient = gradient(
    UNREVIEWED_COLOR,
    APPROVED_COLOR,
    NO_CHANGES_COLOR
  );

  console.log(sherloStatusesGradient(HEADER_ASCII));
};

export default printHeader;
