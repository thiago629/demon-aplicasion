// Edge Function "aura": el asistente de Lunaure.
// La clave de Anthropic vive solo aquí, como secreto: `supabase secrets set ANTHROPIC_API_KEY=...`.
// La app nunca la ve; llama a esta función con el token de sesión del usuario.
import { createClient } from 'npm:@supabase/supabase-js@2';

const MODELO = Deno.env.get('AURA_MODELO') ?? 'claude-sonnet-5-5';
const LIMITE_POR_HORA = 30;
const SISTEMA = `Eres Aura, el asistente de la red social Lunaure. Respondes en español, breve y amable.
Ayudas con: rachas y Rachi, Arena (duelos y predicciones con puntos sin valor económico), cápsulas, grupos,
privacidad (RGPD), seguridad de la cuenta y denuncias. No das consejo legal ni médico, no pides contraseñas
ni datos personales, y si alguien está en peligro le indicas el 112 y el 024.`;

const CORS = { 'Access-Control-Allow-Origin': 'https://lunaure.com', 'Access-Control-Allow-Headers': 'authorization, content-type' };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return new Response('Método no permitido', { status: 405, headers: CORS });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Inicia sesión', { status: 401, headers: CORS });

  const { texto } = await req.json().catch(() => ({ texto: '' }));
  if (typeof texto !== 'string' || !texto.trim() || texto.length > 1000)
    return new Response('Pregunta no válida', { status: 400, headers: CORS });

  // Límite de uso por persona (evita abusos y facturas sorpresa)
  const haceUnaHora = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await supabase.schema('privado').from('asistente_mensajes')
    .select('id', { count: 'exact', head: true }).eq('rol', 'yo').gte('creado', haceUnaHora);
  if ((count ?? 0) >= LIMITE_POR_HORA) return new Response('Has llegado al límite por hoy. Prueba más tarde.', { status: 429, headers: CORS });

  await supabase.schema('privado').from('asistente_mensajes').insert({ user_id: user.id, rol: 'yo', texto });
  const { data: historial } = await supabase.schema('privado').from('asistente_mensajes')
    .select('rol, texto').order('creado', { ascending: false }).limit(12);

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODELO, max_tokens: 600, system: SISTEMA,
      messages: (historial ?? []).reverse().map((m) => ({ role: m.rol === 'yo' ? 'user' : 'assistant', content: m.texto })),
    }),
  });
  if (!r.ok) return new Response('Aura no está disponible ahora mismo', { status: 502, headers: CORS });
  const respuesta = (await r.json()).content?.find((c: { type: string }) => c.type === 'text')?.text ?? '';

  // La respuesta la guarda el servidor con la service role (el usuario no puede escribir como "aura")
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  await admin.schema('privado').from('asistente_mensajes').insert({ user_id: user.id, rol: 'aura', texto: respuesta.slice(0, 4000) });

  return Response.json({ texto: respuesta }, { headers: CORS });
});
