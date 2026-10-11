import { Image, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { fuentes, useTheme } from '../src/lib/theme';
import { Boton, Degradado } from '../src/components/ui';
import marca from '../src/lib/marca.json';

export default function Bienvenida() {
  const t = useTheme();
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: t.bg }}>
      <View style={{ width: '100%', aspectRatio: 0.92, justifyContent: 'flex-end', overflow: 'hidden' }}>
        <Image source={require('../assets/lux/portada.jpg')} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          accessibilityLabel="Media luna dorada de Lunaure entre perlas de oro y ónix" />
        {/* Degradado hacia el negro para que el texto se lea */}
        <Degradado color={t.bg} alto={200} />
        <View style={{ alignItems: 'center', gap: 2, paddingBottom: 6 }}>
          <Text style={{ color: t.text, fontFamily: fuentes.displayBold, fontSize: 56, letterSpacing: 1 }}>{marca.nombre}</Text>
          <Text style={{ color: t.accentSoft, fontFamily: fuentes.italica, fontSize: 22 }}>{marca.eslogan}</Text>
        </View>
        <View style={{ position: 'absolute', top: 18, left: 18, borderWidth: 1, borderColor: t.accent, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: 'rgba(10,9,8,0.55)' }}>
          <Text style={{ color: t.accentSoft, fontWeight: '700', letterSpacing: 2, fontSize: 11 }}>APP DE PRUEBA</Text>
        </View>
      </View>
      <View style={{ padding: 28, paddingTop: 12, gap: 22, paddingBottom: 40 }}>
        <Text style={{ color: t.muted, fontSize: 16, textAlign: 'center', lineHeight: 23 }}>
          Comparte lo que piensas, mantén la racha con Rachi en tus chats, reta a tus amigos en la Arena y guarda tus recuerdos en cápsulas.
        </Text>
        <View style={{ gap: 12 }}>
          <Boton titulo="Crear cuenta" onPress={() => router.push('/registro')} />
          <Boton titulo="Ya tengo cuenta" tipo="secundario" onPress={() => router.push('/entrar')} />
        </View>
        <Text style={{ color: t.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
          Al registrarte aceptas los <Text style={{ color: t.accent }} onPress={() => router.push('/legal/terminos')}>Términos</Text> y la{' '}
          <Text style={{ color: t.accent }} onPress={() => router.push('/legal/privacidad')}>Política de privacidad</Text>. Solo mayores de 16 años.
        </Text>
      </View>
    </ScrollView>
  );
}
