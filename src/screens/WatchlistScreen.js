import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { useWatchlist } from '../hooks/useWatchlist';
import { useQuotes } from '../hooks/useQuotes';
import StockCard from '../components/StockCard';
import EmptyState from '../components/EmptyState';

export default function WatchlistScreen({ navigation }) {
  const { watchlist, addStock, removeStock } = useWatchlist();
  const { quotes, refresh } = useQuotes();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputCode, setInputCode] = useState('');

  const handleAdd = useCallback(() => {
    const code = inputCode.trim();
    if (!code) return;
    if (!/^\d{6}$/.test(code)) {
      Alert.alert('格式错误', '请输入6位数字股票代码');
      return;
    }
    if (watchlist.includes(code)) {
      Alert.alert('已存在', '该股票已在自选列表中');
      return;
    }
    addStock(code);
    setInputCode('');
    setModalVisible(false);
  }, [inputCode, watchlist, addStock]);

  const handleRemove = useCallback(
    (code) => {
      Alert.alert('删除自选', `确认删除 ${code}？`, [
        { text: '取消', style: 'cancel' },
        { text: '删除', style: 'destructive', onPress: () => removeStock(code) },
      ]);
    },
    [removeStock]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <StockCard
        code={item}
        quote={quotes[item]}
        onPress={() => navigation.navigate('StockDetail', { code: item })}
        onLongPress={() => handleRemove(item)}
      />
    ),
    [quotes, navigation, handleRemove]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>自选</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ 添加</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={watchlist}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        ListEmptyComponent={<EmptyState icon="📈" title="暂无自选股" subtitle="点击右上角「+ 添加」添加股票代码" />}
        contentContainerStyle={watchlist.length === 0 ? styles.emptyContainer : styles.list}
        onRefresh={refresh}
        refreshing={false}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加自选股</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="输入6位股票代码，如 000001"
              placeholderTextColor="#bbb"
              value={inputCode}
              onChangeText={setInputCode}
              keyboardType="numeric"
              maxLength={6}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setInputCode(''); setModalVisible(false); }}>
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirm, !inputCode.trim() && styles.modalConfirmDisabled]} onPress={handleAdd} disabled={!inputCode.trim()}>
                <Text style={styles.modalConfirmText}>确认添加</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    backgroundColor: '#2979ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingTop: 4,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    fontSize: 18,
    color: '#333',
    letterSpacing: 2,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
  modalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalCancelText: {
    color: '#888',
    fontSize: 14,
  },
  modalConfirm: {
    backgroundColor: '#2979ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalConfirmDisabled: {
    opacity: 0.5,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
