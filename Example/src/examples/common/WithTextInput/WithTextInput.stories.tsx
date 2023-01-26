import {storiesOf} from '@storybook/react-native';
import * as React from 'react';

import WithTextInput from './WithTextInput';

storiesOf('WithTextInput', module)
  .add('default', () => <WithTextInput text="default" />)
  .add(
    'autoFocused',
    () => <WithTextInput autoFocus text="autofocused de-focused jabadaba du" />,
    {
      sherlo: {defocus: true},
    },
  )
  .add(
    'autoFocused with keyboard',
    () => <WithTextInput autoFocus text="autoFocused with keyboard" />,
    {
      sherlo: {withKeyboard: true},
    },
  );
