import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function PlanEditor({ onSave, initialText }) {
  const [text, setText] = useState(initialText || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setText('');
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <TouchableOpacity style={styles.startButton} onPress={() => setIsEditing(true)}>
        <Text style={styles.startButtonText}>+ 写交易计划</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        multiline
        placeholder="写下你的交易计划...&#10;例如：等待突破 12.80 买入，止损 12.20，目标 13.50"
        placeholderTextColor="#bbb"
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
        autoFocus
      />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => { setText(''); setIsEditing(false); }}>
          <Text style={styles.cancelText}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveBtn, !text.trim() && styles.saveBtnDisabled]} onPress={handleSave} disabled={!text.trim()}>
          <Text style={styles.saveText}>保存计划</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  startButton: {
    backgroundColor: '#2979ff',
    marginHorizontal: 12,
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  input: {
    minHeight: 120,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  actions: {
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
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
