import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { usePlans } from '../hooks/usePlans';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/formatters';

export default function PlanDetailScreen({ route, navigation }) {
  const { code, planId } = route.params;
  const { plans, updatePlan, deletePlan } = usePlans();
  const { quotes } = useApp();

  const stockPlans = plans[code] || [];
  const plan = stockPlans.find((p) => p.id === planId);
  const stockName = quotes[code]?.name;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(plan?.text || '');

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>计划未找到</Text>
      </View>
    );
  }

  const handleUpdate = () => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    updatePlan(code, planId, trimmed);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert('删除计划', '确认删除这条交易计划？不可恢复。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          deletePlan(code, planId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.meta}>
        <Text style={styles.code}>{code}</Text>
        {stockName && <Text style={styles.name}>{stockName}</Text>}
        <Text style={styles.date}>{formatDate(plan.createdAt)}</Text>
        {plan.updatedAt !== plan.createdAt && (
          <Text style={styles.edited}>已编辑 · {formatDate(plan.updatedAt)}</Text>
        )}
      </View>

      {isEditing ? (
        <View style={styles.editArea}>
          <TextInput
            style={styles.editInput}
            multiline
            value={editText}
            onChangeText={setEditText}
            textAlignVertical="top"
            autoFocus
          />
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditText(plan.text); setIsEditing(false); }}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
              <Text style={styles.saveText}>保存修改</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.planView}>
          <Text style={styles.planText}>{plan.text}</Text>
        </View>
      )}

      {!isEditing && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
            <Text style={styles.editBtnText}>编辑</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>删除</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  notFound: {
    textAlign: 'center',
    color: '#999',
    marginTop: 60,
    fontSize: 16,
  },
  meta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  code: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2979ff',
  },
  name: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  date: {
    fontSize: 13,
    color: '#bbb',
    marginTop: 8,
  },
  edited: {
    fontSize: 12,
    color: '#ff9800',
    marginTop: 2,
  },
  planView: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  planText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  editArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  editInput: {
    minHeight: 160,
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelText: {
    color: '#888',
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: '#2979ff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#2979ff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e53935',
  },
  deleteBtnText: {
    color: '#e53935',
    fontSize: 15,
    fontWeight: '600',
  },
});
