import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WatchlistScreen from '../screens/WatchlistScreen';
import StockDetailScreen from '../screens/StockDetailScreen';

const Stack = createNativeStackNavigator();

export default function WatchlistStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Watchlist" component={WatchlistScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="StockDetail"
        component={StockDetailScreen}
        options={({ route }) => ({
          title: route.params?.code || '股票详情',
          headerBackTitle: '返回',
        })}
      />
    </Stack.Navigator>
  );
}
