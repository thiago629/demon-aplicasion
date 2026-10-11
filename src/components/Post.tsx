import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '../lib/theme';
import { hace, trocear } from '../lib/texto';
import type { Medio, MotivoDenuncia, Post as TPost } from '../lib/types';
import { bloquear, borrarPost, capsulaAbierta, compartir, denunciar, guardar, meGusta, silenciar, useEstado, votarCapsula } from '../lib/store';
import { Avatar, Boton, Icono } from './ui';

export function TextoRico({ texto, tamaño = 16 }: { texto: string; tamaño?: number }) {
  const t = useTheme();
  return (
    <Text style={{ color: t.text, fontSize: tamaño, lineHeight: tamaño * 1.4 }}>
      {trocear(texto).map((p, i) => {
        if (p.tipo === 'hashtag')
          return <Text key={i} style={{ color: t.accent, fontWeight: '600' }} onPress={() => router.push(`/tag/${encodeURIComponent(p.valor.toLowerCase())}`)}>#{p.valor}</Text>;
        if (p.tipo === 'mencion')
          return <Text key={i} style={{ color: t.accent, fontWeight: '600' }} onPress={() => router.push(`/u/${p.valor}`)}>@{p.valor}</Text>;
        if (p.tipo === 'enlace') return <Text key={i} style={{ color: t.accent, textDecorationLine: 'underline' }}>{p.valor}</Text>;
        return <Text key={i}>{p.valor}</Text>;
      })}
    </Text>
  );
}

function Video({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => { p.loop = true; p.muted = true; });
  return <VideoView player={player} style={{ width: '100%', aspectRatio: 16 / 9 }} nativeControls contentFit="cover" />;
}

const textoMeme = {
  position: 'absolute' as const, left: 8, right: 8, textAlign: 'center' as const, color: '#fff', fontSize: 26, fontWeight: '900' as const,
  textShadowColor: '#000', textShadowRadius: 6, textShadowOffset: { width: 0, height: 0 }, letterSpacing: 0.5,
};

export function MedioVista({ m }: { m: Medio }) {
  const t = useTheme();
  // En la web las imágenes incluidas llegan como { uri, width, height }: nos quedamos solo con la uri
  const source = typeof m.uri === 'string' ? { uri: m.uri } : typeof m.uri === 'object' ? { uri: m.uri.uri } : m.uri;
  return (
    <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: t.line, marginTop: 10 }}>
      {m.tipo === 'video' && typeof m.uri === 'string'
        ? <Video uri={m.uri} />
        : <View style={{ width: '100%', aspectRatio: 3 / 2 }}><Image source={source} accessibilityLabel={m.alt} style={StyleSheet.absoluteFill} resizeMode="cover" /></View>}
      {!!m.memeArriba && <Text style={[textoMeme, { top: 10 }]}>{m.memeArriba.toUpperCase()}</Text>}
      {!!m.memeAbajo && <Text style={[textoMeme, { bottom: 10 }]}>{m.memeAbajo.toUpperCase()}</Text>}
    </View>
  );
}

const MOTIVOS: { v: MotivoDenuncia; t: string }[] = [
  { v: 'odio', t: 'Odio o discriminación' },
  { v: 'acoso', t: 'Acoso o amenazas' },
  { v: 'violencia', t: 'Violencia' },
  { v: 'sexual', t: 'Contenido sexual' },
  { v: 'menores', t: 'Pone en riesgo a menores' },
  { v: 'spam', t: 'Spam o estafa' },
  { v: 'falso', t: 'Información falsa' },
  { v: 'derechos_autor', t: 'Derechos de autor' },
  { v: 'otro', t: 'Otro motivo' },
];

export function HojaDenuncia({ visible, onCerrar, objetivo }: { visible: boolean; onCerrar: () => void; objetivo: { tipo: 'post' | 'perfil' | 'grupo'; id: string } }) {
  const t = useTheme();
  const [hecho, setHecho] = useState(false);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <Pressable style={{ flex: 1, backgroundColor: '#0008' }} onPress={onCerrar} />
      <View style={{ backgroundColor: t.card, padding: 20, gap: 4, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
        {hecho ? (
          <>
            <Text style={{ color: t.text, fontSize: 18, fontWeight: '800' }}>Gracias por avisar</Text>
            <Text style={{ color: t.muted, marginVertical: 8 }}>Una persona del equipo lo revisará y te diremos qué hemos decidido y por qué.</Text>
            <Boton titulo="Cerrar" onPress={() => { setHecho(false); onCerrar(); }} />
          </>
        ) : (
          <>
            <Text style={{ color: t.text, fontSize: 18, fontWeight: '800', marginBottom: 8 }}>¿Qué pasa con esto?</Text>
            {MOTIVOS.map((m) => (
              <Pressable key={m.v} onPress={() => { denunciar(objetivo, m.v); setHecho(true); }} style={{ paddingVertical: 12 }}>
                <Text style={{ color: t.text, fontSize: 16 }}>{m.t}</Text>
              </Pressable>
            ))}
          </>
        )}
      </View>
    </Modal>
  );
}

function Accion({ icono, n, activo, color, onPress, etiqueta }: { icono: string; n?: number; activo?: boolean; color: string; onPress: () => void; etiqueta: string }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityLabel={etiqueta} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 52 }}>
      <Icono n={icono} size={19} color={activo ? color : t.muted} fill={activo && icono !== 'compartir' ? color : undefined} />
      {!!n && <Text style={{ color: activo ? color : t.muted, fontSize: 13 }}>{n}</Text>}
    </Pressable>
  );
}

const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

export function Post({ post, detalle }: { post: TPost; detalle?: boolean }) {
  const t = useTheme();
  const [menu, setMenu] = useState(false);
  const [denuncia, setDenuncia] = useState(false);
  const autor = useEstado((e) => e.perfiles[post.autor]);
  const yo = useEstado((e) => e.sesion);
  const likes = useEstado((e) => e.likes.filter((l) => l.postId === post.id).length);
  const meGustaYo = useEstado((e) => e.likes.some((l) => l.postId === post.id && l.userId === e.sesion));
  const rts = useEstado((e) => e.compartidos.filter((l) => l.postId === post.id).length);
  const rtYo = useEstado((e) => e.compartidos.some((l) => l.postId === post.id && l.userId === e.sesion));
  const guardado = useEstado((e) => e.guardados.some((l) => l.postId === post.id && l.userId === e.sesion));
  const respuestas = useEstado((e) => e.posts.filter((p) => p.respuestaA === post.id && !p.oculto).length);
  const respondeA = useEstado((e) => (post.respuestaA ? e.perfiles[e.posts.find((p) => p.id === post.respuestaA)?.autor ?? '']?.usuario : undefined));
  const grupo = useEstado((e) => (post.grupoId ? e.grupos.find((g) => g.id === post.grupoId) : undefined));
  const votosCap = {
    si: useEstado((e) => e.capsulaVotos.filter((x) => x.postId === post.id && x.acierto).length),
    no: useEstado((e) => e.capsulaVotos.filter((x) => x.postId === post.id && !x.acierto).length),
  };
  const miVotoCap = useEstado((e) => e.capsulaVotos.find((x) => x.postId === post.id && x.userId === e.sesion)?.acierto);
  if (!autor) return null;
  const mio = yo === post.autor;
  const sellada = !capsulaAbierta(post);

  return (
    <Pressable onPress={() => !detalle && router.push(`/post/${post.id}`)}
      style={{ flexDirection: 'row', gap: 12, padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: t.line, backgroundColor: t.bg }}>
      <Pressable onPress={() => router.push(`/u/${autor.usuario}`)}>
        <Avatar nombre={autor.nombre} color={autor.avatarColor} />
      </Pressable>
      <View style={{ flex: 1 }}>
        {grupo && <Text style={{ color: t.muted, fontSize: 12, marginBottom: 2 }} onPress={() => router.push(`/grupo/${grupo.id}`)}>En {grupo.nombre}</Text>}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ color: t.text, fontWeight: '700', fontSize: 15, flexShrink: 1 }} numberOfLines={1}>{autor.nombre}</Text>
          {autor.verificado && <Icono n="check" size={14} color={t.accent} />}
          <Text style={{ color: t.muted, fontSize: 14, flexShrink: 1 }} numberOfLines={1}>@{autor.usuario} · {hace(post.creado)}</Text>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => setMenu(true)} hitSlop={10} accessibilityLabel="Más opciones"><Icono n="mas" size={18} color={t.muted} /></Pressable>
        </View>
        {respondeA && <Text style={{ color: t.muted, fontSize: 13 }}>Respondiendo a <Text style={{ color: t.accent }}>@{respondeA}</Text></Text>}
        {sellada && !mio ? (
          <View style={{ marginTop: 8, padding: 16, borderRadius: 16, backgroundColor: t.chip, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Icono n="candado" color={t.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontWeight: '800' }}>Cápsula del tiempo sellada</Text>
              <Text style={{ color: t.muted }}>Se abre el {fecha(post.abreEl!)}. Nadie puede leerla antes, ni editarla.</Text>
            </View>
          </View>
        ) : (
          <>
            {post.abreEl && (
              <Text style={{ color: t.accent, fontSize: 12, fontWeight: '800', marginTop: 4 }}>
                {sellada ? `CÁPSULA SELLADA · SOLO TÚ LA VES HASTA EL ${fecha(post.abreEl).toUpperCase()}` : `CÁPSULA DEL TIEMPO · ESCRITA ${hace(post.creado).toUpperCase()} · ABIERTA EL ${fecha(post.abreEl).toUpperCase()}`}
              </Text>
            )}
            {!!post.texto && <View style={{ marginTop: 2 }}><TextoRico texto={post.texto} tamaño={detalle ? 18 : 16} /></View>}
            {post.medios.map((m, i) => <MedioVista key={i} m={m} />)}
            {post.abreEl && !sellada && (
              <View style={{ marginTop: 10, gap: 6 }}>
                <Text style={{ color: t.text, fontWeight: '700' }}>¿Acertó? <Text style={{ color: t.muted, fontWeight: '400' }}>{votosCap.si} sí · {votosCap.no} no</Text></Text>
                {!mio && (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Boton titulo="Sí, acertó" tipo={miVotoCap === true ? 'primario' : 'secundario'} estilo={{ paddingVertical: 6 }} onPress={() => votarCapsula(post.id, true)} />
                    <Boton titulo="No" tipo={miVotoCap === false ? 'primario' : 'secundario'} estilo={{ paddingVertical: 6 }} onPress={() => votarCapsula(post.id, false)} />
                  </View>
                )}
              </View>
            )}
          </>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, maxWidth: 360 }}>
          <Accion icono="respuesta" n={respuestas} color={t.accent} etiqueta="Responder" onPress={() => router.push({ pathname: '/publicar', params: { respuestaA: post.id } })} />
          <Accion icono="compartir" n={rts} activo={rtYo} color={t.ok} etiqueta="Compartir" onPress={() => compartir(post.id)} />
          <Accion icono="corazon" n={likes} activo={meGustaYo} color={t.danger} etiqueta="Me gusta" onPress={() => meGusta(post.id)} />
          <Accion icono="guardar" activo={guardado} color={t.accent} etiqueta="Guardar" onPress={() => guardar(post.id)} />
        </View>
      </View>

      <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
        <Pressable style={{ flex: 1, backgroundColor: '#0008', justifyContent: 'flex-end' }} onPress={() => setMenu(false)}>
          <View style={{ backgroundColor: t.card, padding: 12, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            {mio ? (
              <Opcion t="Borrar publicación" peligro onPress={() => { borrarPost(post.id); setMenu(false); if (detalle) router.back(); }} />
            ) : (
              <>
                <Opcion t={`Silenciar a @${autor.usuario}`} onPress={() => { silenciar(autor.id); setMenu(false); }} />
                <Opcion t={`Bloquear a @${autor.usuario}`} onPress={() => { bloquear(autor.id); setMenu(false); }} />
                <Opcion t="Denunciar publicación" peligro onPress={() => { setMenu(false); setDenuncia(true); }} />
              </>
            )}
            <Opcion t="Cancelar" onPress={() => setMenu(false)} />
          </View>
        </Pressable>
      </Modal>
      <HojaDenuncia visible={denuncia} onCerrar={() => setDenuncia(false)} objetivo={{ tipo: 'post', id: post.id }} />
    </Pressable>
  );
}

export function Opcion({ t: texto, onPress, peligro }: { t: string; onPress: () => void; peligro?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 14, paddingHorizontal: 8 }}>
      <Text style={{ color: peligro ? t.danger : t.text, fontSize: 16, fontWeight: '600' }}>{texto}</Text>
    </Pressable>
  );
}
