import {storiesOf} from '@storybook/react-native';
import * as React from 'react';

import WithInputAccessoryView from './WithInputAccessoryView';

storiesOf('WithInputAccessoryView', module)
  .addParameters({sherlo: {platform: 'ios'}})
  .add('default', () => <WithInputAccessoryView />);
