import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const CHART_HEIGHT = 200;
const VOL_HEIGHT = 60;
const CANDLE_WIDTH = 6;
const CANDLE_GAP = 3;
const CANDLE_SLOT = CANDLE_WIDTH + CANDLE_GAP;
const LONG_PRESS_MS = 250;
const CHART_PAD = 4;

export default function KLineChart({ data, days = 60, onChartTouchStart, onChartTouchEnd }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const scrollRef = useRef(null);
  const isActiveRef = useRef(false);
  const scrollOffsetRef = useRef(0);
  const longPressTimerRef = useRef(null);
  const scrollAtTouchRef = useRef(0);
  const dragStartRef = useRef({ x: 0, y: 0 });


  const klines = useMemo(() => {
    if (!data || !data.length) return [];
    return data.slice(-days);
  }, [data, days]);

  const chartData = useMemo(() => {
    if (!klines.length) return { items: [], minPrice: 0, maxPrice: 0, priceRange: 0, gridPrices: [], ma5: [], ma10: [], ma20: [], maSegments: [], volMax: 0, volBars: [] };
    let min = Infinity;
    let max = -Infinity;
    let volMax = 0;
    const mapped = klines.map((k) => {
      if (k.low < min) min = k.low;
      if (k.high > max) max = k.high;
      if (k.volume > volMax) volMax = k.volume;
      return k;
    });
    const range = max - min || 1;
    const paddedMin = min - range * 0.05;
    const paddedMax = max + range * 0.05;
    const priceRange = paddedMax - paddedMin;

    const gridPrices = [];
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
      gridPrices.push(paddedMin + (priceRange / gridCount) * i);
    }

    // 计算移动平均线
    const closes = mapped.map((k) => k.close);
    const calcMa = (period) => {
      const result = [];
      let sum = 0;
      for (let i = 0; i < mapped.length; i++) {
        sum += closes[i];
        if (i >= period) sum -= closes[i - period];
        if (i >= period - 1) {
          result.push(sum / period);
        } else {
          result.push(null);
        }
      }
      return result;
    };
    const ma5 = calcMa(5);
    const ma10 = calcMa(10);
    const ma20 = calcMa(20);

    // 预计算均线线段
    const toYLocal = (price) => CHART_HEIGHT * (1 - (price - paddedMin) / priceRange);
    const buildSegments = (data, color) => {
      const segs = [];
      for (let i = 0; i < data.length - 1; i++) {
        if (data[i] == null || data[i + 1] == null) continue;
        const x1 = i * CANDLE_SLOT + CHART_PAD + CANDLE_WIDTH / 2;
        const y1 = toYLocal(data[i]);
        const x2 = (i + 1) * CANDLE_SLOT + CHART_PAD + CANDLE_WIDTH / 2;
        const y2 = toYLocal(data[i + 1]);
        segs.push({ x1, y1, x2, y2, color });
      }
      return segs;
    };
    const maSegments = [
      ...buildSegments(ma5, '#f5a623'),
      ...buildSegments(ma10, '#2196f3'),
      ...buildSegments(ma20, '#9c27b0'),
    ];

    const volBars = mapped.map((k) => ({
      color: k.close >= k.open ? '#e53935' : '#43a047',
      height: volMax > 0 ? (k.volume / volMax) * VOL_HEIGHT : 0,
    }));

    return { items: mapped, minPrice: paddedMin, maxPrice: paddedMax, priceRange, gridPrices, ma5, ma10, ma20, maSegments, volMax, volBars };
  }, [klines]);

  const { items, minPrice, maxPrice, priceRange, gridPrices, ma5, ma10, ma20, maSegments, volMax, volBars } = chartData;
  const chartWidth = items.length * CANDLE_SLOT + CHART_PAD;

  const formatPrice = (p) => p.toFixed(2);

  const formatVolume = (vol) => {
    if (vol >= 100000000) return (vol / 100000000).toFixed(2) + '亿';
    if (vol >= 10000) return (vol / 10000).toFixed(0) + '万';
    return vol.toString();
  };

  const toY = (price) => CHART_HEIGHT * (1 - (price - minPrice) / priceRange);

  useEffect(() => {
    if (scrollRef.current && chartWidth > 0) {
      scrollRef.current.scrollToEnd({ animated: false });
    }
  }, [chartWidth]);

  const activate = useCallback((index) => {
    isActiveRef.current = true;
    setActiveIndex(index);
  }, []);

  const deactivate = useCallback(() => {
    isActiveRef.current = false;
    setActiveIndex(null);
  }, []);

  const candleFromX = useCallback(
    (locX) => {
      const touchX = locX + scrollOffsetRef.current - CHART_PAD;
      const idx = Math.round((touchX - CANDLE_WIDTH / 2) / CANDLE_SLOT);
      return Math.max(0, Math.min(items.length - 1, idx));
    },
    [items.length]
  );


  const handleContentTouchStart = useCallback(
    (e) => {
      if (isActiveRef.current) return;
      const locX = e.nativeEvent.locationX ?? 0;
      scrollAtTouchRef.current = scrollOffsetRef.current;
      longPressTimerRef.current = setTimeout(() => {
        const idx = candleFromX(locX);
        activate(idx);
        longPressTimerRef.current = null;
      }, LONG_PRESS_MS);
    },
    [candleFromX, activate]
  );

  const handleContentTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleScroll = useCallback((e) => {
    const offset = e.nativeEvent.contentOffset.x;
    scrollOffsetRef.current = offset;
    if (longPressTimerRef.current && Math.abs(offset - scrollAtTouchRef.current) > 3) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  if (!klines.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>暂无K线数据</Text>
      </View>
    );
  }

  const activeCandle = activeIndex != null ? items[activeIndex] : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>日K线</Text>

      {activeCandle && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipDate}>{activeCandle.date}</Text>
          <View style={styles.tooltipRow}>
            <TooltipItem label="开盘" value={formatPrice(activeCandle.open)} />
            <TooltipItem label="最高" value={formatPrice(activeCandle.high)} color="#e53935" />
            <TooltipItem label="最低" value={formatPrice(activeCandle.low)} color="#43a047" />
            <TooltipItem label="收盘" value={formatPrice(activeCandle.close)} />
            <TooltipItem
              label="涨幅"
              value={((activeCandle.close - activeCandle.open) / (activeCandle.open || 1) * 100).toFixed(2) + '%'}
              color={activeCandle.close >= activeCandle.open ? '#e53935' : '#43a047'}
            />
          </View>
          <View style={[styles.tooltipRow, { marginTop: 6 }]}>
            <TooltipItem label="MA5" value={ma5[activeIndex] != null ? formatPrice(ma5[activeIndex]) : '--'} color="#f5a623" />
            <TooltipItem label="MA10" value={ma10[activeIndex] != null ? formatPrice(ma10[activeIndex]) : '--'} color="#2196f3" />
            <TooltipItem label="MA20" value={ma20[activeIndex] != null ? formatPrice(ma20[activeIndex]) : '--'} color="#9c27b0" />
          </View>
          <View style={[styles.tooltipRow, { marginTop: 6 }]}>
            <TooltipItem label="成交量" value={formatVolume(activeCandle.volume)} color="#666" />
          </View>
        </View>
      )}

      <View style={styles.chartRow}>
        <View style={styles.priceAxis}>
          {gridPrices.map((price, i) => (
            <View key={i} style={[styles.priceLabel, { top: toY(price) - 7 }]}>
              <Text style={styles.priceText}>{formatPrice(price)}</Text>
            </View>
          ))}
        </View>
        <View
          style={styles.chartWrapper}
          onTouchStart={() => {
            onChartTouchStart && onChartTouchStart();
          }}
          onTouchEnd={() => {
            onChartTouchEnd && onChartTouchEnd();
          }}
          onTouchCancel={() => {
            onChartTouchEnd && onChartTouchEnd();
          }}
        >
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={activeIndex == null}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View
              style={[styles.chartArea, { width: chartWidth }]}
              onStartShouldSetResponder={() => false}
              onTouchStart={handleContentTouchStart}
              onTouchEnd={handleContentTouchEnd}
              onTouchCancel={handleContentTouchEnd}
            >
              {gridPrices.map((price, i) => (
                <View key={`grid-${i}`} style={[styles.gridLine, { top: toY(price) }]} />
              ))}

              {activeCandle && (
                <>
                  <View style={[styles.crosshairV, { left: activeIndex * CANDLE_SLOT + CHART_PAD + CANDLE_WIDTH / 2 }]} />
                  <View style={[styles.crosshairH, { top: toY(activeCandle.close) }]} />
                </>
              )}

              {items.map((k, i) => {
                const openY = toY(k.open);
                const closeY = toY(k.close);
                const highY = toY(k.high);
                const lowY = toY(k.low);
                const bodyTop = Math.min(openY, closeY);
                const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
                const color = k.close >= k.open ? '#e53935' : '#43a047';
                const centerX = i * CANDLE_SLOT + CHART_PAD;

                return (
                  <View key={`${k.date}-${i}`} style={[styles.candle, { left: centerX }]} pointerEvents="none">
                    <View style={[styles.wick, { top: highY, height: lowY - highY, backgroundColor: color }]} />
                    <View style={[styles.body, { top: bodyTop, height: bodyHeight, backgroundColor: color }]} />
                  </View>
                );
              })}

              {maSegments.map((seg, i) => {
                const dx = seg.x2 - seg.x1;
                const dy = seg.y2 - seg.y1;
                const length = Math.sqrt(dx * dx + dy * dy);
                const midX = (seg.x1 + seg.x2) / 2;
                const midY = (seg.y1 + seg.y2) / 2;
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                return (
                  <View
                    key={`ma-${i}`}
                    style={[styles.maLine, {
                      left: midX - length / 2,
                      top: midY,
                      width: length,
                      backgroundColor: seg.color,
                      transform: [{ rotate: `${angle}deg` }],
                    }]}
                  />
                );
              })}

              {/* K线图与成交量图分隔线 */}
              <View style={[styles.volDivider, { top: CHART_HEIGHT }]} />

              {/* 成交量柱 */}
              {items.map((k, i) => {
                const bar = volBars[i];
                const centerX = i * CANDLE_SLOT + CHART_PAD;
                return (
                  <View
                    key={`vol-${i}`}
                    style={[styles.volBar, {
                      left: centerX,
                      height: bar.height,
                      backgroundColor: bar.color,
                    }]}
                    pointerEvents="none"
                  />
                );
              })}

            </View>
          </ScrollView>
          {activeIndex != null && (
            <View
              style={styles.dragOverlay}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(e) => {
                dragStartRef.current = {
                  x: e.nativeEvent.locationX ?? 0,
                  y: e.nativeEvent.locationY ?? 0,
                };
              }}
              onResponderMove={(e) => {
                const locX = e.nativeEvent.locationX ?? 0;
                const idx = candleFromX(locX);
                setActiveIndex(idx);
              }}
              onResponderRelease={(e) => {
                const dx = Math.abs((e.nativeEvent.locationX ?? 0) - dragStartRef.current.x);
                const dy = Math.abs((e.nativeEvent.locationY ?? 0) - dragStartRef.current.y);
                if (dx < 8 && dy < 8) {
                  deactivate();
                }
              }}
            />
          )}
        </View>
      </View>

      <View style={styles.dateRow}>
        <Text style={styles.dateText}>{klines[0].date.slice(5)}</Text>
        <Text style={styles.dateText}>{klines[Math.floor(klines.length / 2)].date.slice(5)}</Text>
        <Text style={styles.dateText}>{klines[klines.length - 1].date.slice(5)}</Text>
      </View>
    </View>
  );
}

function TooltipItem({ label, value, color }) {
  return (
    <View style={styles.tooltipItem}>
      <Text style={styles.tooltipLabel}>{label}</Text>
      <Text style={[styles.tooltipValue, color && { color }]}>{value}</Text>
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
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  tooltip: {
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2979ff',
  },
  tooltipDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2979ff',
    marginBottom: 8,
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tooltipItem: {
    alignItems: 'center',
  },
  tooltipLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  tooltipValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  chartRow: {
    flexDirection: 'row',
  },
  priceAxis: {
    width: 44,
    height: CHART_HEIGHT,
  },
  priceLabel: {
    position: 'absolute',
    right: 2,
  },
  priceText: {
    fontSize: 9,
    color: '#999',
  },
  chartWrapper: {
    flex: 1,
    height: CHART_HEIGHT + VOL_HEIGHT,
  },
  chartArea: {
    height: CHART_HEIGHT + VOL_HEIGHT,
  },
  dragOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.001)',
    zIndex: 20,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#f0f0f0',
  },
  crosshairV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#2979ff',
    zIndex: 10,
  },
  crosshairH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#2979ff',
    zIndex: 10,
  },
  candle: {
    position: 'absolute',
    width: CANDLE_WIDTH,
    top: 0,
    bottom: 0,
    alignItems: 'center',
  },
  wick: {
    position: 'absolute',
    width: 1,
  },
  body: {
    position: 'absolute',
    width: CANDLE_WIDTH,
    borderRadius: 1,
  },
  maLine: {
    position: 'absolute',
    height: 1,
    pointerEvents: 'none',
  },
  volDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e0e0e0',
  },
  volBar: {
    position: 'absolute',
    bottom: 0,
    width: CANDLE_WIDTH,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingLeft: 44,
  },
  dateText: {
    fontSize: 10,
    color: '#bbb',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
});
