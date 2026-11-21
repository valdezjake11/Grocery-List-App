import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, FlatList, KeyboardAvoidingView, Platform, SafeAreaView,
  StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@smart_grocery_list/items";
const CATEGORIES = ["Produce", "Dairy", "Bakery", "Meat", "Pantry", "Drinks", "Other"];
const COLORS = {
  bg: "#F5F7F2", card: "#FFFFFF", green: "#287A4B", dark: "#183326",
  muted: "#718078", line: "#E4EAE4", pale: "#E8F3EA", red: "#C64B4B"
};

function isValidItem(item) {
  return item && typeof item.id === "string" &&
    typeof item.name === "string" && item.name.trim().length > 0 &&
    Number.isInteger(item.quantity) && item.quantity > 0 &&
    CATEGORIES.includes(item.category) && typeof item.done === "boolean";
}

export default function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState("Produce");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadItems() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (!Array.isArray(parsed)) throw new Error("Invalid saved list");
          if (active) setItems(parsed.filter(isValidItem));
        }
      } catch (error) {
        if (active) {
          setStorageError("Saved items could not be loaded. You can still create a new list.");
        }
      } finally {
        if (active) setReady(true);
      }
    }

    loadItems();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      .then(() => setStorageError(""))
      .catch(() => setStorageError("Your changes could not be saved. Check your device storage and try again."));
  }, [items, ready]);

  const completed = items.filter(item => item.done).length;
  const visibleItems = useMemo(() => items.filter(item => {
    const term = search.trim().toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(term);
    const matchesCategory = filter === "All" || item.category === filter;
    return matchesSearch && matchesCategory;
  }), [items, search, filter]);

  function resetForm() {
    setName("");
    setQuantity("1");
    setCategory("Produce");
    setEditingId(null);
  }

  function saveItem() {
    const cleanName = name.trim();
    const amount = Number(quantity);

    if (!cleanName) {
      Alert.alert("Item name required", "Please enter a grocery item.");
      return;
    }
    if (!Number.isInteger(amount) || amount < 1) {
      Alert.alert("Invalid quantity", "Enter a whole number greater than zero.");
      return;
    }

    if (editingId) {
      setItems(current => current.map(item => item.id === editingId
        ? { ...item, name: cleanName, quantity: amount, category } : item));
    } else {
      setItems(current => [{
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: cleanName, quantity: amount, category, done: false
      }, ...current]);
    }
    resetForm();
  }

  function editItem(item) {
    setName(item.name);
    setQuantity(String(item.quantity));
    setCategory(item.category);
    setEditingId(item.id);
  }

  function deleteItem(id) {
    Alert.alert("Delete item?", "This item will be removed from your list.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setItems(current => current.filter(item => item.id !== id));
          if (editingId === id) resetForm();
        }
      }
    ]);
  }

  function clearCompleted() {
    if (!completed) return;
    Alert.alert("Clear completed?", `Remove ${completed} completed item(s)?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => setItems(current => current.filter(item => !item.done)) }
    ]);
  }

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <TouchableOpacity
        style={[styles.check, item.done && styles.checked]}
        accessibilityRole="checkbox"
        accessibilityLabel={`Mark ${item.name} as ${item.done ? "not purchased" : "purchased"}`}
        accessibilityState={{ checked: item.done }}
        onPress={() => setItems(current => current.map(entry =>
          entry.id === item.id ? { ...entry, done: !entry.done } : entry
        ))}
      >
        {item.done ? <Text style={styles.checkMark}>✓</Text> : null}
      </TouchableOpacity>
      <View style={styles.itemText}>
        <Text style={[styles.itemName, item.done && styles.doneText]}>{item.name}</Text>
        <Text style={styles.itemMeta}>{item.category}  ·  Qty: {item.quantity}</Text>
      </View>
      <TouchableOpacity
        onPress={() => editItem(item)}
        style={styles.smallAction}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${item.name}`}
      >
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => deleteItem(item.id)}
        style={styles.smallAction}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${item.name}`}
      >
        <Text style={styles.deleteText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}><Text style={styles.subtitle}>Loading your grocery list…</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          data={visibleItems}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View>
              <View style={styles.header}>
                <View>
                  <Text style={styles.eyebrow}>PLAN • SHOP • ENJOY</Text>
                  <Text style={styles.title}>My Grocery List</Text>
                  <Text style={styles.subtitle}>Keep your shopping simple and organized.</Text>
                </View>
                <Text style={styles.basket}>🛒</Text>
              </View>
              {storageError ? <Text style={styles.errorMessage}>{storageError}</Text> : null}
              <View style={styles.stats}>
                <View><Text style={styles.statNumber}>{items.length}</Text><Text style={styles.statLabel}>TOTAL ITEMS</Text></View>
                <View style={styles.statDivider} />
                <View><Text style={styles.statNumber}>{completed}</Text><Text style={styles.statLabel}>COMPLETED</Text></View>
                <View style={styles.progressWrap}>
                  <Text style={styles.progressLabel}>{items.length ? Math.round(completed / items.length * 100) : 0}%</Text>
                  <Text style={styles.statLabel}>DONE</Text>
                </View>
              </View>
              <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>{editingId ? "Edit grocery item" : "Add a grocery item"}</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Fresh apples"
                  placeholderTextColor="#9AA69E"
                  style={styles.input}
                  returnKeyType="done"
                  onSubmitEditing={saveItem}
                  accessibilityLabel="Grocery item name"
                  maxLength={70}
                />
                <View style={styles.formRow}>
                  <TextInput
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="number-pad"
                    placeholder="Qty"
                    style={[styles.input, styles.qtyInput]}
                    accessibilityLabel="Item quantity"
                  />
                  <View style={styles.categoryHint}><Text style={styles.categoryHintText}>{category}</Text></View>
                </View>
                <Text style={styles.fieldLabel}>CATEGORY</Text>
                <View style={styles.chips}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[styles.chip, category === cat && styles.chipActive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: category === cat }}
                      accessibilityLabel={`${cat} category`}
                    >
                      <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.formActions}>
                  {editingId ? (
                    <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity style={styles.addButton} onPress={saveItem} accessibilityRole="button">
                    <Text style={styles.addButtonText}>{editingId ? "Save changes" : "+ Add item"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.listHeader}>
                <Text style={styles.sectionTitle}>Shopping list</Text>
                <TouchableOpacity onPress={clearCompleted} accessibilityRole="button">
                  <Text style={styles.clearText}>Clear completed</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search groceries..."
                placeholderTextColor="#9AA69E"
                style={styles.search}
                accessibilityLabel="Search grocery items"
              />
              <FlatList
                horizontal
                data={["All", ...CATEGORIES]}
                keyExtractor={item => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                renderItem={({ item: cat }) => (
                  <TouchableOpacity
                    onPress={() => setFilter(cat)}
                    style={[styles.filterChip, filter === cat && styles.filterActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: filter === cat }}
                  >
                    <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🥬</Text>
              <Text style={styles.emptyTitle}>Your list is empty</Text>
              <Text style={styles.emptyText}>Add your first grocery item above to get started.</Text>
            </View>
          }
          ListFooterComponent={<Text style={styles.footer}>SMART GROCERY LIST  •  JAKE VALDEZ</Text>}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, paddingBottom: 36 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, marginBottom: 22 },
  eyebrow: { color: COLORS.green, fontSize: 10, fontWeight: "800", letterSpacing: 2, marginBottom: 7 },
  title: { color: COLORS.dark, fontSize: 29, fontWeight: "800" },
  subtitle: { color: COLORS.muted, fontSize: 13, marginTop: 5 },
  basket: { fontSize: 34, backgroundColor: COLORS.pale, padding: 13, borderRadius: 18 },
  errorMessage: { color: COLORS.red, backgroundColor: "#FCEDEC", padding: 11, borderRadius: 10, marginBottom: 14, fontSize: 12 },
  stats: { backgroundColor: COLORS.dark, borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  statNumber: { color: "#FFFFFF", fontSize: 25, fontWeight: "800" },
  statLabel: { color: "#B7C9BD", fontSize: 9, fontWeight: "700", letterSpacing: 1, marginTop: 3 },
  statDivider: { height: 34, width: 1, backgroundColor: "#456153" },
  progressWrap: { alignItems: "flex-end" },
  progressLabel: { color: "#A7E0B5", fontSize: 21, fontWeight: "800" },
  formCard: { backgroundColor: COLORS.card, padding: 17, borderRadius: 18, marginBottom: 23, borderWidth: 1, borderColor: COLORS.line },
  sectionTitle: { color: COLORS.dark, fontSize: 17, fontWeight: "800" },
  input: { backgroundColor: "#F7F9F6", borderWidth: 1, borderColor: COLORS.line, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 12, fontSize: 14, color: COLORS.dark, marginTop: 12 },
  formRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyInput: { width: 82 },
  categoryHint: { marginTop: 12, backgroundColor: COLORS.pale, paddingHorizontal: 13, paddingVertical: 12, borderRadius: 10 },
  categoryHintText: { color: COLORS.green, fontWeight: "700", fontSize: 12 },
  fieldLabel: { color: COLORS.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1, marginTop: 15, marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { borderRadius: 20, borderWidth: 1, borderColor: COLORS.line, paddingVertical: 7, paddingHorizontal: 10 },
  chipActive: { backgroundColor: COLORS.pale, borderColor: COLORS.green },
  chipText: { color: COLORS.muted, fontSize: 11, fontWeight: "600" },
  chipTextActive: { color: COLORS.green },
  formActions: { flexDirection: "row", justifyContent: "flex-end", gap: 9, marginTop: 16 },
  addButton: { backgroundColor: COLORS.green, borderRadius: 11, paddingVertical: 12, paddingHorizontal: 18 },
  addButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  cancelButton: { paddingHorizontal: 12, justifyContent: "center" },
  cancelText: { color: COLORS.muted, fontWeight: "700" },
  listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3 },
  clearText: { color: COLORS.red, fontSize: 11, fontWeight: "700" },
  search: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.line, borderRadius: 11, padding: 12, fontSize: 13, marginTop: 12 },
  filterRow: { gap: 7, paddingVertical: 12 },
  filterChip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, backgroundColor: "#E9EEE8" },
  filterActive: { backgroundColor: COLORS.dark },
  filterText: { color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  filterTextActive: { color: "#FFFFFF" },
  itemCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 13, marginBottom: 9, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: COLORS.line },
  check: { width: 23, height: 23, borderRadius: 8, borderWidth: 1.5, borderColor: "#B8C6BB", alignItems: "center", justifyContent: "center", marginRight: 11 },
  checked: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  checkMark: { color: "#FFFFFF", fontWeight: "900" },
  itemText: { flex: 1 },
  itemName: { color: COLORS.dark, fontSize: 14, fontWeight: "700" },
  itemMeta: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  doneText: { textDecorationLine: "line-through", color: "#9AA69E" },
  smallAction: { paddingHorizontal: 7, paddingVertical: 5 },
  editText: { color: COLORS.green, fontSize: 11, fontWeight: "700" },
  deleteText: { color: COLORS.red, fontSize: 20, fontWeight: "500" },
  empty: { alignItems: "center", paddingVertical: 34 },
  emptyIcon: { fontSize: 35 },
  emptyTitle: { color: COLORS.dark, fontWeight: "800", fontSize: 15, marginTop: 8 },
  emptyText: { color: COLORS.muted, fontSize: 12, marginTop: 5, textAlign: "center" },
  footer: { color: "#A0AAA3", textAlign: "center", fontSize: 9, letterSpacing: 1, marginTop: 25 }
});
