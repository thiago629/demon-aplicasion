import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { diasQueCuentan, enviarMensaje, hoyISO, rachaChat, useEstado } from '../../src/lib/store';
import { useTheme } from '../../src/lib/theme';
import { Avatar, Cabecera, Icono } from '../../src/components/ui';
import { RachiImagen } from '../../src/components/Rachi';
import { Escribiendo, LlamaChat, horaCorta } from '../../src/components/Chat';

// Respuestas de ejemplo del modo demostración (en producción escribe una persona real)
const RESPUESTAS = ['¡Jajaja, total!', 'Me parece perfecto ✨', 'Luego te cuento con calma', '¿En serio? Cuéntame más', 'Hecho 👌', 'Qué buena idea'];

export default function ChatPantalla() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const yo = useEstado((e) => e.sesion);
  const chat = useEstado((e) => e.chats.find((c) => c.id === id));
  const perfiles = useEstado((e) => e.perfiles);
  const [texto, setTexto] = useState('');
  const [menu, setMenu] = useState(false);
  const [escribe, setEscribe] = useState<string | null>(null);
  const scroll = useRef<ScrollView>(null);
  const temporizadores = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => temporizadores.current.forEach(clearTimeout), []);

  if (!chat || !yo) return null;
  const otros = chat.miembros.filter((m) => m !== yo);
  const titulo = chat.tipo === 'grupo' ? chat.nombre ?? 'Grupo' : perfiles[otros[0]]?.nombre ?? 'Chat';
  const r = rachaChat(chat);
  const hoyCuenta = diasQueCuentan(chat).has(hoyISO());
  const yaEnvieRachiHoy = chat.mensajes.some((m) => m.autor === yo && m.rachi && hoyISO(new Date(m.creado)) === hoyISO());
  const necesarios = chat.tipo === 'directo' ? 2 : Math.max(3, Math.ceil(chat.miembros.length / 2));
  const hoyHan = new Set(chat.mensajes.filter((m) => hoyISO(new Date(m.creado)) === hoyISO()).map((m) => m.autor)).size;

  // Simula que la otra persona contesta (modo demostración)
  const contestar = (rachi: boolean) => {
    const quien = otros[Math.floor(Math.random() * otros.length)];
    temporizadores.current.push(setTimeout(() => setEscribe(quien), 700));
    temporizadores.current.push(setTimeout(() => {
      setEscribe(null);
      if (rachi) { enviarMensaje(chat.id, '', true, quien); enviarMensaje(chat.id, '¡Racha salvada! 🔥', false, quien); }
      else enviarMensaje(chat.id, RESPUESTAS[Math.floor(Math.random() * RESPUESTAS.length)], false, quien);
    }, 2300));
  };
  const enviar = () => { if (!texto.trim()) return; enviarMensaje(chat.id, texto); setTexto(''); contestar(false); };
  const enviarRachi = () => { setMenu(false); enviarMensaje(chat.id, '', true); contestar(true); };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Cabecera titulo={titulo}
        izquierda={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable onPress={() => router.back()} accessibilityLabel="Atrás"><Icono n="atras" /></Pressable>
          {chat.tipo === 'directo' && <Pressable onPress={() => router.push(`/u/${perfiles[otros[0]]?.usuario}`)}><Avatar nombre={titulo} color={perfiles[otros[0]]?.avatarColor ?? 'oro'} size={34} /></Pressable>}
        </View>}
        derecha={<LlamaChat dias={r.dias} enPeligro={r.enPeligro} />} />

      {/* Estado de la racha del chat */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: t.card, borderBottomWidth: 1, borderColor: t.line }}>
        <RachiImagen modo={hoyCuenta ? 'fuego' : r.enPeligro ? 'hielo' : 'normal'} size={36} />
        <Text style={{ color: t.muted, fontSize: 13, flex: 1 }}>
          {hoyCuenta ? `¡Racha de ${r.dias} ${r.dias === 1 ? 'día' : 'días'} encendida hoy!`
            : chat.tipo === 'directo'
              ? r.enPeligro ? `Vuestra racha de ${r.dias} días se congela hoy. Escribid o enviad a Rachi los dos.` : 'Escribid los dos hoy para empezar una racha.'
              : `Hoy han participado ${hoyHan} de ${chat.miembros.length}. Hacen falta ${necesarios} para que cuente el día.`}
        </Text>
      </View>

      <ScrollView ref={scroll} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })} contentContainerStyle={{ padding: 16, gap: 6 }}>
        {chat.mensajes.map((m, i) => {
          const mio = m.autor === yo;
          const autor = perfiles[m.autor];
          const nuevoAutor = chat.tipo === 'grupo' && !mio && chat.mensajes[i - 1]?.autor !== m.autor;
          if (m.rachi) return (
            <View key={m.id} style={{ alignSelf: mio ? 'flex-end' : 'flex-start', alignItems: 'center', padding: 10, borderRadius: 20, backgroundColor: 'rgba(255,138,31,0.08)', borderWidth: 1, borderColor: 'rgba(255,138,31,0.3)' }}
              accessibilityLabel={`${mio ? 'Has enviado' : `${autor?.nombre} te ha enviado`} a Rachi`}>
              <RachiImagen modo="fuego" size={64} />
              <Text style={{ color: '#FFB067', fontSize: 12, fontWeight: '700' }}>{mio ? 'Has enviado a Rachi' : `${autor?.nombre.split(' ')[0]} te envía a Rachi`}</Text>
            </View>
          );
          return (
            <View key={m.id} style={{ alignSelf: mio ? 'flex-end' : 'flex-start', maxWidth: '80%', gap: 2 }}>
              {nuevoAutor && <Text style={{ color: t.accent, fontSize: 12, fontWeight: '700', marginLeft: 6 }}>{autor?.nombre}</Text>}
              <View style={{ backgroundColor: mio ? t.accent : t.elev, borderRadius: 20, borderBottomRightRadius: mio ? 6 : 20, borderBottomLeftRadius: mio ? 20 : 6, paddingHorizontal: 14, paddingVertical: 9, borderWidth: mio ? 0 : 1, borderColor: t.line }}>
                <Text style={{ color: mio ? t.accentText : t.text, fontSize: 15 }}>{m.texto}</Text>
              </View>
              <Text style={{ color: t.muted, fontSize: 10, alignSelf: mio ? 'flex-end' : 'flex-start', marginHorizontal: 6 }}>{horaCorta(m.creado)}</Text>
            </View>
          );
        })}
        {escribe && <Escribiendo quien={perfiles[escribe]?.nombre.split(' ')[0]} />}
      </ScrollView>

      {menu && (
        <View style={{ position: 'absolute', left: 12, bottom: 70, backgroundColor: t.elev, borderRadius: 18, borderWidth: 1, borderColor: t.line, padding: 6, minWidth: 230 }}>
          <Pressable onPress={enviarRachi} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 }}>
            <RachiImagen modo="fuego" size={28} />
            <View><Text style={{ color: t.text, fontWeight: '700' }}>Enviar a Rachi</Text><Text style={{ color: t.muted, fontSize: 12 }}>{yaEnvieRachiHoy ? 'Ya lo has enviado hoy' : 'Mantiene viva la racha'}</Text></View>
          </Pressable>
          {chat.tipo === 'directo' && <Pressable onPress={() => { setMenu(false); router.push(`/u/${perfiles[otros[0]]?.usuario}`); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 }}>
            <Icono n="persona" size={20} /><Text style={{ color: t.text }}>Ver perfil</Text></Pressable>}
          <Pressable onPress={() => { setMenu(false); router.push('/legal/normas'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 }}>
            <Icono n="escudo" size={20} /><Text style={{ color: t.text }}>Normas y denuncias</Text></Pressable>
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderTopWidth: 1, borderColor: t.line, backgroundColor: t.bg }}>
        <Pressable onPress={() => setMenu(!menu)} accessibilityRole="button" accessibilityLabel="Más opciones"
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: menu ? t.accent : t.elev }}>
          <Icono n="mas" color={menu ? t.accentText : t.text} />
        </Pressable>
        <TextInput value={texto} onChangeText={setTexto} placeholder="Escribe un mensaje" placeholderTextColor={t.muted} onSubmitEditing={enviar} returnKeyType="send"
          accessibilityLabel="Mensaje"
          style={{ flex: 1, color: t.text, backgroundColor: t.elev, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: t.line }} />
        <Pressable onPress={enviar} disabled={!texto.trim()} accessibilityRole="button" accessibilityLabel="Enviar"
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: t.accent, opacity: texto.trim() ? 1 : 0.4 }}>
          <Icono n="enviar" size={18} color={t.accentText} />
        </Pressable>
      </View>
      <Text style={{ color: t.muted, fontSize: 10, textAlign: 'center', paddingBottom: 6 }}>Modo demostración: las respuestas son de ejemplo.</Text>
    </KeyboardAvoidingView>
  );
}
