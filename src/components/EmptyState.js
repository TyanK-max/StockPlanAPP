import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EmptyState({ icon, title, subtitle }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon || '📋'}</Text>
      <Text style={styles.title}>{title || 'No data'}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
