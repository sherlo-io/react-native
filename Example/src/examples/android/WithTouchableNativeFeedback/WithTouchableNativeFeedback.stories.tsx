import {storiesOf} from '@storybook/react-native';
import * as React from 'react';

import WithTouchableNativeFeedback from './WithTouchableNativeFeedback';

storiesOf('WithTouchableNativeFeedback', module)
  .addParameters({sherlo: {platform: 'android'}})
  .add('default', () => <WithTouchableNativeFeedback />);
