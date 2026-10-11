import { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { hablarConAura, useEstado } from '../src/lib/store';
import { fuentes, useTheme } from '../src/lib/theme';
import { Cabecera, Icono } from '../src/components/ui';
import { Escribiendo } from '../src/components/Chat';
import marca from '../src/lib/marca.json';

// Modo demostración: Aura responde con un guion sobre la app.
// En producción, el servidor (Supabase Edge Function) llama a la API de Claude con la clave guardada
// como secreto; la clave nunca viaja en la app (ver docs/seguridad.md).
const TEMAS: [RegExp, string][] = [
  [/rach|rachi|fuego|congel/i, 'Tu racha cuenta los días seguidos en que publicas o comentas. Rachi se pone en llamas cuando ya has participado hoy y se congela si fallas un día: tienes hasta el final del día siguiente para salvarla. En los chats también hay racha: enviaos a Rachi desde el botón ⋯.'],
  [/predic|punto|apuest/i, 'En Predicciones (pestaña Arena) apuestas puntos sobre partidos, realities o noticias. Empiezas con 1.000 puntos. Los puntos no valen dinero, no se compran ni se canjean: es solo para presumir en el ranking.'],
  [/privac|datos|rgpd|guard/i, `Tus datos personales (email y fecha de nacimiento) se guardan aparte de lo que publicas, en servidores de la UE. Puedes descargarlos o borrarlos en Ajustes. ${marca.nombre} no vende tus datos.`],
  [/borra|elimin|baja/i, 'Ve a Ajustes → Eliminar cuenta. Tu perfil se oculta al momento y los datos se borran del todo a los 30 días.'],
  [/segur|contrase|hack|dos pasos|2fa|llave|robo/i, 'En Ajustes → Seguridad puedes activar la verificación en dos pasos, crear una llave de acceso, ver los dispositivos conectados y cerrar sesiones que no reconozcas.'],
  [/ring|debate/i, 'El Ring es un debate 1 contra 1 por turnos: tres intervenciones cada uno y luego la gente vota durante 24 horas. Lo tienes en la pestaña Arena.'],
  [/meme|duelo/i, 'Cada semana hay un Duelo de memes: publica tu meme con el hashtag del tema y la gente vota entre parejas. El ganador se lleva el título de campeón.'],
  [/c[aá]psula/i, 'La Cápsula del tiempo sella una publicación hasta la fecha que elijas. Cuando se abre, la gente vota si acertaste y ganas la insignia Visionario.'],
  [/denunci|acoso|insult|bloque/i, 'Toca ⋯ en cualquier publicación o perfil para denunciar, bloquear o silenciar. Revisamos cada denuncia y te explicamos la decisión; si no estás de acuerdo, puedes recurrirla.'],
  [/hola|buenas|hey/i, `¡Hola! Soy Aura, la asistente de ${marca.nombre}. Pregúntame por la racha, las predicciones, tu privacidad o la seguridad de tu cuenta.`],
];
const SUGERENCIAS = ['¿Cómo funciona la racha?', '¿Los puntos valen dinero?', '¿Dónde se guardan mis datos?', '¿Cómo protejo mi cuenta?'];

const responder = (q: string) => TEMAS.find(([r]) => r.test(q))?.[1]
  ?? `Ahora mismo estoy en modo demostración y solo sé responder sobre ${marca.nombre}. Cuando la app esté publicada, te contestaré sobre cualquier tema con la IA de Claude.`;

export default function Asistente() {
  const t = useTheme();
  const yo = useEstado((e) => e.sesion);
  const historial = useEstado((e) => e.asistente[e.sesion ?? '']) ?? SIN_MENSAJES;
  const [texto, setTexto] = useState('');
  const [pensando, setPensando] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const tm = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(tm.current), []);
  if (!yo) return null;

  const preguntar = (q: string) => {
    if (!q.trim() || pensando) return;
    hablarConAura('yo', q.trim()); setTexto(''); setPensando(true);
    tm.current = setTimeout(() => { hablarConAura('aura', responder(q)); setPensando(false); }, 1200);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Cabecera titulo="Aura" izquierda={<Pressable onPress={() => router.back()} accessibilityLabel="Atrás"><Icono n="atras" /></Pressable>}
        derecha={<Icono n="chispa" color={t.accent} />} />
      <ScrollView ref={scroll} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })} contentContainerStyle={{ padding: 16, gap: 10 }}>
        <View style={{ alignItems: 'center', gap: 8, paddingVertical: 12 }}>
          <Image source={require('../assets/lux/logo-3d.png')} style={{ width: 96, height: 96 }} accessibilityIgnoresInvertColors />
          <Text style={{ color: t.text, fontFamily: fuentes.display, fontSize: 30 }}>Hola, soy Aura</Text>
          <Text style={{ color: t.muted, textAlign: 'center', maxWidth: 320 }}>Te ayudo con cualquier duda sobre {marca.nombre}.</Text>
          <View style={{ backgroundColor: t.chip, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: t.line }}>
            <Text style={{ color: t.muted, fontSize: 12, textAlign: 'center' }}>Estás hablando con una inteligencia artificial. Puede equivocarse: no compartas datos sensibles.</Text>
          </View>
        </View>
        {historial.length === 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {SUGERENCIAS.map((s) => (
              <Pressable key={s} onPress={() => preguntar(s)} accessibilityRole="button" style={{ borderWidth: 1, borderColor: 'rgba(212,175,106,0.5)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
                <Text style={{ color: t.accentSoft, fontSize: 13 }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {historial.map((m, i) => (
          <View key={i} style={{ alignSelf: m.rol === 'yo' ? 'flex-end' : 'flex-start', maxWidth: '85%', backgroundColor: m.rol === 'yo' ? t.accent : t.elev, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, borderWidth: m.rol === 'yo' ? 0 : 1, borderColor: t.line }}>
            <Text style={{ color: m.rol === 'yo' ? t.accentText : t.text, fontSize: 15, lineHeight: 21 }}>{m.texto}</Text>
          </View>
        ))}
        {pensando && <Escribiendo quien="Aura" />}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderTopWidth: 1, borderColor: t.line }}>
        <TextInput value={texto} onChangeText={setTexto} onSubmitEditing={() => preguntar(texto)} placeholder="Pregúntale a Aura" placeholderTextColor={t.muted} returnKeyType="send" accessibilityLabel="Pregunta para Aura"
          style={{ flex: 1, color: t.text, backgroundColor: t.elev, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: t.line }} />
        <Pressable onPress={() => preguntar(texto)} disabled={!texto.trim()} accessibilityRole="button" accessibilityLabel="Enviar pregunta"
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: t.accent, opacity: texto.trim() ? 1 : 0.4 }}>
          <Icono n="enviar" size={18} color={t.accentText} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
const SIN_MENSAJES: { rol: 'yo' | 'aura'; texto: string; creado: string }[] = [];
