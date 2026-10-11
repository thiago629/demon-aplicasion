# Lunaure · Brilla con luz propia

Red social de lujo (tipo X/Twitter) para Francisco. Negro obsidiana, oro y marfil; logo de media luna dorada en 3D.

App para iPhone, Android y web hecha con **Expo (React Native) + Expo Router + TypeScript**. Base de datos prevista: **Supabase** (PostgreSQL alojado en la UE).

El nombre y el eslogan están en `src/lib/marca.json`; cambiarlos ahí cambia toda la app y los textos legales.

## Qué hace ya

- **Mensajes**: chats directos y de grupo con **racha** (🔥 si escribís los dos cada día; en grupos, la mitad o mínimo 3). «Enviar a Rachi» salva la racha.
- **Aura**: asistente de IA con aviso de que es una IA (AI Act). En la demo responde con textos fijos; en producción usa Claude a través de `supabase/functions/aura` (la clave nunca va en la app).
- **Seguridad**: puntuación de la cuenta, verificación en dos pasos, llave de acceso, alertas de inicio y cierre de sesión en otros dispositivos. Ver `docs/seguridad.md`.
- **Arena**: duelos de memes y predicciones con puntos (sin valor económico). **Cápsulas** del tiempo y **Ring**.

- Registro con fecha de nacimiento (mínimo 16 años) y aceptación de Términos y Privacidad. Cada aceptación se guarda con la versión del documento y la fecha.
- Las cuentas de 16 y 17 años son privadas por defecto.
- Inicio con dos pestañas: **Para ti** (por interacción) y **Siguiendo** (orden cronológico, sin algoritmo).
- Publicar texto (500 caracteres), fotos, vídeos y **memes** (imagen con texto arriba y abajo). Las fotos se suben sin datos EXIF (ubicación).
- `#temas` y `@menciones` clicables, página de cada tema, tendencias y buscador.
- Me gusta, compartir, responder, guardar.
- Perfiles, seguir, cuenta privada.
- **Grupos** públicos o privados: crear, unirse, publicar dentro.
- Notificaciones (menciones, respuestas, seguidores, me gusta, moderación) con botón para **recurrir** decisiones de moderación.
- Denunciar publicaciones, perfiles y grupos; bloquear y silenciar.
- Ajustes: editar perfil, cuenta privada, analítica sí/no, **descargar mis datos**, **borrar mi cuenta** (se oculta al momento y se borra en 30 días), enlaces a los documentos legales.
- Aviso de cookies con Aceptar y Rechazar del mismo tamaño.
- Página pública `/eliminar-cuenta` (la exige Google Play).

## Dónde se guardan los datos personales

En `supabase/migrations/0001_inicial.sql`:

| Esquema | Qué guarda | Quién lo ve |
|---|---|---|
| `public` | Perfil público, posts, grupos, seguidores… | Según las reglas RLS de cada tabla |
| `privado` | Email, teléfono, fecha de nacimiento, IP de alta, consentimientos, solicitudes RGPD | Solo el propio usuario y el equipo autorizado |
| `auditoria` | Registro automático de cada cambio sobre datos personales | Solo el equipo autorizado |

Los textos legales vienen del hilo legal (`app-francisco/legal/`). Para actualizarlos dentro de la app:

```bash
node scripts/sync-legal.mjs /mnt/project-files/app-francisco/legal
```

## Cómo probarla

```bash
npm install
npx expo start          # escanear el QR con Expo Go en el móvil
npx expo start --web    # en el navegador
```

Ahora mismo funciona en **modo demostración**: los datos viven en el propio dispositivo y la contraseña no se comprueba.

## Pasos para lanzarla de verdad

1. Crear un proyecto en Supabase en región **UE (Frankfurt o París)** a nombre de la empresa de Francisco, y firmar su DPA (contrato de encargado del tratamiento).
2. Ejecutar `supabase/migrations/0001_inicial.sql` y `0002_chats_asistente_seguridad.sql` y activar la tarea diaria `privado.purgar_cuentas()` con pg_cron.
3. Poner `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` en `.env` y cambiar las funciones de `src/lib/store.ts` por llamadas a Supabase (mismas tablas y nombres).
4. Contraseñas: las gestiona Supabase Auth (bcrypt). Si se añade acceso con Google, añadir también «Iniciar sesión con Apple» (lo exige Apple).
5. Quitar metadatos de fotos y vídeos también en el servidor (Edge Function al subir al bucket `medios`).
6. iOS: añadir el aviso de seguimiento ATT si se usa analítica de terceros.
7. Cuentas de desarrollador: Apple (99 $/año) y Google Play (25 $ una vez), y publicar con `eas build` y `eas submit`.

## Pasarla a Rork

Rork genera apps con este mismo stack (Expo + React Native + TypeScript). Para continuar allí: subir esta carpeta a un repositorio de GitHub e importarlo en Rork, o pegar las pantallas de `app/` como punto de partida.

## Publicar en Vercel (versión web)

El archivo `vercel.json` ya tiene la configuración: Vercel ejecuta `npx expo export --platform web` y publica la carpeta `dist`.

1. Entra en vercel.com con tu cuenta de GitHub y pulsa **Add New > Project**.
2. Elige este repositorio y pulsa **Deploy**. No hay que cambiar nada más.

Es una app de prueba: los datos se guardan solo en el navegador de cada persona. Antes de abrirla al público de verdad hay que conectar Supabase en la UE y que un abogado revise los textos de `docs/legal`.

## Documentos

- `docs/legal`: borradores legales (privacidad, términos, normas, aviso legal, cookies, denuncias, contrato con proveedores) y el archivo de privacidad.
- `docs/prompts`: textos para crear la app en Stitch y Rocket.
