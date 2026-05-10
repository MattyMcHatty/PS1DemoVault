import React, { useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { DropdownOption } from '../types';
import { styles } from './Dropdown.styles';

type Props = {
  options: DropdownOption[];
  selected: string;
  onSelect: (v: string) => void;
  modalTitle: string;
};

export function Dropdown({ options, selected, onSelect, modalTitle }: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.value === selected) ?? options[0];

  return (
    <View style={styles.dropdown}>
      <Pressable style={styles.dropdownButton} onPress={() => setOpen(true)}>
        <Text style={styles.dropdownButtonText} numberOfLines={1}>
          {current.icon}{'  '}{current.label}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            {options.map(opt => {
              const active = opt.value === selected;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => { onSelect(opt.value); setOpen(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionIcon}>{opt.icon}</Text>
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {opt.label}
                  </Text>
                  {active && <Text style={styles.optionTick}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
