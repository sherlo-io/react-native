import {storiesOf} from '@storybook/react-native';
import * as React from 'react';

import WithDrawerLayoutAndroid from './WithDrawerLayoutAndroid';

storiesOf('WithDrawerLayoutAndroid', module)
  .addParameters({sherlo: {platform: 'android'}})
  .add('default', () => <WithDrawerLayoutAndroid />);
