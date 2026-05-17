import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatPrice, formatPercent, formatVolume, formatAmount, isUp, isDown } from '../utils/formatters';

export default function QuoteHeader({ quote }) {
  if (!quote) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading quote...</Text>
      </View>
    );
  }

  const color = isUp(quote.changePercent) ? '#e53935' : isDown(quote.changePercent) ? '#43a047' : '#666';

  return (
    <View style={styles.container}>
      <View style={styles.nameRow}>
        <Text style={styles.name}>{quote.name || '--'}</Text>
        <Text style={styles.code}>{quote.code}</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={[styles.price, { color }]}>{formatPrice(quote.price)}</Text>
        <View style={[styles.changeBadge, { backgroundColor: color }]}>
          <Text style={styles.changeText}>{formatPercent(quote.changePercent)}</Text>
        </View>
      </View>
      <Text style={[styles.change, { color }]}>{formatPrice(quote.change)}</Text>

      <View style={styles.metrics}>
        <View style={styles.metricRow}>
          <MetricItem label="今开" value={formatPrice(quote.open)} />
          <MetricItem label="昨收" value={formatPrice(quote.prevClose)} />
          <MetricItem label="最高" value={formatPrice(quote.high)} color="#e53935" />
          <MetricItem label="最低" value={formatPrice(quote.low)} color="#43a047" />
        </View>
        <View style={styles.metricRow}>
          <MetricItem label="成交量" value={formatVolume(quote.volume)} />
          <MetricItem label="成交额" value={formatAmount(quote.amount)} />
          <MetricItem label="市盈率" value={quote.pe != null ? quote.pe.toFixed(2) : '--'} />
          <MetricItem label="市净率" value={quote.pb != null ? quote.pb.toFixed(2) : '--'} />
        </View>
      </View>
    </View>
  );
}

function MetricItem({ label, value, color }) {
  return (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  loading: {
    textAlign: 'center',
    color: '#999',
    fontSize: 15,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  code: {
    fontSize: 13,
    color: '#999',
    marginLeft: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
  },
  changeBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 12,
  },
  changeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  change: {
    fontSize: 14,
    marginBottom: 16,
  },
  metrics: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
