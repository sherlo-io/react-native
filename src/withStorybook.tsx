/* eslint-disable react/display-name */
import React, { ReactElement } from "react";
import Provider from "./Provider";
import { SherloStorybook } from "./getStorybookUI";

const withStorybook =
  (App: () => ReactElement, Storybook: SherloStorybook) => (): ReactElement => {
    return <Provider Storybook={Storybook} App={App} />;
  };

export default withStorybook;
