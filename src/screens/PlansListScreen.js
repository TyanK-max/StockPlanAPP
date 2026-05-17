import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { usePlans } from '../hooks/usePlans';
import { useApp } from '../context/AppContext';
import PlanCard from '../components/PlanCard';
import EmptyState from '../components/EmptyState';

export default function PlansListScreen({ navigation }) {
  const { getAllPlans } = usePlans();
  const { quotes } = useApp();

  const allPlans = getAllPlans();

  const renderItem = ({ item }) => {
    const stockName = quotes[item.code]?.name;
    return (
      <PlanCard
        plan={item}
        stockName={stockName}
        onPress={() => navigation.navigate('PlanDetail', { code: item.code, planId: item.id })}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>交易计划</Text>
        <Text style={styles.count}>{allPlans.length} 条计划</Text>
      </View>

      <FlatList
        data={allPlans}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<EmptyState icon="📋" title="暂无交易计划" subtitle="在股票详情页中编写你的交易计划" />}
        contentContainerStyle={allPlans.length === 0 ? styles.emptyContainer : styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#222',
  },
  count: {
    fontSize: 14,
    color: '#999',
  },
  list: {
    paddingTop: 4,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
  },
});
