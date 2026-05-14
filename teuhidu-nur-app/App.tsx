import 'react-native-gesture-handler'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StatusBar } from 'expo-status-bar'
import { HomeScreen, CatalogStackParamList } from './screens/HomeScreen'
import { ProductsScreen } from './screens/ProductsScreen'
import { CartScreen } from './screens/CartScreen'
import { useCartStore } from './store/cartStore'
import { Ionicons } from '@expo/vector-icons'

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#c9a84c',
    background: '#000000',
    card: '#0a0a0a',
    text: '#ffffff',
    border: 'rgba(255,255,255,0.08)',
    notification: '#c9a84c',
  },
}

const CatalogStack = createNativeStackNavigator<CatalogStackParamList>()
const Tab = createBottomTabNavigator()

const CatalogNavigator: React.FC = () => {
  return (
    <CatalogStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#000000' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <CatalogStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <CatalogStack.Screen
        name="Products"
        component={ProductsScreen}
        options={({ route }) => ({
          title: route.params.gender === 'male' ? 'For Him' : 'For Her',
        })}
      />
    </CatalogStack.Navigator>
  )
}

const TabBarIcon: React.FC<{ name: string; color: string; focused: boolean }> = ({ name, color, focused }) => {
  let iconName: keyof typeof Ionicons.glyphMap = 'help-circle'
  
  if (name === 'Catalog') {
    iconName = focused ? 'storefront' : 'storefront-outline'
  } else if (name === 'Cart') {
    iconName = focused ? 'cart' : 'cart-outline'
  }

  return <Ionicons name={iconName} size={24} color={color} />
}

export default function App() {
  const totalItems = useCartStore((s) => s.totalItems)

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <NavigationContainer theme={DarkTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#0a0a0a',
              borderTopColor: 'rgba(255,255,255,0.06)',
              borderTopWidth: 1,
              paddingBottom: 6,
              paddingTop: 6,
              height: 60,
            },
            tabBarActiveTintColor: '#c9a84c',
            tabBarInactiveTintColor: '#888888',
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 0.5,
            },
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={route.name} color={color} focused={focused} />
            ),
          })}
        >
          <Tab.Screen name="Catalog" component={CatalogNavigator} />
          <Tab.Screen
            name="Cart"
            component={CartScreen}
            options={{
              tabBarBadge: totalItems() > 0 ? totalItems() : undefined,
              tabBarBadgeStyle: {
                backgroundColor: '#c9a84c',
                color: '#000000',
                fontSize: 11,
                fontWeight: '700',
              },
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
})
