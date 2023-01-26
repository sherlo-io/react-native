import './rn-addons'

import { getStorybookUI } from '@sherlo/react-native'
import { withKnobs } from '@storybook/addon-knobs'
import { addDecorator, configure } from '@storybook/react-native'

import { loadStories } from './storyLoader'

// enables knobs for all stories
addDecorator(withKnobs)

// import stories
configure(loadStories, module)

export default getStorybookUI({})
