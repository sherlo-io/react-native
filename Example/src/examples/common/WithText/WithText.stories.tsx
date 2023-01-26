import {storiesOf} from '@storybook/react-native';
import * as React from 'react';

import WithText from './WithText';

storiesOf('WithText', module)
  .addParameters({
    sherlo: {
      figmaUrl:
        'https://www.figma.com/file/T3FEjvKncAgxU7xYY0KMwj/Ignored-Regions?node-id=108%3A18&t=rKvh9tWBwpP8B41Y-4',
    },
  })
  .add('default', () => <WithText />);
