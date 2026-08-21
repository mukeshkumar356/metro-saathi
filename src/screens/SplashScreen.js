import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Dimensions } from 'react-native';
import Svg, { Rect, Circle, Path, Line, G, Text as SvgText, Polygon } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const MetroTrainSVG = () => (
  <Svg width={width * 0.85} height={180} viewBox="0 0 340 180">
    {/* Track */}
    <Rect x="0" y="155" width="340" height="6" fill="#555" rx="3" />
    <Rect x="20" y="158" width="10" height="12" fill="#444" />
    <Rect x="60" y="158" width="10" height="12" fill="#444" />
    <Rect x="100" y="158" width="10" height="12" fill="#444" />
    <Rect x="140" y="158" width="10" height="12" fill="#444" />
    <Rect x="180" y="158" width="10" height="12" fill="#444" />
    <Rect x="220" y="158" width="10" height="12" fill="#444" />
    <Rect x="260" y="158" width="10" height="12" fill="#444" />
    <Rect x="300" y="158" width="10" height="12" fill="#444" />

    {/* Train Body - Car 1 */}
    <Rect x="10" y="60" width="150" height="90" fill="#1565C0" rx="8" />
    {/* Car 1 Front Slope */}
    <Path d="M10,60 Q10,40 30,40 L160,40 L160,60 Z" fill="#1976D2" />
    {/* Car 1 Windows */}
    <Rect x="20" y="75" width="35" height="25" fill="#B3E5FC" rx="4" />
    <Rect x="65" y="75" width="35" height="25" fill="#B3E5FC" rx="4" />
    <Rect x="110" y="75" width="35" height="25" fill="#B3E5FC" rx="4" />
    {/* Car 1 Door */}
    <Rect x="66" y="110" width="33" height="38" fill="#0D47A1" rx="3" />
    <Rect x="80" y="120" width="5" height="15" fill="#90CAF9" rx="2" />
    {/* Car 1 Wheels */}
    <Circle cx="40" cy="155" r="10" fill="#333" />
    <Circle cx="40" cy="155" r="5" fill="#666" />
    <Circle cx="130" cy="155" r="10" fill="#333" />
    <Circle cx="130" cy="155" r="5" fill="#666" />

    {/* Connector */}
    <Rect x="160" y="90" width="20" height="30" fill="#0D47A1" />

    {/* Train Body - Car 2 */}
    <Rect x="180" y="60" width="150" height="90" fill="#1565C0" rx="8" />
    <Rect x="180" y="40" width="150" height="22" fill="#1976D2" rx="4" />
    {/* Car 2 Windows */}
    <Rect x="190" y="75" width="35" height="25" fill="#B3E5FC" rx="4" />
    <Rect x="235" y="75" width="35" height="25" fill="#B3E5FC" rx="4" />
    <Rect x="280" y="75" width="35" height="25" fill="#B3E5FC" rx="4" />
    {/* Car 2 Door */}
    <Rect x="236" y="110" width="33" height="38" fill="#0D47A1" rx="3" />
    <Rect x="250" y="120" width="5" height="15" fill="#90CAF9" rx="2" />
    {/* Car 2 Wheels */}
    <Circle cx="210" cy="155" r="10" fill="#333" />
    <Circle cx="210" cy="155" r="5" fill="#666" />
    <Circle cx="300" cy="155" r="10" fill="#333" />
    <Circle cx="300" cy="155" r="5" fill="#666" />

    {/* Blue stripe on both cars */}
    <Rect x="10" y="118" width="150" height="8" fill="#42A5F5" />
    <Rect x="180" y="118" width="150" height="8" fill="#42A5F5" />

    {/* DMRC Logo area */}
    <Rect x="55" y="44" width="50" height="14" fill="#FF8C00" rx="3" />
    <SvgText x="80" y="55" fontSize="9" fill="white" textAnchor="middle" fontWeight="bold">DMRC</SvgText>
    <Rect x="225" y="44" width="50" height="14" fill="#FF8C00" rx="3" />
    <SvgText x="250" y="55" fontSize="9" fill="white" textAnchor="middle" fontWeight="bold">DMRC</SvgText>

    {/* Pantograph */}
    <Line x1="100" y1="40" x2="85" y2="10" stroke="#aaa" strokeWidth="2" />
    <Line x1="85" y1="10" x2="115" y2="10" stroke="#aaa" strokeWidth="3" />
    <Line x1="115" y1="10" x2="100" y2="40" stroke="#aaa" strokeWidth="2" />
    {/* Overhead wire */}
    <Line x1="0" y1="8" x2="340" y2="8" stroke="#aaa" strokeWidth="1.5" />
  </Svg>
);

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      {/* Top decorative line with metro colors */}
      <View style={styles.colorBar}>
        {['#FFD700','#0047AB','#CC0000','#008000','#7B00D4','#FF69B4','#CC00AA','#808080','#FF8C00'].map((c, i) => (
          <View key={i} style={[styles.colorSegment, { backgroundColor: c }]} />
        ))}
      </View>

      {/* App Title */}
      <View style={styles.titleArea}>
        <Text style={styles.metroEmoji}>🚇</Text>
        <Text style={styles.titleMain}>Delhi Metro</Text>
        <Text style={styles.titleSub}>Your Smart Metro Companion</Text>
      </View>

      {/* Train Illustration */}
      <View style={styles.trainArea}>
        <MetroTrainSVG />
      </View>

      {/* Bottom info */}
      <View style={styles.bottomArea}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>9</Text>
            <Text style={styles.statLabel}>Lines</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>160+</Text>
            <Text style={styles.statLabel}>Stations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>374</Text>
            <Text style={styles.statLabel}>KM Network</Text>
          </View>
        </View>

        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Developed by</Text>
          <Text style={styles.developerName}>Mukesh Kumar</Text>
        </View>
      </View>

      {/* Bottom color bar */}
      <View style={styles.colorBar}>
        {['#FF8C00','#808080','#CC00AA','#FF69B4','#7B00D4','#008000','#CC0000','#0047AB','#FFD700'].map((c, i) => (
          <View key={i} style={[styles.colorSegment, { backgroundColor: c }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorBar: {
    flexDirection: 'row',
    width: '100%',
    height: 6,
  },
  colorSegment: {
    flex: 1,
    height: 6,
  },
  titleArea: {
    alignItems: 'center',
    marginTop: 20,
  },
  metroEmoji: {
    fontSize: 54,
    marginBottom: 8,
  },
  titleMain: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  titleSub: {
    fontSize: 14,
    color: '#90CAF9',
    marginTop: 6,
    letterSpacing: 1,
  },
  trainArea: {
    alignItems: 'center',
    marginVertical: 10,
  },
  bottomArea: {
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginHorizontal: 24,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 11,
    color: '#90CAF9',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#FFD700',
    width: 24,
    borderRadius: 4,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#607D8B',
    letterSpacing: 1,
  },
  developerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#90CAF9',
    letterSpacing: 2,
    marginTop: 2,
  },
});
