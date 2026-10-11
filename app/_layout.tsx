import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { cargar, decidirCookies, useEstado } from '../src/lib/store';
import { fuentes, useTheme } from '../src/lib/theme';
import { Boton } from '../src/components/ui';
import { useFonts, CormorantGaramond_500Medium_Italic, CormorantGaramond_600SemiBold, CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond';

// Pantallas que se ven sin iniciar sesión
const PUBLICAS = ['bienvenida', 'registro', 'entrar', 'legal', 'eliminar-cuenta'];

function AvisoCookies() {
  const t = useTheme();
  const decidido = useEstado((e) => e.cookies.decidido);
  if (decidido) return null;
  // Aceptar y Rechazar con el mismo peso visual (requisito AEPD)
  return (
    <View style={{ position: 'absolute', left: 12, right: 12, bottom: 24, backgroundColor: t.card, borderRadius: 20, padding: 18, gap: 12, borderWidth: 1, borderColor: t.accent, maxWidth: 560, alignSelf: 'center' }}>
      <Text style={{ color: t.text, fontFamily: fuentes.display, fontSize: 22 }}>Tu privacidad</Text>
      <Text style={{ color: t.muted, fontSize: 14 }}>
        Usamos lo imprescindible para que la app funcione. Con tu permiso, también medimos de forma anónima cómo se usa para mejorarla.{' '}
        <Text style={{ color: t.accent }} onPress={() => router.push('/legal/cookies')}>Más información</Text>
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Boton titulo="Rechazar" tipo="secundario" estilo={{ flex: 1 }} onPress={() => decidirCookies(false)} />
        <Boton titulo="Aceptar" tipo="secundario" estilo={{ flex: 1 }} onPress={() => decidirCookies(true)} />
      </View>
    </View>
  );
}

export default function Raiz() {
  const t = useTheme();
  const [cargado, setCargado] = useState(false);
  const [fuentesOk, errorFuentes] = useFonts({ CormorantGaramond_500Medium_Italic, CormorantGaramond_600SemiBold, CormorantGaramond_700Bold });
  // Si las fuentes fallan, la app sigue con la del sistema
  const listo = cargado && (fuentesOk || !!errorFuentes);
  const sesion = useEstado((e) => e.sesion);
  const segmentos = useSegments();

  useEffect(() => { cargar().finally(() => setCargado(true)); }, []);

  useEffect(() => {
    if (!listo) return;
    const publica = PUBLICAS.includes(segmentos[0] ?? '');
    if (!sesion && !publica) router.replace('/bienvenida');
    if (sesion && ['bienvenida', 'registro', 'entrar'].includes(segmentos[0] ?? '')) router.replace('/');
  }, [listo, sesion, segmentos]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
        <View style={{ flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 640 : undefined, alignSelf: 'center', borderLeftWidth: Platform.OS === 'web' ? 1 : 0, borderRightWidth: Platform.OS === 'web' ? 1 : 0, borderColor: t.line }}>
          {listo ? (
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
              <Stack.Screen name="publicar" options={{ presentation: 'modal' }} />
            </Stack>
          ) : (
            <ActivityIndicator style={{ flex: 1 }} color={t.accent} />
          )}
        </View>
        <AvisoCookies />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
