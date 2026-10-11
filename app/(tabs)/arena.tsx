// Arena: las funciones exclusivas de competición (El Ring y el Duelo de memes)
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../src/lib/theme';
import {
  apostar, clasificacionDuelo, estadoDebate, prediccionAbierta, puntos, rankingPuntos, ganadorDebate, rankingRing, siguienteCombate, turnoDe, useEstado, votarDuelo,
} from '../../src/lib/store';
import type { Debate, Prediccion } from '../../src/lib/types';
import { Avatar, Boton, Cabecera, Icono, Pestañas } from '../../src/components/ui';
import { MedioVista } from '../../src/components/Post';

const ETIQUETA = { abierto: 'Reto abierto', en_curso: 'En juego', votacion: 'Votación abierta', cerrado: 'Terminado' };

export function FilaDebate({ d }: { d: Debate }) {
  const t = useTheme();
  const perfiles = useEstado((e) => e.perfiles);
  const yo = useEstado((e) => e.sesion);
  const est = estadoDebate(d);
  const a = perfiles[d.retador];
  const b = d.rival ? perfiles[d.rival] : undefined;
  const g = ganadorDebate(d);
  const miTurno = turnoDe(d) === yo;
  return (
    <Pressable onPress={() => router.push(`/ring/${d.id}`)} style={{ padding: 16, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: t.line }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ backgroundColor: est === 'votacion' || miTurno ? t.accent : t.chip, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
          <Text style={{ color: est === 'votacion' || miTurno ? t.accentText : t.muted, fontSize: 12, fontWeight: '700' }}>{miTurno ? 'Te toca' : ETIQUETA[est]}</Text>
        </View>
        <Text style={{ color: t.muted, fontSize: 12 }}>{d.turnos.length}/6 intervenciones · {d.votos.length} votos</Text>
      </View>
      <Text style={{ color: t.text, fontSize: 17, fontWeight: '800' }}>{d.tema}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {a && <Avatar nombre={a.nombre} color={a.avatarColor} size={26} />}
        <Text style={{ color: t.text, fontWeight: g === d.retador ? '800' : '500' }}>@{a?.usuario}{g === d.retador ? ' 🏆' : ''}</Text>
        <Text style={{ color: t.muted, fontWeight: '800' }}>VS</Text>
        {b ? <><Avatar nombre={b.nombre} color={b.avatarColor} size={26} /><Text style={{ color: t.text, fontWeight: g === d.rival ? '800' : '500' }}>@{b.usuario}{g === d.rival ? ' 🏆' : ''}</Text></>
          : <Text style={{ color: t.accent, fontWeight: '700' }}>¿Quién se atreve?</Text>}
      </View>
    </Pressable>
  );
}

function Ring() {
  const t = useTheme();
  const debates = useEstado((e) => e.debates);
  const e = useEstado((x) => x);
  const ranking = useMemo(() => rankingRing(e), [e]);
  const orden = { votacion: 0, en_curso: 1, abierto: 2, cerrado: 3 };
  const lista = [...debates].sort((a, b) => orden[estadoDebate(a)] - orden[estadoDebate(b)]);
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={{ padding: 16, gap: 10 }}>
        <Text style={{ color: t.text, fontSize: 15 }}>Reta a alguien a un debate: 3 intervenciones cada uno y la gente vota quién gana durante 24 horas.</Text>
        <Boton titulo="Retar a alguien" onPress={() => router.push('/ring/nuevo')} />
      </View>
      {ranking.length > 0 && (
        <View style={{ marginHorizontal: 16, padding: 14, borderRadius: 16, backgroundColor: t.chip, gap: 6 }}>
          <Text style={{ color: t.muted, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 }}>CAMPEONES DEL RING</Text>
          {ranking.slice(0, 5).map((r, i) => (
            <Text key={r.userId} style={{ color: t.text }}>{i + 1}. @{e.perfiles[r.userId]?.usuario} · {r.victorias} {r.victorias === 1 ? 'victoria' : 'victorias'}</Text>
          ))}
        </View>
      )}
      {lista.map((d) => <FilaDebate key={d.id} d={d} />)}
    </ScrollView>
  );
}

function DueloMemes() {
  const t = useTheme();
  const e = useEstado((x) => x);
  const combate = siguienteCombate(e);
  const tabla = clasificacionDuelo(e);
  const dias = Math.max(0, Math.ceil((Date.parse(e.duelo.fin) - Date.now()) / 864e5));
  const campeon = e.duelo.campeonAnterior ? e.perfiles[e.duelo.campeonAnterior.userId] : undefined;
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 120 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ color: t.muted, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 }}>TEMA DE LA SEMANA · QUEDAN {dias} DÍAS</Text>
        <Text style={{ color: t.text, fontSize: 26, fontWeight: '900' }}>{e.duelo.tema}</Text>
        <Text style={{ color: t.muted }}>Sube tu meme con #{e.duelo.hashtag}. Los memes se enfrentan por parejas y el que más combates gane se lleva la corona.</Text>
        {campeon && <Text style={{ color: t.text, marginTop: 4 }}>👑 Campeón anterior ({e.duelo.campeonAnterior!.tema}): <Text style={{ fontWeight: '800' }}>@{campeon.usuario}</Text></Text>}
      </View>
      <Boton titulo="Participar con mi meme" onPress={() => router.push({ pathname: '/publicar', params: { duelo: e.duelo.hashtag } })} />
      <Text style={{ color: t.text, fontSize: 18, fontWeight: '800' }}>¿Cuál es mejor?</Text>
      {combate ? (
        <View style={{ gap: 12 }}>
          {combate.map((p, i) => {
            const otro = combate[1 - i];
            return (
              <View key={p.id} style={{ gap: 8 }}>
                <Text style={{ color: t.muted, fontSize: 13 }}>@{e.perfiles[p.autor]?.usuario}</Text>
                {p.medios[0] && <MedioVista m={p.medios[0]} />}
                <Boton titulo="Este gana" onPress={() => votarDuelo(p.id, otro.id)} />
                {i === 0 && <Text style={{ color: t.muted, textAlign: 'center', fontWeight: '900', fontSize: 18 }}>VS</Text>}
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={{ color: t.muted }}>Has votado todos los combates. Vuelve cuando haya memes nuevos.</Text>
      )}
      <Text style={{ color: t.text, fontSize: 18, fontWeight: '800' }}>Clasificación</Text>
      {tabla.map((r, i) => (
        <Pressable key={r.post.id} onPress={() => router.push(`/post/${r.post.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ color: t.text, fontWeight: '900', width: 26, fontVariant: ['tabular-nums'] }}>{i + 1}.</Text>
          <Text style={{ color: t.text, flex: 1 }} numberOfLines={1}>@{e.perfiles[r.post.autor]?.usuario} · “{r.post.medios[0]?.memeArriba?.toLowerCase()}”</Text>
          <Text style={{ color: t.muted, fontVariant: ['tabular-nums'] }}>{r.victorias} de {r.combates}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function TarjetaPrediccion({ p }: { p: Prediccion }) {
  const t = useTheme();
  const yo = useEstado((e) => e.sesion);
  const [cantidad, setCantidad] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const abierta = prediccionAbierta(p);
  const mia = p.apuestas.find((a) => a.userId === yo);
  const bote = p.apuestas.reduce((s, a) => s + a.puntos, 0);
  const por = (i: number) => p.apuestas.filter((a) => a.opcion === i).reduce((s, a) => s + a.puntos, 0);
  const horas = Math.max(0, Math.round((Date.parse(p.cierre) - Date.now()) / 36e5));
  return (
    <View style={{ padding: 16, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: t.line }}>
      <Text style={{ color: t.muted, fontSize: 12, fontWeight: '700' }}>
        {p.resultado !== undefined ? 'RESUELTA' : abierta ? `CIERRA EN ${horas < 48 ? `${horas} H` : `${Math.round(horas / 24)} DÍAS`}` : 'CERRADA · ESPERANDO RESULTADO'} · BOTE {bote} PUNTOS
      </Text>
      <Text style={{ color: t.text, fontSize: 17, fontWeight: '800' }}>{p.pregunta}</Text>
      {p.opciones.map((o, i) => {
        const pct = bote ? Math.round((por(i) / bote) * 100) : 0;
        const gana = p.resultado === i, elegida = mia?.opcion === i;
        return (
          <Pressable key={i} disabled={!abierta || !!mia} onPress={() => setError(apostar(p.id, i, cantidad))}
            style={{ borderRadius: 12, borderWidth: elegida || gana ? 2 : 1, borderColor: gana ? t.ok : elegida ? t.accent : t.line, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, backgroundColor: t.chip }} />
            <View style={{ flexDirection: 'row', padding: 12, gap: 8 }}>
              <Text style={{ color: t.text, flex: 1, fontWeight: elegida || gana ? '800' : '500' }}>{o}{gana ? '  ✓ Resultado' : ''}{elegida ? `  · tu apuesta (${mia!.puntos})` : ''}</Text>
              <Text style={{ color: t.muted, fontVariant: ['tabular-nums'] }}>{pct} %</Text>
            </View>
          </Pressable>
        );
      })}
      {abierta && !mia && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text style={{ color: t.muted }}>Apostar:</Text>
          {[50, 100, 250].map((c) => (
            <Pressable key={c} onPress={() => setCantidad(c)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: cantidad === c ? t.accent : t.chip }}>
              <Text style={{ color: cantidad === c ? t.accentText : t.text, fontWeight: '700' }}>{c}</Text>
            </Pressable>
          ))}
          <Text style={{ color: t.muted, fontSize: 12 }}>y toca tu opción</Text>
        </View>
      )}
      {error && <Text style={{ color: t.danger }}>{error}</Text>}
    </View>
  );
}

function Predicciones() {
  const t = useTheme();
  const e = useEstado((x) => x);
  const mios = e.sesion ? puntos(e, e.sesion) : 0;
  const ranking = rankingPuntos(e);
  const lista = [...e.predicciones].sort((a, b) => Number(prediccionAbierta(b)) - Number(prediccionAbierta(a)));
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={{ padding: 16, gap: 10 }}>
        <Text style={{ color: t.text, fontSize: 28, fontWeight: '900' }}>{mios} <Text style={{ fontSize: 16, color: t.muted, fontWeight: '600' }}>puntos</Text></Text>
        <Text style={{ color: t.muted }}>Apuesta tus puntos a lo que crees que va a pasar. Si aciertas, te repartes el bote con quienes acertaron.</Text>
        <Boton titulo="Crear una predicción" tipo="secundario" onPress={() => router.push('/prediccion/nueva')} />
        <Text style={{ color: t.muted, fontSize: 12 }}>Los puntos no tienen valor económico: no se compran, no se venden y no se canjean por nada.</Text>
      </View>
      {ranking.length > 0 && (
        <View style={{ marginHorizontal: 16, padding: 14, borderRadius: 16, backgroundColor: t.chip, gap: 6 }}>
          <Text style={{ color: t.muted, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 }}>LOS QUE MÁS ACIERTAN</Text>
          {ranking.slice(0, 5).map((r, i) => (
            <Text key={r.userId} style={{ color: t.text }}>{i + 1}. @{e.perfiles[r.userId]?.usuario} · {r.puntos} puntos</Text>
          ))}
        </View>
      )}
      {lista.map((p) => <TarjetaPrediccion key={p.id} p={p} />)}
    </ScrollView>
  );
}

export default function Arena() {
  const [vista, setVista] = useState<'ring' | 'duelo' | 'pred'>('ring');
  return (
    <View style={{ flex: 1 }}>
      <Cabecera titulo="Arena" izquierda={<Icono n="trofeo" />} />
      <Pestañas opciones={[{ v: 'ring', t: 'El Ring' }, { v: 'duelo', t: 'Duelo memes' }, { v: 'pred', t: 'Predicciones' }]} valor={vista} onCambio={setVista} />
      {vista === 'ring' ? <Ring /> : vista === 'duelo' ? <DueloMemes /> : <Predicciones />}
    </View>
  );
}
