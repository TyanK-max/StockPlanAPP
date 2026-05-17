import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatPrice, formatPercent, isUp, isDown } from '../utils/formatters';

export default function StockCard({ code, quote, onPress, onLongPress }) {
  const name = quote ? quote.name : code;
  const price = quote ? formatPrice(quote.price) : '--';
  const changePercent = quote ? formatPercent(quote.changePercent) : '--';
  const change = quote ? formatPrice(quote.change) : '--';
  const color = quote && isUp(quote.changePercent) ? '#e53935' : quote && isDown(quote.changePercent) ? '#43a047' : '#666';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <Text style={styles.code}>{code}</Text>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.price, { color }]}>{price}</Text>
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{changePercent}</Text>
        </View>
        <Text style={[styles.change, { color }]}>{change}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  code: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  name: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  change: {
    fontSize: 12,
    marginTop: 2,
  },
});
