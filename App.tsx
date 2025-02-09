import React from 'react';
import {useColorScheme, StatusBar} from 'react-native';
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DeliveryScreen from './screens/DeliveryScreen';
import DispatchScreen from './screens/DispatchScreen';

const Tab = createBottomTabNavigator();

// Adapt themes for NavigationContainer from react-native-paper
const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: MD3LightTheme,
  reactNavigationDark: MD3DarkTheme,
});

function App() {
  const scheme = useColorScheme(); // Detect system theme
  const theme = scheme === 'dark' ? DarkTheme : LightTheme; // Auto apply theme

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <StatusBar
          barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />

        <Tab.Navigator
          initialRouteName="Delivery"
          screenOptions={({route}) => ({
            tabBarIcon: ({color, size}) => {
              let iconName =
                route.name === 'Delivery' ? 'home-outline' : 'list-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
            headerStyle: {backgroundColor: theme.colors.background},
            headerTintColor: theme.colors.onBackground,
          })}>
          <Tab.Screen name="Delivery" component={DeliveryScreen} />
          <Tab.Screen name="Dispatch" component={DispatchScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;
