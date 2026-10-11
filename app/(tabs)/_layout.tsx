import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useTheme } from '../../src/lib/theme';
import { useEstado } from '../../src/lib/store';
import { Icono } from '../../src/components/ui';

export default function Pestanas() {
  const t = useTheme();
  const sinLeer = useEstado((e) => (e.notificaciones[e.sesion ?? ''] ?? []).filter((n) => !n.leida).length);
  const icono = (n: string, badge?: number) => ({ color }: { color: unknown }) => (
    <View>
      <Icono n={n} color={String(color)} size={24} />
      {!!badge && (
        <View style={{ position: 'absolute', top: -4, right: -8, backgroundColor: t.accent, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
          <Text style={{ color: t.accentText, fontSize: 11, fontWeight: '800' }}>{badge}</Text>
        </View>
      )}
    </View>
  );
  return (
    <Tabs screenOptions={{
      headerShown: false, tabBarShowLabel: false,
      tabBarActiveTintColor: t.accent, tabBarInactiveTintColor: t.muted,
      tabBarStyle: { backgroundColor: t.bg, borderTopColor: t.line, height: 64, paddingTop: 6 },
      sceneStyle: { backgroundColor: t.bg },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarAccessibilityLabel: 'Inicio', tabBarIcon: icono('casa') }} />
      <Tabs.Screen name="explorar" options={{ title: 'Explorar', tabBarAccessibilityLabel: 'Explorar', tabBarIcon: icono('lupa') }} />
      <Tabs.Screen name="arena" options={{ title: 'Arena', tabBarAccessibilityLabel: 'Arena', tabBarIcon: icono('trofeo') }} />
      <Tabs.Screen name="mensajes" options={{ title: 'Mensajes', tabBarAccessibilityLabel: 'Mensajes', tabBarIcon: icono('burbuja') }} />
      <Tabs.Screen name="notificaciones" options={{ title: 'Avisos', tabBarAccessibilityLabel: 'Avisos', tabBarIcon: icono('campana', sinLeer) }} />
      <Tabs.Screen name="grupos" options={{ title: 'Comunidades', href: null }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarAccessibilityLabel: 'Perfil', tabBarIcon: icono('persona') }} />
    </Tabs>
  );
}
