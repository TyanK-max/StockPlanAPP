import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { fetchSingleQuote, fetchKline } from '../api/eastmoney';
import { usePlans } from '../hooks/usePlans';
import { useApp } from '../context/AppContext';
import QuoteHeader from '../components/QuoteHeader';
import PlanEditor from '../components/PlanEditor';
import KLineChart from '../components/KLineChart';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/formatters';
import { POLL_INTERVAL } from '../utils/constants';

export default function StockDetailScreen({ route }) {
  const { code } = route.params;
  const { quotes } = useApp();
  const { getPlansForStock, addPlan } = usePlans();
  const [quote, setQuote] = useState(quotes[code] || null);
  const [klineData, setKlineData] = useState([]);
  const [chartActive, setChartActive] = useState(false);

  const stockPlans = getPlansForStock(code);

  useEffect(() => {
    let active = true;
    let timer;
    const fetchData = async () => {
      const data = await fetchSingleQuote(code);
      if (active && data) setQuote(data);
      if (active) timer = setTimeout(fetchData, POLL_INTERVAL);
    };
    fetchData();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [code]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const klines = await fetchKline(code, 60);
      if (!cancelled) setKlineData(klines);
    })();
    return () => { cancelled = true; };
  }, [code]);

  const handleSavePlan = (text) => {
    const plan = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addPlan(code, plan);
  };

  const displayQuote = quote || quotes[code] || null;

  return (
    <View style={styles.container}>
      <FlatList
        scrollEnabled={!chartActive}
        ListHeaderComponent={
          <>
            <QuoteHeader quote={displayQuote} />
            <KLineChart
              data={klineData}
              days={60}
              onChartTouchStart={() => setChartActive(true)}
              onChartTouchEnd={() => setChartActive(false)}
            />
            <PlanEditor onSave={handleSavePlan} />
            {stockPlans.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>历史计划</Text>
              </View>
            )}
          </>
        }
        data={stockPlans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.planItem}>
            <Text style={styles.planText}>{item.text}</Text>
            <Text style={styles.planDate}>{formatDate(item.createdAt)}</Text>
          </View>
        )}
        ListEmptyComponent={
          stockPlans.length === 0 ? (
            <EmptyState icon="📝" title="暂无交易计划" subtitle="点击上方按钮写下你的第一条交易计划" />
          ) : null
        }
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  content: {
    paddingBottom: 30,
  },
  sectionHeader: {
    marginHorizontal: 12,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  planItem: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 14,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  planText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  planDate: {
    fontSize: 12,
    color: '#bbb',
    marginTop: 8,
  },
});
