import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

const CHART_HEIGHT = 220;
const CHART_PADDING_TOP = 10;
const CHART_PADDING_BOTTOM = 30;
const CHART_PADDING_RIGHT = 50;
const CANDLE_BODY_MIN = 1;

export default function KLineChart({ data, days = 60 }) {
  const klines = useMemo(() => {
    if (!data || !data.length) return [];
    return data.slice(-days);
  }, [data, days]);

  const { candles, minPrice, maxPrice, priceRange } = useMemo(() => {
    if (!klines.length) return { candles: [], minPrice: 0, maxPrice: 0, priceRange: 0 };

    let min = Infinity;
    let max = -Infinity;
    const items = klines.map((k, i) => {
      if (k.low < min) min = k.low;
      if (k.high > max) max = k.high;
      return { ...k, index: i };
    });

    const range = max - min || 1;
    const paddedMin = min - range * 0.05;
    const paddedMax = max + range * 0.05;

    return { candles: items, minPrice: paddedMin, maxPrice: paddedMax, priceRange: paddedMax - paddedMin };
  }, [klines]);

  if (!klines.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>暂无K线数据</Text>
      </View>
    );
  }

  const candleCount = candles.length;
  const plotHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
  const candleWidth = Math.max(4, Math.floor((300 - CHART_PADDING_RIGHT) / candleCount - 1));
  const totalWidth = candleCount * (candleWidth + 1) + CHART_PADDING_RIGHT;
  const svgWidth = Math.max(totalWidth, 300);

  const scaleY = (price) =>
    CHART_PADDING_TOP + plotHeight * (1 - (price - minPrice) / priceRange);

  const formatPriceLabel = (price) => {
    if (price >= 100) return price.toFixed(0);
    if (price >= 1) return price.toFixed(1);
    return price.toFixed(2);
  };

  const gridLines = useMemo(() => {
    const lines = [];
    const count = 4;
    for (let i = 0; i <= count; i++) {
      const price = minPrice + (priceRange / count) * i;
      lines.push(price);
    }
    return lines;
  }, [minPrice, priceRange]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>日K线</Text>
      <View style={styles.chartWrapper}>
        <Svg width={svgWidth} height={CHART_HEIGHT}>
          {gridLines.map((price, i) => {
            const y = scaleY(price);
            return (
              <React.Fragment key={`grid-${i}`}>
                <Line x1={0} y1={y} x2={svgWidth - CHART_PADDING_RIGHT + 10} y2={y} stroke="#f0f0f0" strokeWidth={1} />
                <SvgText x={svgWidth - CHART_PADDING_RIGHT + 14} y={y + 4} fontSize={10} fill="#999" textAnchor="start">
                  {formatPriceLabel(price)}
                </SvgText>
              </React.Fragment>
            );
          })}
          {candles.map((k, i) => {
            const x = i * (candleWidth + 1) + candleWidth / 2;
            const highY = scaleY(k.high);
            const lowY = scaleY(k.low);
            const openY = scaleY(k.open);
            const closeY = scaleY(k.close);
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), CANDLE_BODY_MIN);
            const color = k.close >= k.open ? '#e53935' : '#43a047';

            return (
              <React.Fragment key={`candle-${k.date}-${i}`}>
                <Line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth={1} />
                <Rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                />
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
      <View style={styles.labels}>
        {klines.length > 0 && (
          <>
            <Text style={styles.labelText}>{klines[0].date}</Text>
            <Text style={styles.labelText}>{klines[Math.floor(klines.length / 2)].date}</Text>
            <Text style={styles.labelText}>{klines[klines.length - 1].date}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  chartWrapper: {
    overflow: 'hidden',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  labelText: {
    fontSize: 10,
    color: '#bbb',
  },
});
