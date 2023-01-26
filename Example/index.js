import {withStorybook} from '@sherlo/react-native';
import {AppRegistry} from 'react-native';

import {name as appName} from './app.json';
import App from './src/App';
import Storybook from './storybook';

AppRegistry.registerComponent(appName, () => withStorybook(App, Storybook));
