import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../src/lib/theme';
import { publicar, useEstado } from '../src/lib/store';
import type { Medio, Post } from '../src/lib/types';
import { Avatar, Boton, Campo, Icono } from '../src/components/ui';
import { MedioVista } from '../src/components/Post';

const MAX = 500;
const PLANTILLA_MEME = require('../assets/lux/meme.jpg');

export default function Publicar() {
  const t = useTheme();
  const { respuestaA, grupoId, duelo } = useLocalSearchParams<{ respuestaA?: string; grupoId?: string; duelo?: string }>();
  const yo = useEstado((e) => e.perfiles[e.sesion ?? '']);
  const original = useEstado((e) => e.posts.find((p) => p.id === respuestaA));
  const autorOriginal = useEstado((e) => (original ? e.perfiles[original.autor] : undefined));
  const grupo = useEstado((e) => e.grupos.find((g) => g.id === grupoId));
  const [texto, setTexto] = useState(duelo ? `#${duelo} ` : '');
  const [medio, setMedio] = useState<Medio | null>(duelo ? { uri: PLANTILLA_MEME, tipo: 'imagen', alt: 'Meme', memeArriba: '', memeAbajo: '' } : null);
  const [esMeme, setEsMeme] = useState(!!duelo);
  const [capsula, setCapsula] = useState(false);
  const [abre, setAbre] = useState(() => new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10));
  const fechaOk = /^\d{4}-\d{2}-\d{2}$/.test(abre) && Date.parse(abre) > Date.now();

  async function elegir(tipo: 'imagen' | 'video', meme = false) {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: tipo === 'video' ? ['videos'] : ['images'],
      quality: 0.85,
      exif: false, // no guardamos la ubicación ni datos de la cámara (además se limpian en el servidor)
      videoMaxDuration: 180,
    });
    if (r.canceled) return;
    setEsMeme(meme);
    setMedio({ uri: r.assets[0].uri, tipo, alt: '' });
  }

  function enviar() {
    const tipo: Post['tipo'] = esMeme ? 'meme' : medio?.tipo === 'video' ? 'video' : medio ? 'foto' : 'texto';
    const id = publicar({ texto, tipo, medios: medio ? [medio] : [], respuestaA, grupoId, abreEl: capsula ? new Date(`${abre}T09:00:00`).toISOString() : undefined });
    if (router.canGoBack()) router.back();
    if (id && !respuestaA && !grupoId) router.push(`/post/${id}`);
  }

  const vacio = !texto.trim() && !medio;
  const restan = MAX - texto.length;
  if (!yo) return null;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 }}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Cerrar"><Icono n="cerrar" /></Pressable>
        <Boton titulo={respuestaA ? 'Responder' : capsula ? 'Sellar cápsula' : 'Publicar'} desactivado={vacio || restan < 0 || (capsula && !fechaOk)} onPress={enviar} estilo={{ paddingVertical: 8 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        {autorOriginal && <Text style={{ color: t.muted }}>Respondiendo a <Text style={{ color: t.accent }}>@{autorOriginal.usuario}</Text></Text>}
        {grupo && <Text style={{ color: t.muted }}>Publicando en <Text style={{ color: t.text, fontWeight: '700' }}>{grupo.nombre}</Text></Text>}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Avatar nombre={yo.nombre} color={yo.avatarColor} />
          <TextInput autoFocus multiline value={texto} onChangeText={setTexto}
            placeholder={respuestaA ? 'Escribe tu respuesta' : '¿Qué está pasando? Usa # para temas y @ para mencionar'}
            placeholderTextColor={t.muted} style={{ flex: 1, color: t.text, fontSize: 18, minHeight: 120, textAlignVertical: 'top' }} />
        </View>
        {medio && (
          <View>
            <MedioVista m={medio} />
            <Pressable onPress={() => { setMedio(null); setEsMeme(false); }} style={{ position: 'absolute', top: 18, right: 8, backgroundColor: '#000a', borderRadius: 16, padding: 6 }} accessibilityLabel="Quitar">
              <Icono n="cerrar" size={16} color="#fff" />
            </Pressable>
          </View>
        )}
        {medio && esMeme && (
          <View style={{ gap: 10 }}>
            <Campo etiqueta="Texto de arriba" value={medio.memeArriba ?? ''} onChangeText={(v) => setMedio({ ...medio, memeArriba: v })} maxLength={80} />
            <Campo etiqueta="Texto de abajo" value={medio.memeAbajo ?? ''} onChangeText={(v) => setMedio({ ...medio, memeAbajo: v })} maxLength={80} />
          </View>
        )}
        {capsula && (
          <View style={{ gap: 8, padding: 14, borderRadius: 16, backgroundColor: t.chip }}>
            <Text style={{ color: t.text, fontWeight: '800' }}>Cápsula del tiempo</Text>
            <Text style={{ color: t.muted }}>Haz una predicción. Se publica sellada y nadie puede leerla ni puedes editarla hasta la fecha. Cuando se abra, la gente vota si acertaste.</Text>
            <Campo etiqueta="Se abre el (AAAA-MM-DD)" value={abre} onChangeText={setAbre} maxLength={10} />
            {!fechaOk && <Text style={{ color: t.danger }}>Pon una fecha futura con el formato AAAA-MM-DD.</Text>}
          </View>
        )}
        {medio && medio.tipo === 'imagen' && (
          <Campo etiqueta="Describe la imagen (para personas ciegas)" value={medio.alt ?? ''} onChangeText={(v) => setMedio({ ...medio, alt: v })} maxLength={1000} />
        )}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 22, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderColor: t.line }}>
        <Pressable onPress={() => elegir('imagen')} accessibilityLabel="Añadir foto"><Icono n="imagen" color={t.accent} /></Pressable>
        <Pressable onPress={() => elegir('video')} accessibilityLabel="Añadir vídeo"><Icono n="video" color={t.accent} /></Pressable>
        <Pressable onPress={() => { setEsMeme(true); setMedio({ uri: PLANTILLA_MEME, tipo: 'imagen', alt: 'Meme', memeArriba: '', memeAbajo: '' }); }}
          onLongPress={() => elegir('imagen', true)} accessibilityLabel="Crear meme"><Icono n="meme" color={t.accent} /></Pressable>
        {!respuestaA && <Pressable onPress={() => setCapsula(!capsula)} accessibilityLabel="Cápsula del tiempo" accessibilityState={{ selected: capsula }}><Icono n="reloj" color={capsula ? t.text : t.accent} /></Pressable>}
        <View style={{ flex: 1 }} />
        <Text style={{ color: restan < 0 ? t.danger : restan < 40 ? t.accent : t.muted, fontWeight: '600' }}>{restan}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}
