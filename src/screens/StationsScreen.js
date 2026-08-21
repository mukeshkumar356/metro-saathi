import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, StatusBar, ScrollView,
} from 'react-native';
import { STATIONS } from '../data/stations';
import { LINES, LINE_ORDER } from '../data/lines';

export default function StationsScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [activeLine, setActiveLine] = useState('all');

  const filtered = useMemo(() => {
    let list = STATIONS;
    if (activeLine !== 'all') list = list.filter(s => s.line === activeLine);
    if (query) list = list.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [query, activeLine]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 All Stations</Text>
        <Text style={styles.headerCount}>{filtered.length} stations</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍  Search station name..."
          placeholderTextColor="#607D8B"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Line Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.filterChip, activeLine === 'all' && styles.filterChipActive]}
          onPress={() => setActiveLine('all')}
        >
          <Text style={[styles.filterChipText, activeLine === 'all' && styles.filterChipTextActive]}>
            All Lines
          </Text>
        </TouchableOpacity>
        {LINE_ORDER.map(lineKey => {
          const line = LINES[lineKey];
          const isActive = activeLine === lineKey;
          return (
            <TouchableOpacity
              key={lineKey}
              style={[styles.filterChip, isActive && { backgroundColor: line.color }]}
              onPress={() => setActiveLine(lineKey)}
            >
              <Text style={[styles.filterChipText, isActive && { color: line.textColor }]}>
                {line.name.replace(' Line', '').replace('Airport Express', 'Airport')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Station List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const line = LINES[item.line];
          return (
            <TouchableOpacity
              style={styles.stationItem}
              onPress={() => navigation.navigate('Route', { fromStation: item })}
            >
              <View style={[styles.lineIndicator, { backgroundColor: line?.color || '#888' }]} />
              <View style={styles.stationInfo}>
                <Text style={styles.stationName}>{item.name}</Text>
                <View style={styles.stationTags}>
                  <Text style={[styles.tag, { color: line?.color || '#888' }]}>{line?.name}</Text>
                  <Text style={styles.tagDot}>·</Text>
                  <Text style={styles.tagMeta}>{item.underground ? 'Underground' : 'Elevated'}</Text>
                  {item.interchange && (
                    <>
                      <Text style={styles.tagDot}>·</Text>
                      <Text style={styles.tagInterchange}>⇄ Interchange</Text>
                    </>
                  )}
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No stations found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  headerCount: { color: '#607D8B', fontSize: 13 },
  searchContainer: { paddingHorizontal: 16, marginBottom: 8 },
  searchInput: {
    backgroundColor: '#1A2B3C', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10,
    color: '#FFFFFF', fontSize: 15,
  },
  filterScroll: { paddingHorizontal: 12, marginBottom: 8, maxHeight: 42 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
    backgroundColor: '#1A2B3C', marginHorizontal: 3,
  },
  filterChipActive: { backgroundColor: '#FFD700' },
  filterChipText: { color: '#90CAF9', fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#000' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  stationItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2B3C',
    borderRadius: 12, marginBottom: 8, overflow: 'hidden',
  },
  lineIndicator: { width: 5, alignSelf: 'stretch' },
  stationInfo: { flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  stationName: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  stationTags: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
  tag: { fontSize: 12, fontWeight: '500' },
  tagDot: { color: '#607D8B', marginHorizontal: 4, fontSize: 12 },
  tagMeta: { color: '#607D8B', fontSize: 12 },
  tagInterchange: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },
  arrow: { color: '#607D8B', fontSize: 22, paddingRight: 14 },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: '#607D8B', fontSize: 16 },
});
