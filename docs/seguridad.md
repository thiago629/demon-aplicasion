# Seguridad de Lunaure

Resumen de cómo se protege la app y qué falta para producción. Lo revisa el equipo técnico antes del lanzamiento y, si es posible, una auditoría externa (pentest).

## Qué protegemos y de quién

| Riesgo | Medida |
|---|---|
| Alguien lee mensajes o datos de otra persona | RLS en todas las tablas (`0001`, `0002`): cada consulta se filtra por `auth.uid()` en la base de datos, no en la app. |
| Robo de contraseña | Supabase Auth guarda solo un hash bcrypt. Verificación en dos pasos (TOTP) y llaves de acceso (passkeys/WebAuthn). |
| Fuerza bruta | Límite de intentos de Supabase Auth + CAPTCHA (hCaptcha o Turnstile) en registro y acceso. |
| Sesión robada | Pantalla **Seguridad**: ver dispositivos y cerrar sesión en remoto; alerta si se entra desde un dispositivo nuevo. |
| Claves filtradas | La app solo lleva la clave pública `anon`. La clave de la IA y la `service_role` viven como secretos en el servidor (Edge Functions). Nunca en el repositorio. |
| Abuso del asistente | Edge Function `aura`: exige sesión, máximo 30 preguntas por hora, 1000 caracteres por pregunta. |
| Ataques web (XSS, clickjacking) | `vercel.json`: CSP sin scripts externos, `X-Frame-Options: DENY`, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`. |
| Datos en tránsito y en reposo | HTTPS/TLS siempre. Supabase cifra disco y copias (AES-256) en la región UE. |
| Fotos con ubicación | Se quitan los datos EXIF al subir (app) y en el servidor (pendiente: Edge Function del bucket `medios`). |
| Fugas de datos | Datos personales en el esquema `privado`, separado de lo público, con registro de auditoría. Plan de respuesta: avisar a la AEPD en 72 horas (art. 33 RGPD). |

## Lo que NO prometemos todavía

- **Cifrado de extremo a extremo** de los mensajes: no está hecho. Los mensajes están cifrados en tránsito y en reposo, pero el servidor podría leerlos. Si se quiere E2E, usar el protocolo Signal (libsignal) y revisar el impacto en moderación y DSA. En la app se anuncia solo como «próximamente».
- La pantalla de Seguridad de la demo guarda los ajustes en el dispositivo. Con Supabase conectado, 2FA y passkeys se activan con `supabase.auth.mfa` y WebAuthn.

## Antes de lanzar

1. Activar MFA y CAPTCHA en Supabase Auth; política de contraseñas de 10+ caracteres y comprobación de contraseñas filtradas.
2. `supabase secrets set ANTHROPIC_API_KEY=...` y desplegar `supabase/functions/aura`.
3. Revisar todas las políticas RLS con el asesor de seguridad de Supabase (`supabase db lint`).
4. Activar `pg_cron` para `privado.purgar_cuentas()` y `privado.purgar_registros()`.
5. Dependabot o `npm audit` en cada build; no subir nunca `.env` (está en `.gitignore`).
6. Pentest externo y revisión de un abogado de los textos de `docs/legal`.
