// Archivo de privacidad: lo que vería el responsable de privacidad.
// En producción estos datos viven en el esquema "privado" de Supabase (UE), cifrados y con RLS,
// y cada consulta queda apuntada en "auditoria". Aquí se muestran enmascarados.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { fuentes, useTheme } from '../src/lib/theme';
import { useEstado } from '../src/lib/store';
import { Cabecera, Icono } from '../src/components/ui';

const TRATAMIENTOS = [
  ['Cuentas de usuario', 'Email, fecha de nacimiento, país', 'Contrato (art. 6.1.b RGPD)', 'Mientras exista la cuenta + 30 días'],
  ['Consentimientos', 'Qué aceptó, versión y fecha', 'Obligación legal (art. 7.1 RGPD)', '5 años tras borrar la cuenta'],
  ['Moderación y denuncias', 'Denuncias, decisiones y recursos', 'Obligación legal (DSA)', '6 meses tras cerrarse'],
  ['Mensajes privados y rachas', 'Texto de los chats, miembros, días de racha', 'Contrato (art. 6.1.b RGPD)', 'Hasta que los borres o cierres la cuenta'],
  ['Asistente Aura (IA)', 'Preguntas que haces al asistente', 'Contrato (art. 6.1.b RGPD); aviso de IA (art. 50 AI Act)', '30 días; el proveedor de IA no entrena con ellos'],
  ['Seguridad de la cuenta', 'Dispositivos, inicios de sesión, IP aproximada', 'Interés legítimo (art. 6.1.f RGPD)', '12 meses'],
  ['Medición de uso', 'Uso anónimo de la app', 'Consentimiento (art. 6.1.a RGPD)', '13 meses'],
];

const ocultarEmail = (e: string) => e.replace(/^(.).*(@.*)$/, '$1•••$2');
const edad = (f: string) => Math.floor((Date.now() - Date.parse(f)) / 31557600000);

export default function ArchivoPrivacidad() {
  const t = useTheme();
  const e = useEstado((x) => x);
  const filas = Object.values(e.privado.datos);
  const celda = { color: t.text, fontSize: 13 } as const;
  return (
    <View style={{ flex: 1 }}>
      <Cabecera titulo="Archivo de privacidad" izquierda={<Pressable onPress={() => router.back()}><Icono n="atras" /></Pressable>} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 60 }}>
        <View style={{ padding: 14, borderRadius: 16, backgroundColor: t.chip, gap: 6, flexDirection: 'row' }}>
          <Icono n="candado" color={t.accent} />
          <Text style={{ color: t.text, flex: 1 }}>
            Los datos privados se guardan aparte de lo que se publica, en servidores de la UE, cifrados y con acceso solo para su dueño y el responsable de privacidad. Cada consulta queda registrada.
          </Text>
        </View>

        <Text style={{ color: t.text, fontSize: 24, fontFamily: fuentes.display }}>Registro de actividades de tratamiento</Text>
        {TRATAMIENTOS.map(([que, datos, base, plazo]) => (
          <View key={que} style={{ gap: 2, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: t.line }}>
            <Text style={{ color: t.text, fontWeight: '700' }}>{que}</Text>
            <Text style={{ color: t.muted, fontSize: 13 }}>Datos: {datos}</Text>
            <Text style={{ color: t.muted, fontSize: 13 }}>Base legal: {base}</Text>
            <Text style={{ color: t.muted, fontSize: 13 }}>Se guarda: {plazo}</Text>
          </View>
        ))}

        <Text style={{ color: t.text, fontSize: 24, fontFamily: fuentes.display }}>Personas registradas ({filas.length})</Text>
        {filas.map((d) => {
          const p = e.perfiles[d.userId];
          const c = e.privado.consentimientos[d.userId] ?? [];
          return (
            <View key={d.userId} style={{ gap: 3, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: t.line }}>
              <Text style={{ color: t.text, fontWeight: '700' }}>@{p?.usuario ?? 'cuenta borrada'}{d.borradoProgramado ? ' · borrado programado' : ''}</Text>
              <Text style={celda}>Email: {ocultarEmail(d.email)} · Edad: {edad(d.fechaNacimiento)} · País: {d.pais}</Text>
              <Text style={{ color: t.muted, fontSize: 12 }}>
                Consentimientos: {c.length ? c.map((x) => `${x.tipo} v${x.versionDoc} ${x.aceptado ? 'sí' : 'no'}`).join(' · ') : 'ninguno guardado'}
              </Text>
            </View>
          );
        })}

        <Text style={{ color: t.text, fontSize: 24, fontFamily: fuentes.display }}>Denuncias y recursos</Text>
        <Text style={celda}>{e.denuncias.length} denuncias · {e.apelaciones.length} recursos de moderación registrados.</Text>
        <Text style={{ color: t.muted, fontSize: 12 }}>App de prueba: los datos son inventados y solo se guardan en este dispositivo.</Text>
      </ScrollView>
    </View>
  );
}
