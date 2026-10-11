import { useEffect } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { chatsDe, prepararChats, rachaChat, useEstado } from '../../src/lib/store';
import { fuentes, useTheme } from '../../src/lib/theme';
import { Avatar, Cabecera, Icono } from '../../src/components/ui';
import { LlamaChat, horaCorta } from '../../src/components/Chat';
import type { Chat } from '../../src/lib/types';

export default function Mensajes() {
  const t = useTheme();
  const yo = useEstado((e) => e.sesion);
  const e = useEstado((x) => x);
  useEffect(() => { if (yo) prepararChats(yo); }, [yo]);
  if (!yo) return null;
  const chats = chatsDe(e, yo);

  const fila = (c: Chat) => {
    const otro = c.tipo === 'directo' ? e.perfiles[c.miembros.find((m) => m !== yo) ?? ''] : undefined;
    const nombre = c.tipo === 'grupo' ? c.nombre ?? 'Grupo' : otro?.nombre ?? 'Chat';
    const ult = c.mensajes.at(-1);
    const r = rachaChat(c);
    const autorUlt = ult && ult.autor !== yo ? (c.tipo === 'grupo' ? `${e.perfiles[ult.autor]?.nombre.split(' ')[0]}: ` : '') : ult ? 'Tú: ' : '';
    const vista = !ult ? 'Escribe el primer mensaje' : ult.rachi ? `${autorUlt}te ha enviado a Rachi 🔥` : `${autorUlt}${ult.texto}`;
    return (
      <Pressable onPress={() => router.push(`/chat/${c.id}`)} accessibilityRole="button" accessibilityLabel={`Chat con ${nombre}`}
        style={({ pressed }) => ({ flexDirection: 'row', gap: 12, alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: pressed ? t.card : 'transparent' })}>
        {c.tipo === 'grupo'
          ? <View style={{ width: 52, height: 52 }}>
              {c.miembros.filter((m) => m !== yo).slice(0, 2).map((m, i) => (
                <View key={m} style={{ position: 'absolute', left: i * 14, top: i * 12 }}><Avatar nombre={e.perfiles[m]?.nombre ?? '?'} color={e.perfiles[m]?.avatarColor ?? 'oro'} size={38} /></View>
              ))}
            </View>
          : <Avatar nombre={nombre} color={otro?.avatarColor ?? 'oro'} size={52} />}
        <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: t.text, fontWeight: '700', fontSize: 16, flexShrink: 1 }} numberOfLines={1}>{nombre}</Text>
            <LlamaChat dias={r.dias} enPeligro={r.enPeligro} />
          </View>
          <Text style={{ color: t.muted, fontSize: 14 }} numberOfLines={1}>{vista}</Text>
          {r.enPeligro && <Text style={{ color: '#8EC5EE', fontSize: 12 }}>Envía a Rachi hoy para no perder la racha</Text>}
        </View>
        {ult && <Text style={{ color: t.muted, fontSize: 12 }}>{horaCorta(ult.creado)}</Text>}
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Cabecera titulo="Mensajes" derecha={
        <Pressable onPress={() => router.push('/grupos')} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: t.line, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
          <Icono n="grupo" size={16} color={t.accent} /><Text style={{ color: t.text, fontSize: 13, fontWeight: '600' }}>Comunidades</Text>
        </Pressable>} />
      <FlatList
        data={chats}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => fila(item)}
        ListHeaderComponent={
          <Pressable onPress={() => router.push('/asistente')} accessibilityRole="button" accessibilityLabel="Abrir el asistente Aura"
            style={{ margin: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20, backgroundColor: t.card, borderWidth: 1, borderColor: 'rgba(212,175,106,0.4)' }}>
            <Image source={require('../../assets/lux/logo-3d.png')} style={{ width: 52, height: 52 }} accessibilityIgnoresInvertColors />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: t.accent, fontFamily: fuentes.display, fontSize: 24 }}>Aura</Text>
              <Text style={{ color: t.muted, fontSize: 13 }}>Tu asistente con IA. Pregúntale lo que quieras.</Text>
            </View>
            <Icono n="chispa" color={t.accent} />
          </Pressable>
        }
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: t.line, marginLeft: 80 }} />}
      />
    </View>
  );
}
