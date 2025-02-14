/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

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

import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}
const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: MD3LightTheme,
  reactNavigationDark: MD3DarkTheme,
});
function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const scheme = useColorScheme(); // Detect system theme
  const theme = scheme === 'dark' ? DarkTheme : LightTheme; // Auto apply theme
  
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

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

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
