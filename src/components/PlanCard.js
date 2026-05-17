import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDate } from '../utils/formatters';

export default function PlanCard({ plan, stockName, onPress }) {
  const preview = plan.text.length > 80 ? plan.text.slice(0, 80) + '...' : plan.text;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.code}>{plan.code}</Text>
        {stockName && <Text style={styles.name}>{stockName}</Text>}
      </View>
      <Text style={styles.preview} numberOfLines={2}>{preview}</Text>
      <Text style={styles.date}>{formatDate(plan.createdAt)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  code: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2979ff',
  },
  name: {
    fontSize: 13,
    color: '#888',
    marginLeft: 8,
  },
  preview: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: '#bbb',
  },
});
