import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Image, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Provider, useSelector } from 'react-redux';
import { store } from './src/redux/store';

import MainCategoryScreen from './src/screens/MainCategoryScreen.js';
import DetailedProductListScreen from './src/screens/DetailedProductListScreen.js';
import ProductListScreen from './src/screens/ProductListScreen.js';
import ShoppingCartScreen from './src/screens/ShoppingCartScreen.js';
import MyOrdersScreen from './src/screens/MyOrdersScreen.js';
import UserProfileScreen from './src/screens/UserProfileScreen.js';
import SplashScreen from './src/screens/SplashScreen.js';

const Stack = createStackNavigator();
const RootStack = createStackNavigator(); 
const Tab = createBottomTabNavigator();

function ProductStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={MainCategoryScreen}/>
      <Stack.Screen name="ProductList" component={ProductListScreen}/>
      <Stack.Screen name="DetailedProductList" component={DetailedProductListScreen} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const cartItems = useSelector((state) => state.cart.items);
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const newOrderCount = useSelector((state) => state.orders.newOrderCount);

  const handleProtectedTab = (e, navigation) => {
    if (!isLoggedIn) {
      e.preventDefault(); // STOPS the tab from actually switching
      Alert.alert(
        "Authentication Required", 
        "You must be signed in to view this section."
      );
      navigation.navigate("User Profile"); 
    }
  };

  return (
    <Tab.Navigator
      initialRouteName="User Profile" 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4A76C0', 
        tabBarInactiveTintColor: 'gray', 
        tabBarStyle: {
            paddingBottom: 5,
            height: 60, 
        },
        tabBarIcon: ({ focused }) => {
          let iconSource;

          if (route.name === 'Products') {
            iconSource = require('./src/assets/Items/home.png');
          } else if (route.name === 'My Cart') {
            iconSource = require('./src/assets/Items/cart.png');
          } else if (route.name === 'My Orders') {
            iconSource = require('./src/assets/Items/orders.png');
          } else if (route.name === 'User Profile') {
            iconSource = require('./src/assets/Items/user.png');
          }

          return (
            <Image 
              source={iconSource} 
              style={{ 
                width: 28, 
                height: 28, 
                resizeMode: 'contain',
                opacity: focused ? 1 : 0.5 
              }} 
            />
          );
        },
      })}
    >
      <Tab.Screen 
        name="Products" 
        component={ProductStack} 
        listeners={({ navigation }) => ({
          tabPress: (e) => handleProtectedTab(e, navigation),
        })}
      />
      <Tab.Screen 
        name="My Cart" 
        component={ShoppingCartScreen}
        options={{
          tabBarBadge: totalQuantity > 0 ? totalQuantity : null,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => handleProtectedTab(e, navigation),
        })}
      />
      <Tab.Screen 
        name="My Orders" 
        component={MyOrdersScreen} 
        options={{
          tabBarBadge: newOrderCount > 0 ? newOrderCount : null,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => handleProtectedTab(e, navigation),
        })}
      />
      <Tab.Screen name="User Profile" component={UserProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Splash" component={SplashScreen} />
      <RootStack.Screen name="MainTabs" component={TabNavigator} />
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});