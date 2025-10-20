import { createStackNavigator } from '@react-navigation/stack';
import SinginScreen from './screens/SingInScreen';

const Stack = createStackNavigator({
  screens: {
    Login: LoginScreen,
    Singin: SinginScreen,
  },
});