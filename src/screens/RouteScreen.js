import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, Modal, ScrollView, StatusBar,
} from 'react-native';
import { STATIONS, searchStations } from '../data/stations';
import { LINES, getFareByStations } from '../data/lines';
import { findRoute } from '../utils/routeFinder';

const stationMap = {};
STATIONS.forEach(s => { stationMap[s.id] = s; });

function StationPicker({ visible, onSelect, onClose, title }) {
  const [query, setQuery] = useState('');
  const results = query.length > 0 ? searchStations(query) : STATIONS.slice(0, 30);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerModal}>
          <Text style={styles.pickerTitle}>{title}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search station..."
            placeholderTextColor="#607D8B"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          <FlatList
            data={results}
            keyExtractor={item => item.id}
            style={styles.pickerList}
            renderItem={({ item }) => {
              const line = LINES[item.line];
              return (
                <TouchableOpacity style={styles.pickerItem} onPress={() => { onSelect(item); setQuery(''); }}>
                  <View style={[styles.pickerDot, { backgroundColor: line?.color || '#888' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickerItemText}>{item.name}</Text>
                    <Text style={styles.pickerItemSub}>{line?.name}</Text>
                  </View>
                  {item.interchange && <Text style={styles.interchangeTag}>⇄</Text>}
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity style={styles.pickerClose} onPress={onClose}>
            <Text style={styles.pickerCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function RouteScreen({ route }) {
  const params = route?.params || {};
  const [fromStation, setFromStation] = useState(params.fromStation || null);
  const [toStation, setToStation] = useState(params.toStation || null);
  const [routeResult, setRouteResult] = useState(null);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const [searched, setSearched] = useState(false);

  const findRouteNow = () => {
    if (!fromStation || !toStation) return;
    const path = findRoute(fromStation.id, toStation.id);
    setRouteResult(path);
    setSearched(true);
  };

  const swap = () => {
    const tmp = fromStation;
    setFromStation(toStation);
    setToStation(tmp);
    setRouteResult(null);
    setSearched(false);
  };

  const getInterchanges = (path) => {
    if (!path) return [];
    const interchanges = [];
    let currentLine = null;
    path.forEach((step, i) => {
      if (step.line && step.line !== currentLine) {
        if (currentLine !== null) interchanges.push(stationMap[step.id]?.name);
        currentLine = step.line;
      }
    });
    return interchanges.filter(Boolean);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 Route Planner</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* FROM */}
        <Text style={styles.label}>FROM</Text>
        <TouchableOpacity style={styles.stationSelector} onPress={() => setShowFrom(true)}>
          {fromStation ? (
            <View style={styles.selectedStation}>
              <View style={[styles.dot, { backgroundColor: LINES[fromStation.line]?.color }]} />
              <View>
                <Text style={styles.selectedName}>{fromStation.name}</Text>
                <Text style={styles.selectedLine}>{LINES[fromStation.line]?.name}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.selectorPlaceholder}>Tap to select station</Text>
          )}
        </TouchableOpacity>

        {/* Swap Button */}
        <TouchableOpacity style={styles.swapBtn} onPress={swap}>
          <Text style={styles.swapText}>⇅ Swap</Text>
        </TouchableOpacity>

        {/* TO */}
        <Text style={styles.label}>TO</Text>
        <TouchableOpacity style={styles.stationSelector} onPress={() => setShowTo(true)}>
          {toStation ? (
            <View style={styles.selectedStation}>
              <View style={[styles.dot, { backgroundColor: LINES[toStation.line]?.color }]} />
              <View>
                <Text style={styles.selectedName}>{toStation.name}</Text>
                <Text style={styles.selectedLine}>{LINES[toStation.line]?.name}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.selectorPlaceholder}>Tap to select station</Text>
          )}
        </TouchableOpacity>

        {/* Find Route Button */}
        <TouchableOpacity
          style={[styles.findBtn, (!fromStation || !toStation) && styles.findBtnDisabled]}
          onPress={findRouteNow}
          disabled={!fromStation || !toStation}
        >
          <Text style={styles.findBtnText}>FIND ROUTE 🔍</Text>
        </TouchableOpacity>

        {/* Route Result */}
        {searched && routeResult === null && (
          <View style={styles.noRoute}>
            <Text style={styles.noRouteText}>No route found between these stations.</Text>
          </View>
        )}

        {routeResult && routeResult.length > 0 && (() => {
          const stationCount = routeResult.length;
          const fare = getFareByStations(stationCount);
          const interchanges = getInterchanges(routeResult);
          const time = Math.round(stationCount * 2.5);

          return (
            <View style={styles.resultContainer}>
              {/* Summary */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNum}>{stationCount}</Text>
                  <Text style={styles.summaryLabel}>Stations</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNum}>₹{fare}</Text>
                  <Text style={styles.summaryLabel}>Fare</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNum}>{time}m</Text>
                  <Text style={styles.summaryLabel}>~Time</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNum}>{interchanges.length}</Text>
                  <Text style={styles.summaryLabel}>Changes</Text>
                </View>
              </View>

              {interchanges.length > 0 && (
                <View style={styles.interchangeInfo}>
                  <Text style={styles.interchangeTitle}>⇄ Change at:</Text>
                  {interchanges.map((s, i) => (
                    <Text key={i} style={styles.interchangeStation}>• {s}</Text>
                  ))}
                </View>
              )}

              {/* Step by step */}
              <Text style={styles.stepTitle}>Route Details</Text>
              {routeResult.map((step, index) => {
                const s = stationMap[step.id];
                if (!s) return null;
                const line = LINES[s.line];
                const isFirst = index === 0;
                const isLast = index === routeResult.length - 1;
                return (
                  <View key={step.id} style={styles.stepRow}>
                    <View style={styles.stepLeft}>
                      <View style={[styles.stepDot, {
                        backgroundColor: isFirst || isLast ? '#FFFFFF' : (line?.color || '#888'),
                        borderColor: line?.color || '#888',
                        width: isFirst || isLast ? 14 : 10,
                        height: isFirst || isLast ? 14 : 10,
                        borderRadius: isFirst || isLast ? 7 : 5,
                      }]} />
                      {!isLast && (
                        <View style={[styles.stepLine, { backgroundColor: line?.color || '#888' }]} />
                      )}
                    </View>
                    <View style={styles.stepRight}>
                      <Text style={[styles.stepName, (isFirst || isLast) && styles.stepNameBold]}>
                        {s.name}
                      </Text>
                      {(isFirst || isLast || s.interchange) && (
                        <Text style={[styles.stepLineName, { color: line?.color || '#888' }]}>
                          {line?.name}{s.interchange ? ' ⇄' : ''}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })()}
      </ScrollView>

      <StationPicker
        visible={showFrom}
        title="Select FROM Station"
        onSelect={s => { setFromStation(s); setShowFrom(false); setRouteResult(null); setSearched(false); }}
        onClose={() => setShowFrom(false)}
      />
      <StationPicker
        visible={showTo}
        title="Select TO Station"
        onSelect={s => { setToStation(s); setShowTo(false); setRouteResult(null); setSearched(false); }}
        onClose={() => setShowTo(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#0A1628' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 16 },
  label: { color: '#90CAF9', fontSize: 12, fontWeight: '600', marginTop: 16, marginBottom: 6, letterSpacing: 1 },
  stationSelector: {
    backgroundColor: '#1A2B3C', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#1E3A5F', minHeight: 56, justifyContent: 'center',
  },
  selectedStation: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 12 },
  selectedName: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  selectedLine: { color: '#90CAF9', fontSize: 12, marginTop: 2 },
  selectorPlaceholder: { color: '#607D8B', fontSize: 15 },
  swapBtn: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 4, paddingHorizontal: 12, paddingVertical: 6 },
  swapText: { color: '#FFD700', fontSize: 14, fontWeight: 'bold' },
  findBtn: {
    backgroundColor: '#1565C0', borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginTop: 20, marginBottom: 8,
  },
  findBtnDisabled: { backgroundColor: '#1E2D3D' },
  findBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  noRoute: { alignItems: 'center', padding: 20 },
  noRouteText: { color: '#EF5350', fontSize: 15 },
  resultContainer: { marginTop: 16 },
  summaryRow: {
    flexDirection: 'row', backgroundColor: '#1A2B3C', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 8, marginBottom: 12,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: 20, fontWeight: 'bold', color: '#FFD700' },
  summaryLabel: { fontSize: 11, color: '#90CAF9', marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },
  interchangeInfo: {
    backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: 10, padding: 12, marginBottom: 12,
    borderLeftWidth: 3, borderLeftColor: '#FFD700',
  },
  interchangeTitle: { color: '#FFD700', fontWeight: 'bold', marginBottom: 6 },
  interchangeStation: { color: '#FFF9C4', fontSize: 13, marginLeft: 8, marginTop: 2 },
  stepTitle: { color: '#90CAF9', fontWeight: '600', marginBottom: 8, fontSize: 13, letterSpacing: 1 },
  stepRow: { flexDirection: 'row', minHeight: 36 },
  stepLeft: { width: 28, alignItems: 'center' },
  stepDot: { borderWidth: 2, marginTop: 4 },
  stepLine: { width: 2, flex: 1, marginTop: 2 },
  stepRight: { flex: 1, paddingBottom: 6, paddingLeft: 8 },
  stepName: { color: '#CCCCCC', fontSize: 14 },
  stepNameBold: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  stepLineName: { fontSize: 11, marginTop: 1 },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  pickerModal: { backgroundColor: '#1A2B3C', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', padding: 16 },
  pickerTitle: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 17, marginBottom: 12 },
  searchInput: {
    backgroundColor: '#0D1B2A', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    color: '#FFFFFF', fontSize: 15, marginBottom: 8,
  },
  pickerList: { maxHeight: 400 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#0D1B2A' },
  pickerDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  pickerItemText: { color: '#FFFFFF', fontSize: 15 },
  pickerItemSub: { color: '#607D8B', fontSize: 11, marginTop: 1 },
  interchangeTag: { color: '#FFD700', fontWeight: 'bold', fontSize: 16 },
  pickerClose: { backgroundColor: '#0D1B2A', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  pickerCloseText: { color: '#90CAF9', fontWeight: 'bold', fontSize: 15 },
});
