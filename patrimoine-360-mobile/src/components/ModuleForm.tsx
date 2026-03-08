import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList } from "react-native";
import { FormField, FormData } from "../types";
import { colors, radius, spacing } from "../lib/theme";

interface ModuleFormProps {
  fields: FormField[];
  formData: FormData;
  onChange: (id: string, value: string | number) => void;
}

function SelectPicker({ field, value, onChange }: { field: FormField; value: string; onChange: (v: string) => void }) {
  const [visible, setVisible] = useState(false);
  const selected = field.options?.find((o) => o.value === value);

  return (
    <View>
      <TouchableOpacity style={styles.input} onPress={() => setVisible(true)}>
        <Text style={selected ? styles.inputText : styles.placeholder}>
          {selected?.label || "Sélectionnez..."}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{field.label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.modalClose}>Fermer</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={field.options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionItem, item.value === value && styles.optionSelected]}
                  onPress={() => { onChange(item.value); setVisible(false); }}
                >
                  <Text style={[styles.optionText, item.value === value && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                  {item.value === value && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function ModuleForm({ fields, formData, onChange }: ModuleFormProps) {
  return (
    <View style={styles.container}>
      {fields.map((field) => (
        <View key={field.id} style={styles.fieldGroup}>
          <Text style={styles.label}>
            {field.label}
            {field.suffix ? <Text style={styles.suffix}> ({field.suffix})</Text> : null}
          </Text>
          {field.type === "select" ? (
            <SelectPicker
              field={field}
              value={String(formData[field.id] || "")}
              onChange={(v) => onChange(field.id, v)}
            />
          ) : (
            <TextInput
              style={[styles.input, field.type === "textarea" && styles.textarea]}
              placeholder={field.placeholder}
              placeholderTextColor={colors.textMuted}
              value={String(formData[field.id] ?? "")}
              onChangeText={(text) => {
                if (field.type === "number") {
                  onChange(field.id, text === "" ? "" : Number(text) || 0);
                } else {
                  onChange(field.id, text);
                }
              }}
              keyboardType={field.type === "number" ? "numeric" : "default"}
              multiline={field.type === "textarea"}
              numberOfLines={field.type === "textarea" ? 4 : 1}
              textAlignVertical={field.type === "textarea" ? "top" : "center"}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: "500", color: colors.textSecondary },
  suffix: { fontSize: 11, color: colors.textMuted },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: { fontSize: 15, color: colors.white },
  textarea: { minHeight: 100, textAlignVertical: "top" },
  placeholder: { fontSize: 15, color: colors.textMuted },
  chevron: { fontSize: 10, color: colors.textMuted },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "50%", paddingBottom: 30 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 16, fontWeight: "600", color: colors.white },
  modalClose: { fontSize: 14, color: colors.accent },
  optionItem: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  optionSelected: { backgroundColor: "rgba(99,102,241,0.1)" },
  optionText: { fontSize: 15, color: colors.text },
  optionTextSelected: { color: colors.accent, fontWeight: "600" },
  checkmark: { color: colors.accent, fontSize: 16 },
});
