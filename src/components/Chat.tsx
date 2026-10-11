import { useEffect, useRef } from 'react';
import { Animated, Platform, Text, View } from 'react-native';
import { useTheme } from '../lib/theme';

// Tres puntitos de «escribiendo…»
export function Escribiendo({ quien }: { quien?: string }) {
  const t = useTheme();
  const v = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;
  useEffect(() => {
    const nativo = Platform.OS !== 'web';
    const anim = Animated.loop(Animated.stagger(160, v.map((x) => Animated.sequence([
      Animated.timing(x, { toValue: 1, duration: 280, useNativeDriver: nativo }),
      Animated.timing(x, { toValue: 0.3, duration: 280, useNativeDriver: nativo }),
    ]))));
    anim.start();
    return () => anim.stop();
  }, [v]);
  return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 }}
      accessibilityLabel={`${quien ?? 'Alguien'} está escribiendo`}>
      <View style={{ flexDirection: 'row', gap: 4, backgroundColor: t.elev, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: t.line }}>
        {v.map((x, i) => <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: t.accent, opacity: x, transform: [{ translateY: x.interpolate({ inputRange: [0.3, 1], outputRange: [0, -3] }) }] }} />)}
      </View>
      {quien && <Text style={{ color: t.muted, fontSize: 12 }}>{quien} está escribiendo…</Text>}
    </View>
  );
}

// Llama de racha del chat
export function LlamaChat({ dias, enPeligro }: { dias: number; enPeligro: boolean }) {
  const t = useTheme();
  if (!dias) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: enPeligro ? 'rgba(111,179,230,0.14)' : 'rgba(255,138,31,0.14)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}
      accessibilityLabel={`Racha de chat de ${dias} días${enPeligro ? ', en peligro' : ''}`}>
      <Text style={{ fontSize: 12 }}>{enPeligro ? '🧊' : '🔥'}</Text>
      <Text style={{ color: enPeligro ? '#8EC5EE' : '#FFB067', fontWeight: '800', fontSize: 12, fontVariant: ['tabular-nums'] }}>{dias}</Text>
    </View>
  );
}

export const horaCorta = (iso: string) => {
  const d = new Date(iso), hoy = new Date();
  const mismoDia = d.toDateString() === hoy.toDateString();
  return mismoDia ? d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};
