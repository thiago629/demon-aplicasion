import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { cambiarSeguridad, cerrarSesionRemota, puntuacionSeguridad, seguridadDe, useEstado } from '../src/lib/store';
import { fuentes, useTheme } from '../src/lib/theme';
import { Cabecera, Icono } from '../src/components/ui';
import { horaCorta } from '../src/components/Chat';

// Medidas reales del diseño (ver docs/seguridad.md). Las que dependen del servidor se activan al conectar Supabase.
const MEDIDAS = [
  ['Conexión cifrada', 'Todo viaja por HTTPS (TLS 1.2 o superior) con HSTS.'],
  ['Datos cifrados en reposo', 'La base de datos y los archivos se guardan cifrados (AES-256) en servidores de la UE.'],
  ['Contraseñas protegidas', 'Nunca guardamos tu contraseña: solo un resumen con bcrypt.'],
  ['Cada uno ve lo suyo', 'Reglas por fila (RLS): ni un fallo de la app permite leer datos de otra persona.'],
  ['Freno a los ataques', 'Límite de intentos de acceso y aviso si alguien entra desde un sitio nuevo.'],
  ['Cabeceras de seguridad', 'La web bloquea scripts externos (CSP) y que otras webs la incrusten.'],
];

export default function SeguridadPantalla() {
  const t = useTheme();
  const yo = useEstado((e) => e.sesion);
  const s = useEstado((e) => (e.sesion ? seguridadDe(e, e.sesion) : null));
  if (!yo || !s) return null;
  const nota = puntuacionSeguridad(s);
  const color = nota >= 90 ? t.ok : nota >= 70 ? t.accent : t.danger;

  const opcion = (titulo: string, desc: string, valor: boolean, cambio: (v: boolean) => void, icono: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: t.chip, alignItems: 'center', justifyContent: 'center' }}><Icono n={icono} color={t.accent} size={20} /></View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: t.text, fontWeight: '700', fontSize: 15 }}>{titulo}</Text>
        <Text style={{ color: t.muted, fontSize: 13 }}>{desc}</Text>
      </View>
      <Switch value={valor} onValueChange={cambio} accessibilityLabel={titulo}
        trackColor={{ true: t.accent, false: t.line }} thumbColor={valor ? '#FFF6E2' : '#8a8378'} {...({ activeThumbColor: '#FFF6E2' } as object)} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Cabecera titulo="Seguridad" izquierda={<Pressable onPress={() => router.back()} accessibilityLabel="Atrás"><Icono n="atras" /></Pressable>} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 40 }}>
        <View style={{ backgroundColor: t.card, borderRadius: 24, padding: 20, gap: 12, borderWidth: 1, borderColor: t.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Icono n="escudo" size={40} color={color} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.muted, fontSize: 12, letterSpacing: 1.5, fontWeight: '700' }}>PROTECCIÓN DE TU CUENTA</Text>
              <Text style={{ color: t.text, fontFamily: fuentes.display, fontSize: 40, fontVariant: ['tabular-nums'] }}>{nota}<Text style={{ fontSize: 22, color: t.muted }}> / 100</Text></Text>
            </View>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: t.line, overflow: 'hidden' }}><View style={{ width: `${nota}%`, height: 8, backgroundColor: color }} /></View>
          <Text style={{ color: t.muted, fontSize: 13 }}>{nota >= 90 ? 'Tu cuenta está blindada.' : 'Activa la verificación en dos pasos y una llave de acceso para llegar a 100.'}</Text>
        </View>

        <View style={{ backgroundColor: t.card, borderRadius: 24, paddingHorizontal: 16, borderWidth: 1, borderColor: t.line }}>
          {opcion('Verificación en dos pasos', 'Además de la contraseña, un código de tu app autenticadora.', s.dosPasos, (v) => cambiarSeguridad({ dosPasos: v }), 'candado')}
          <View style={{ height: 1, backgroundColor: t.line }} />
          {opcion('Llave de acceso', 'Entra con tu huella o tu cara, sin contraseña (passkey).', s.llaveAcceso, (v) => cambiarSeguridad({ llaveAcceso: v }), 'llave')}
          <View style={{ height: 1, backgroundColor: t.line }} />
          {opcion('Alertas de inicio de sesión', 'Te avisamos si alguien entra desde un dispositivo nuevo.', s.alertasInicio, (v) => cambiarSeguridad({ alertasInicio: v }), 'campana')}
        </View>

        <Text style={{ color: t.text, fontFamily: fuentes.display, fontSize: 24 }}>Dispositivos conectados</Text>
        <View style={{ backgroundColor: t.card, borderRadius: 24, paddingHorizontal: 16, borderWidth: 1, borderColor: t.line }}>
          {s.sesiones.map((x, i) => (
            <View key={x.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: i ? 1 : 0, borderColor: t.line }}>
              <Icono n="movil" color={t.accent} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontWeight: '700' }}>{x.dispositivo}{x.actual ? '  ·  ahora' : ''}</Text>
                <Text style={{ color: t.muted, fontSize: 13 }}>{x.lugar} · {horaCorta(x.ultima)}</Text>
              </View>
              {!x.actual && <Pressable onPress={() => cerrarSesionRemota(x.id)} accessibilityRole="button" accessibilityLabel={`Cerrar sesión en ${x.dispositivo}`}
                style={{ borderWidth: 1, borderColor: t.danger, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ color: t.danger, fontWeight: '700', fontSize: 13 }}>Cerrar</Text></Pressable>}
            </View>
          ))}
        </View>

        <Text style={{ color: t.text, fontFamily: fuentes.display, fontSize: 24 }}>Actividad reciente</Text>
        <View style={{ backgroundColor: t.card, borderRadius: 24, padding: 16, gap: 10, borderWidth: 1, borderColor: t.line }}>
          {s.actividad.slice(0, 6).map((a) => (
            <View key={a.id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Text style={{ color: t.text, fontSize: 14, flex: 1 }}>{a.evento}</Text>
              <Text style={{ color: t.muted, fontSize: 12 }}>{horaCorta(a.fecha)}</Text>
            </View>
          ))}
        </View>

        <Text style={{ color: t.text, fontFamily: fuentes.display, fontSize: 24 }}>Cómo te protegemos</Text>
        <View style={{ gap: 10 }}>
          {MEDIDAS.map(([titulo, desc]) => (
            <View key={titulo} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <Icono n="check" color={t.ok} size={20} />
              <View style={{ flex: 1 }}><Text style={{ color: t.text, fontWeight: '700' }}>{titulo}</Text><Text style={{ color: t.muted, fontSize: 13 }}>{desc}</Text></View>
            </View>
          ))}
        </View>
        <Text style={{ color: t.muted, fontSize: 12 }}>Modo demostración: estos ajustes se guardan en tu dispositivo. Con el servidor conectado, se aplican de verdad a tu cuenta.</Text>
      </ScrollView>
    </View>
  );
}
