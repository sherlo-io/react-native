import { storiesOf } from '@storybook/react-native'
import * as React from 'react'

import WithKeyboardAvoidingView from './WithKeyboardAvoidingView'

storiesOf('WithKeyboardAvoidingView', module).add('default', () => (
  <WithKeyboardAvoidingView />
))
