import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlansListScreen from '../screens/PlansListScreen';
import PlanDetailScreen from '../screens/PlanDetailScreen';

const Stack = createNativeStackNavigator();

export default function PlansStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PlansList" component={PlansListScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="PlanDetail"
        component={PlanDetailScreen}
        options={{ title: '计划详情', headerBackTitle: '返回' }}
      />
    </Stack.Navigator>
  );
}
