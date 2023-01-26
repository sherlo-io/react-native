import {storiesOf} from '@storybook/react-native';
import * as React from 'react';

import WithSafeAreaView from './WithSafeAreaView';

storiesOf('WithSafeAreaView', module)
  .addParameters({sherlo: {platform: 'ios'}})
  .add('default', () => <WithSafeAreaView />);
