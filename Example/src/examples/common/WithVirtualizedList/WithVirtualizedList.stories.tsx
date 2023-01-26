import { storiesOf } from '@storybook/react-native'
import * as React from 'react'

import WithVirtualizedList from './WithVirtualizedList'

storiesOf('WithVirtualizedList', module)
  // .addParameters({ sherlo: { isScrollView: true } })
  .add('default', () => <WithVirtualizedList />)
