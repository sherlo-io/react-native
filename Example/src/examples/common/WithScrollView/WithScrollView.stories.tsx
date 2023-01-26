import {storiesOf} from '@storybook/react-native';
import * as React from 'react';

import WithScrollView from './WithScrollView';

storiesOf('WithScrollView', module)
  .addParameters({sherlo: {captureScrollView: true}})
  .add('default', () => <WithScrollView />);
