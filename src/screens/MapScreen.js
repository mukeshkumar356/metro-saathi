import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, Modal, StatusBar, TextInput,
} from 'react-native';
import Svg, { Circle, Line, G, Text as SvgText, Rect } from 'react-native-svg';
import { STATIONS } from '../data/stations';
import { LINES, LINE_ORDER } from '../data/lines';

const { width, height } = Dimensions.get('window');

// Map Delhi coordinates to screen coordinates
const MAP_BOUNDS = {
  minLat: 28.35, maxLat: 28.75,
  minLng: 76.95, maxLng: 77.42,
};
const MAP_W = width * 2.2;
const MAP_H = height * 2.0;

const latToY = (lat) =>
  ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * MAP_H;
const lngToX = (lng) =>
  ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * MAP_W;

const stationMap = {};
STATIONS.forEach(s => { stationMap[s.id] = s; });

export default function MapScreen({ navigation }) {
  const [selectedStation, setSelectedStation] = useState(null);
  const [activeLines, setActiveLines] = useState(
    Object.fromEntries(LINE_ORDER.map(l => [l, true]))
  );
  const [filterVisible, setFilterVisible] = useState(false);

  const toggleLine = (line) => {
    setActiveLines(prev => ({ ...prev, [line]: !prev[line] }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚇 Delhi Metro Map</Text>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterVisible(true)}>
          <Text style={styles.filterBtnText}>Lines ☰</Text>
        </TouchableOpacity>
      </View>

      {/* Line Legend */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legend}>
        {LINE_ORDER.map(lineKey => {
          const line = LINES[lineKey];
          return (
            <TouchableOpacity
              key={lineKey}
              style={[
                styles.legendItem,
                { backgroundColor: activeLines[lineKey] ? line.color : '#333' },
              ]}
              onPress={() => toggleLine(lineKey)}
            >
              <Text style={[styles.legendText, { color: activeLines[lineKey] ? line.textColor : '#888' }]}>
                {line.name.replace(' Line', '').replace('Airport ', 'Air ')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Scrollable Map */}
      <ScrollView
        horizontal
        style={styles.mapContainer}
        contentContainerStyle={{ width: MAP_W, height: MAP_H }}
        showsHorizontalScrollIndicator={false}
      >
        <ScrollView
          style={{ width: MAP_W }}
          contentContainerStyle={{ width: MAP_W, height: MAP_H }}
          showsVerticalScrollIndicator={false}
        >
          <Svg width={MAP_W} height={MAP_H}>
            {/* Background */}
            <Rect width={MAP_W} height={MAP_H} fill="#0D1B2A" />

            {/* Grid lines (subtle) */}
            {[...Array(10)].map((_, i) => (
              <Line
                key={`h${i}`}
                x1={0} y1={(MAP_H / 10) * i}
                x2={MAP_W} y2={(MAP_H / 10) * i}
                stroke="#1a2a3a" strokeWidth={1}
              />
            ))}
            {[...Array(10)].map((_, i) => (
              <Line
                key={`v${i}`}
                x1={(MAP_W / 10) * i} y1={0}
                x2={(MAP_W / 10) * i} y2={MAP_H}
                stroke="#1a2a3a" strokeWidth={1}
              />
            ))}

            {/* Draw Lines */}
            {LINE_ORDER.map(lineKey => {
              if (!activeLines[lineKey]) return null;
              const line = LINES[lineKey];
              const segments = [];
              for (let i = 0; i < line.stations.length - 1; i++) {
                const s1 = stationMap[line.stations[i]];
                const s2 = stationMap[line.stations[i + 1]];
                if (!s1 || !s2) continue;
                segments.push(
                  <Line
                    key={`${lineKey}-${i}`}
                    x1={lngToX(s1.lng)} y1={latToY(s1.lat)}
                    x2={lngToX(s2.lng)} y2={latToY(s2.lat)}
                    stroke={line.color}
                    strokeWidth={5}
                    strokeLinecap="round"
                  />
                );
              }
              return <G key={lineKey}>{segments}</G>;
            })}

            {/* Draw Stations */}
            {STATIONS.map(station => {
              const line = LINES[station.line];
              if (!line || !activeLines[station.line]) return null;
              const x = lngToX(station.lng);
              const y = latToY(station.lat);
              const isInterchange = station.interchange;
              const r = isInterchange ? 10 : 6;

              return (
                <G key={station.id} onPress={() => setSelectedStation(station)}>
                  {isInterchange && (
                    <Circle cx={x} cy={y} r={r + 4} fill="rgba(255,255,255,0.15)" />
                  )}
                  <Circle
                    cx={x} cy={y} r={r}
                    fill={isInterchange ? '#FFFFFF' : line.color}
                    stroke={isInterchange ? line.color : '#FFFFFF'}
                    strokeWidth={isInterchange ? 3 : 1.5}
                  />
                  {isInterchange && (
                    <SvgText
                      x={x} y={y - r - 5}
                      fontSize={10} fill="#FFD700"
                      textAnchor="middle" fontWeight="bold"
                    >
                      ⇄
                    </SvgText>
                  )}
                </G>
              );
            })}
          </Svg>
        </ScrollView>
      </ScrollView>

      {/* Station Detail Modal */}
      {selectedStation && (
        <Modal transparent animationType="slide" visible={!!selectedStation}>
          <View style={styles.modalOverlay}>
            <View style={styles.stationCard}>
              <View style={[styles.stationColorBar, { backgroundColor: LINES[selectedStation.line]?.color }]} />
              <View style={styles.stationCardContent}>
                <Text style={styles.stationName}>{selectedStation.name}</Text>
                <View style={styles.stationInfo}>
                  <View style={[styles.lineBadge, { backgroundColor: LINES[selectedStation.line]?.color }]}>
                    <Text style={[styles.lineBadgeText, { color: LINES[selectedStation.line]?.textColor }]}>
                      {LINES[selectedStation.line]?.name}
                    </Text>
                  </View>
                  <Text style={styles.stationMeta}>
                    {selectedStation.underground ? '🚇 Underground' : '🌅 Elevated'}
                  </Text>
                  {selectedStation.interchange && (
                    <Text style={styles.interchangeBadge}>⇄ Interchange</Text>
                  )}
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.cardBtn, { backgroundColor: '#1565C0' }]}
                    onPress={() => {
                      setSelectedStation(null);
                      navigation.navigate('Route', { fromStation: selectedStation });
                    }}
                  >
                    <Text style={styles.cardBtnText}>Set as FROM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cardBtn, { backgroundColor: '#B71C1C' }]}
                    onPress={() => {
                      setSelectedStation(null);
                      navigation.navigate('Route', { toStation: selectedStation });
                    }}
                  >
                    <Text style={styles.cardBtnText}>Set as TO</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedStation(null)}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Filter Modal */}
      <Modal transparent animationType="fade" visible={filterVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <Text style={styles.filterTitle}>Filter Lines</Text>
            {LINE_ORDER.map(lineKey => {
              const line = LINES[lineKey];
              return (
                <TouchableOpacity
                  key={lineKey}
                  style={styles.filterRow}
                  onPress={() => toggleLine(lineKey)}
                >
                  <View style={[styles.filterDot, { backgroundColor: line.color }]} />
                  <Text style={styles.filterRowText}>{line.name}</Text>
                  <Text style={styles.filterCheck}>{activeLines[lineKey] ? '✓' : '○'}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.filterClose} onPress={() => setFilterVisible(false)}>
              <Text style={styles.filterCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#0A1628',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  filterBtn: {
    backgroundColor: '#1E3A5F', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  filterBtnText: { color: '#90CAF9', fontSize: 13 },
  legend: { maxHeight: 38, paddingHorizontal: 8, marginBottom: 4 },
  legendItem: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginHorizontal: 3,
  },
  legendText: { fontSize: 11, fontWeight: '600' },
  mapContainer: { flex: 1 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end',
  },
  stationCard: {
    backgroundColor: '#1A2B3C', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden',
  },
  stationColorBar: { height: 5 },
  stationCardContent: { padding: 20 },
  stationName: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 10 },
  stationInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  lineBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  lineBadgeText: { fontSize: 12, fontWeight: '600' },
  stationMeta: { color: '#90CAF9', fontSize: 13, alignSelf: 'center' },
  interchangeBadge: { color: '#FFD700', fontSize: 13, fontWeight: 'bold', alignSelf: 'center' },
  cardActions: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  cardBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  cardBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  closeBtn: { alignItems: 'center', paddingVertical: 8 },
  closeBtnText: { color: '#607D8B', fontSize: 14 },
  filterModal: {
    backgroundColor: '#1A2B3C', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20,
  },
  filterTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  filterDot: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
  filterRowText: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  filterCheck: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  filterClose: {
    backgroundColor: '#1565C0', paddingVertical: 12, borderRadius: 10,
    alignItems: 'center', marginTop: 12,
  },
  filterCloseText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});
