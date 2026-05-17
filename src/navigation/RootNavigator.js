import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import WatchlistStack from './WatchlistStack';
import PlansStack from './PlansStack';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  const icons = { '自选': '📈', '计划': '📋' };
  return (
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] || '●'}
    </Text>
  );
}

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2979ff',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#f0f0f0',
          height: 56,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="WatchlistTab"
        component={WatchlistStack}
        options={{
          tabBarLabel: '自选',
          tabBarIcon: ({ focused }) => <TabIcon label="自选" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="PlansTab"
        component={PlansStack}
        options={{
          tabBarLabel: '计划',
          tabBarIcon: ({ focused }) => <TabIcon label="计划" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
