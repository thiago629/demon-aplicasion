import { useMemo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { fuentes, useTheme } from '../lib/theme';
import { abrirChatCon, bloquear, seguir, silenciar, useEstado, visibles, puntosVisionario } from '../lib/store';
import { Avatar, Boton, Degradado, Cabecera, Icono, Pestañas, Vacio } from './ui';
import { ListaPosts } from './Lista';
import { HojaDenuncia, Opcion } from './Post';
import { Modal } from 'react-native';

const PORTADAS = [require('../../assets/lux/ciudad.jpg'), require('../../assets/lux/atardecer.jpg'), require('../../assets/lux/cafe.jpg')];

export function PerfilVista({ usuario, conAtras }: { usuario: string; conAtras?: boolean }) {
  const t = useTheme();
  const [pestaña, setPestaña] = useState<'posts' | 'respuestas' | 'megusta'>('posts');
  const [menu, setMenu] = useState(false);
  const [denuncia, setDenuncia] = useState(false);
  const e = useEstado((x) => x);
  const p = Object.values(e.perfiles).find((x) => x.usuario.toLowerCase() === usuario.toLowerCase());
  const lista = useMemo(() => {
    if (!p) return [];
    const v = visibles(e);
    if (pestaña === 'megusta') { const ids = new Set(e.likes.filter((l) => l.userId === p.id).map((l) => l.postId)); return v.filter((x) => ids.has(x.id)); }
    return v.filter((x) => x.autor === p.id && (pestaña === 'respuestas' ? !!x.respuestaA : !x.respuestaA))
      .sort((a, b) => b.creado.localeCompare(a.creado));
  }, [e, p, pestaña]);
  if (!p) return <Vacio texto="Esta cuenta no existe." />;

  const yo = e.sesion;
  const soyYo = yo === p.id;
  const sigo = e.seguidores.some((s) => s.seguidor === yo && s.seguido === p.id);
  const bloqueado = e.bloqueos.some((b) => b.userId === yo && b.bloqueado === p.id);
  const silenciado = e.silenciados.some((b) => b.userId === yo && b.silenciado === p.id);
  const nSiguiendo = e.seguidores.filter((s) => s.seguidor === p.id).length;
  const nSeguidores = e.seguidores.filter((s) => s.seguido === p.id).length;
  const oculto = p.privado && !soyYo && !sigo;

  const cabecera = (
    <View>
      <View style={{ height: 130 }}>
        <Image source={PORTADAS[[...p.id].reduce((a, c) => a + c.charCodeAt(0), 0) % PORTADAS.length]} style={{ width: '100%', height: 130 }} resizeMode="cover" accessibilityLabel="" />
        <Degradado color={t.bg} alto={70} />
      </View>
      <View style={{ paddingHorizontal: 16, marginTop: -36, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View style={{ borderWidth: 4, borderColor: t.bg, borderRadius: 50 }}><Avatar nombre={p.nombre} color={p.avatarColor} size={76} /></View>
          {soyYo ? <Boton titulo="Ajustes" tipo="secundario" onPress={() => router.push('/ajustes')} estilo={{ paddingVertical: 8 }} />
            : bloqueado ? <Boton titulo="Desbloquear" tipo="peligro" onPress={() => bloquear(p.id)} estilo={{ paddingVertical: 8 }} />
            : <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Pressable onPress={() => setMenu(true)} accessibilityLabel="Más opciones" style={{ borderWidth: 1, borderColor: t.line, borderRadius: 999, padding: 8 }}><Icono n="mas" size={18} /></Pressable>
                <Pressable onPress={() => { const c = abrirChatCon(p.id); if (c) router.push(`/chat/${c}`); }} accessibilityRole="button" accessibilityLabel={`Enviar mensaje a ${p.nombre}`} style={{ borderWidth: 1, borderColor: t.line, borderRadius: 999, padding: 8 }}><Icono n="burbuja" size={18} /></Pressable>
                <Boton titulo={sigo ? 'Siguiendo' : 'Seguir'} tipo={sigo ? 'secundario' : 'primario'} onPress={() => seguir(p.id)} estilo={{ paddingVertical: 8 }} />
              </View>}
        </View>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: t.text, fontSize: 30, fontFamily: fuentes.displayBold }}>{p.nombre}</Text>
            {p.verificado && <Icono n="check" size={16} color={t.accent} />}
            {p.privado && <Icono n="candado" size={15} color={t.muted} />}
          </View>
          <Text style={{ color: t.muted, fontSize: 15 }}>@{p.usuario}</Text>
        </View>
        {!!p.bio && <Text style={{ color: t.text, fontSize: 15 }}>{p.bio}</Text>}
        <Text style={{ color: t.muted }}>
          <Text style={{ color: t.text, fontWeight: '700' }}>{nSiguiendo}</Text> siguiendo   <Text style={{ color: t.text, fontWeight: '700' }}>{nSeguidores}</Text> seguidores
        </Text>
        {puntosVisionario(e, p.id) > 0 && (
          <Text style={{ color: t.text }}>🔮 <Text style={{ fontWeight: '800' }}>Visionario</Text> · acertó {puntosVisionario(e, p.id)} {puntosVisionario(e, p.id) === 1 ? 'cápsula del tiempo' : 'cápsulas del tiempo'}</Text>
        )}
        {silenciado && <Text style={{ color: t.muted, fontSize: 13 }}>Has silenciado esta cuenta: no verás sus publicaciones en tu inicio.</Text>}
      </View>
      <Pestañas opciones={[{ v: 'posts', t: 'Publicaciones' }, { v: 'respuestas', t: 'Respuestas' }, { v: 'megusta', t: 'Me gusta' }]} valor={pestaña} onCambio={setPestaña} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {conAtras && <Cabecera titulo={p.nombre} izquierda={<Pressable onPress={() => router.back()}><Icono n="atras" /></Pressable>} />}
      <ListaPosts posts={oculto || bloqueado ? [] : lista} cabecera={cabecera}
        vacio={bloqueado ? 'Has bloqueado esta cuenta.' : oculto ? 'Esta cuenta es privada. Síguela para ver lo que publica.' : 'Todavía no hay nada aquí.'} />
      <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
        <Pressable style={{ flex: 1, backgroundColor: '#0008', justifyContent: 'flex-end' }} onPress={() => setMenu(false)}>
          <View style={{ backgroundColor: t.card, padding: 12, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <Opcion t={silenciado ? 'Dejar de silenciar' : 'Silenciar'} onPress={() => { silenciar(p.id); setMenu(false); }} />
            <Opcion t="Bloquear" onPress={() => { bloquear(p.id); setMenu(false); }} />
            <Opcion t="Denunciar perfil" peligro onPress={() => { setMenu(false); setDenuncia(true); }} />
            <Opcion t="Cancelar" onPress={() => setMenu(false)} />
          </View>
        </Pressable>
      </Modal>
      <HojaDenuncia visible={denuncia} onCerrar={() => setDenuncia(false)} objetivo={{ tipo: 'perfil', id: p.id }} />
    </View>
  );
}
