// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DeliveryScreen from './screens/DeliveryScreen';
import DispatchScreen from './screens/DispatchScreen';

const Tab = createBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Delivery"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            // Dynamically set icons for each tab
            if (route.name === 'Delivery') {
              iconName = 'home-outline'; // Valid Ionicons name
            } else if (route.name === 'Dispatch') {
              iconName = 'list-outline'; // Valid Ionicons name
            }

            // Return Ionicons or a fallback
            if (!Ionicons.hasIcon(iconName)) {
              console.warn(`Icon ${iconName} not found in Ionicons library.`);
              return <Ionicons name="alert-circle-outline" size={size} color={color} />;
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Delivery" component={DeliveryScreen} />
        <Tab.Screen name="Dispatch" component={DispatchScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
