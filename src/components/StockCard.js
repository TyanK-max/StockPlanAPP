import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatPrice, formatPercent, isUp, isDown } from '../utils/formatters';
import { fetchTrends } from '../api/eastmoney';

const MINI_W = 100;
const MINI_H = 38;
const MINI_PAD = 1;

function MiniChart({ data, color }) {
  const segs = useMemo(() => {
    if (!data || data.length < 2) return [];
    const closes = data.map((d) => d.price);
    let min = Infinity;
    let max = -Infinity;
    closes.forEach((v) => {
      if (v < min) min = v;
      if (v > max) max = v;
    });
    const range = max - min || 1;
    const padMin = min - range * 0.02;
    const padMax = max + range * 0.02;
    const priceRange = padMax - padMin;
    const w = MINI_W - MINI_PAD * 2;
    const h = MINI_H - MINI_PAD * 2;

    const result = [];
    for (let i = 0; i < closes.length - 1; i++) {
      const x1 = (i / (closes.length - 1)) * w + MINI_PAD;
      const y1 = h * (1 - (closes[i] - padMin) / priceRange) + MINI_PAD;
      const x2 = ((i + 1) / (closes.length - 1)) * w + MINI_PAD;
      const y2 = h * (1 - (closes[i + 1] - padMin) / priceRange) + MINI_PAD;
      result.push({ x1, y1, x2, y2 });
    }
    return result;
  }, [data]);

  return (
    <View style={styles.miniChart}>
      {segs.map((seg, i) => {
        const dx = seg.x2 - seg.x1;
        const dy = seg.y2 - seg.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const midX = (seg.x1 + seg.x2) / 2;
        const midY = (seg.y1 + seg.y2) / 2;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View
            key={i}
            style={[styles.miniSeg, {
              left: midX - length / 2,
              top: midY,
              width: length,
              backgroundColor: color,
              transform: [{ rotate: `${angle}deg` }],
            }]}
          />
        );
      })}
    </View>
  );
}

export default function StockCard({ code, quote, latestPlan, onPress, onLongPress }) {
  const [miniKline, setMiniKline] = useState([]);
  const name = quote ? quote.name : code;
  const price = quote ? formatPrice(quote.price) : '--';
  const changePercent = quote ? formatPercent(quote.changePercent) : '--';
  const change = quote ? formatPrice(quote.change) : '--';
  const color = quote && isUp(quote.changePercent) ? '#e53935' : quote && isDown(quote.changePercent) ? '#43a047' : '#666';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchTrends(code);
      if (!cancelled) setMiniKline(data);
    })();
    return () => { cancelled = true; };
  }, [code]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={[styles.name, { color }]} numberOfLines={1}>{name}</Text>
          <Text style={styles.code}>{code}</Text>
        </View>
        {miniKline.length > 0 && <MiniChart data={miniKline} color={color} />}
        <View style={styles.right}>
          <Text style={[styles.price, { color }]}>{price}</Text>
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={styles.badgeText}>{changePercent}</Text>
          </View>
          <Text style={[styles.change, { color }]}>{change}</Text>
        </View>
      </View>
      {latestPlan && (
        <View style={styles.planPreview}>
          <Text style={styles.planIcon}>📋</Text>
          <Text style={styles.planText} numberOfLines={1}>{latestPlan.text}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  code: {
    fontSize: 12,
    color: '#999',
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
  planPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#fff3e0',
    backgroundColor: '#fff8e1',
    marginHorizontal: -8,
    marginBottom: -6,
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderRadius: 8,
  },
  planIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  planText: {
    flex: 1,
    fontSize: 12,
    color: '#e65100',
    fontWeight: '600',
  },
  miniChart: {
    width: MINI_W,
    height: MINI_H,
    marginRight: 8,
  },
  miniSeg: {
    position: 'absolute',
    height: 1.5,
  },
});
