import { useState } from 'react';
import { Platform, Pressable, ScrollView, Share, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../src/lib/theme';
import { actualizarPerfil, borrarMiCuenta, decidirCookies, exportarMisDatos, salir, useEstado } from '../src/lib/store';
import { DOCUMENTOS } from '../src/lib/legal';
import { Boton, Cabecera, Campo, Icono } from '../src/components/ui';

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderColor: t.line }}>
      <Text style={{ color: t.muted, fontWeight: '800', fontSize: 13, letterSpacing: 0.5 }}>{titulo.toUpperCase()}</Text>
      {children}
    </View>
  );
}


const SIN_CONSENT: never[] = [];

export default function Ajustes() {
  const t = useTheme();
  const yo = useEstado((e) => e.perfiles[e.sesion ?? '']);
  const datos = useEstado((e) => e.privado.datos[e.sesion ?? '']);
  const consent = useEstado((e) => e.privado.consentimientos[e.sesion ?? ''] ?? SIN_CONSENT);
  const analitica = useEstado((e) => e.cookies.analitica);
  const [nombre, setNombre] = useState(yo?.nombre ?? '');
  const [bio, setBio] = useState(yo?.bio ?? '');
  const [confirmar, setConfirmar] = useState(false);
  const [json, setJson] = useState<string | null>(null);
  if (!yo) return null;

  return (
    <View style={{ flex: 1 }}>
      <Cabecera titulo="Ajustes" izquierda={<Pressable onPress={() => router.back()}><Icono n="atras" /></Pressable>} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}>
        <Seccion titulo="Tu perfil">
          <Campo etiqueta="Nombre" value={nombre} onChangeText={setNombre} maxLength={50} />
          <Campo etiqueta="Biografía" value={bio} onChangeText={setBio} maxLength={160} multiline />
          <Boton titulo="Guardar" tipo="secundario" onPress={() => actualizarPerfil({ nombre: nombre.trim() || yo.nombre, bio })} />
        </Seccion>

        <Seccion titulo="Cuenta y seguridad">
          {([['escudo', 'Seguridad', 'Verificación en dos pasos, llave de acceso y dispositivos', '/seguridad'],
            ['chispa', 'Asistente Aura', 'Resuelve dudas sobre la app y tu privacidad', '/asistente'],
            ['candado', 'Archivo de privacidad', 'Qué datos guardamos, dónde y para qué', '/archivo-privacidad']] as const).map(([ic, titulo, desc, ruta]) => (
            <Pressable key={ruta} onPress={() => router.push(ruta)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: t.chip, alignItems: 'center', justifyContent: 'center' }}><Icono n={ic} color={t.accent} size={19} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontWeight: '600' }}>{titulo}</Text>
                <Text style={{ color: t.muted, fontSize: 13 }}>{desc}</Text>
              </View>
              <Text style={{ color: t.muted, fontSize: 20 }}>›</Text>
            </Pressable>
          ))}
        </Seccion>

        <Seccion titulo="Privacidad">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontWeight: '600' }}>Cuenta privada</Text>
              <Text style={{ color: t.muted, fontSize: 13 }}>Solo tus seguidores ven lo que publicas.</Text>
            </View>
            <Switch value={yo.privado} onValueChange={(v) => actualizarPerfil({ privado: v })} trackColor={{ true: t.accent }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontWeight: '600' }}>Medición anónima de uso</Text>
              <Text style={{ color: t.muted, fontSize: 13 }}>Nos ayuda a mejorar la app. Puedes cambiarlo cuando quieras.</Text>
            </View>
            <Switch value={analitica} onValueChange={decidirCookies} trackColor={{ true: t.accent }} />
          </View>
        </Seccion>

        <Seccion titulo="Tus datos">
          <Text style={{ color: t.muted, fontSize: 13 }}>
            Datos personales guardados aparte (solo los ves tú): email {datos?.email}, fecha de nacimiento {datos?.fechaNacimiento}, país {datos?.pais}.
          </Text>
          <Text style={{ color: t.muted, fontSize: 13 }}>
            Consentimientos: {consent.map((c) => `${c.tipo} v${c.versionDoc} (${c.aceptado ? 'sí' : 'no'}, ${new Date(c.fecha).toLocaleDateString('es-ES')})`).join(' · ')}
          </Text>
          <Boton titulo="Descargar mis datos" tipo="secundario" onPress={() => {
            const datosJson = exportarMisDatos();
            // En móvil se comparte el archivo; en la web se muestra para copiarlo
            if (Platform.OS === 'web') setJson(datosJson);
            else Share.share({ title: `mis-datos-${yo.usuario}.json`, message: datosJson });
          }} />
          {json && (
            <View style={{ gap: 8 }}>
              <ScrollView style={{ maxHeight: 220, backgroundColor: t.card, borderRadius: 12, borderWidth: 1, borderColor: t.line }} contentContainerStyle={{ padding: 12 }}>
                <Text selectable style={{ color: t.text, fontFamily: Platform.select({ web: 'monospace', default: undefined }), fontSize: 12 }}>{json}</Text>
              </ScrollView>
              <Boton titulo="Copiar" tipo="secundario" onPress={() => { navigator.clipboard?.writeText(json).catch(() => {}); }} />
            </View>
          )}
        </Seccion>

        <Seccion titulo="Archivo de privacidad">
          <Text style={{ color: t.muted, fontSize: 13 }}>Vista del responsable de privacidad: dónde se guardan los datos privados de quienes se registran.</Text>
          <Boton titulo="Abrir el archivo de datos privados" tipo="secundario" onPress={() => router.push('/archivo-privacidad')} />
        </Seccion>

        <Seccion titulo="Información legal">
          {DOCUMENTOS.map((d) => (
            <Pressable key={d.slug} onPress={() => router.push(`/legal/${d.slug}`)} style={{ paddingVertical: 4 }}>
              <Text style={{ color: t.text, fontSize: 16 }}>{d.titulo}</Text>
            </Pressable>
          ))}
        </Seccion>

        <Seccion titulo="Cuenta">
          <Boton titulo="Cerrar sesión" tipo="secundario" onPress={() => { salir(); router.replace('/bienvenida'); }} />
          {confirmar ? (
            <View style={{ gap: 10 }}>
              <Text style={{ color: t.text }}>
                Tu perfil y lo que has publicado dejarán de verse ahora mismo y se borrarán del todo en un máximo de 30 días. Descarga antes tus datos si los quieres.
              </Text>
              <Boton titulo="Sí, borrar mi cuenta" tipo="peligro" onPress={() => { borrarMiCuenta(); router.replace('/bienvenida'); }} />
              <Boton titulo="Cancelar" tipo="secundario" onPress={() => setConfirmar(false)} />
            </View>
          ) : (
            <Boton titulo="Borrar mi cuenta" tipo="peligro" onPress={() => setConfirmar(true)} />
          )}
        </Seccion>
      </ScrollView>
    </View>
  );
}
