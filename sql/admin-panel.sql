-- ════════════════════════════════════════════════════════════════════
-- PANEL DE ADMINISTRADOR — seguridad de plan/rol + funciones del panel
-- Se ejecuta una vez en Supabase → SQL Editor. Es idempotente: se puede
-- volver a ejecutar sin romper nada.
-- ════════════════════════════════════════════════════════════════════


-- ── 1. SEGURIDAD: un alumno no puede cambiarse el plan ni el rol ─────
-- La política "cada quien edita su propio perfil" deja actualizar TODA la
-- fila, así que cualquiera podía ponerse plan='super_pro' o
-- role='super_admin' desde la consola del navegador. Este trigger lo
-- impide. Las llamadas sin usuario (SQL Editor, service_role, webhooks de
-- pago) siguen pudiendo cambiar ambos campos.
create or replace function public.proteger_plan_y_rol()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if not public.es_admin() then
      new.plan := 'gratis';
      new.role := 'user';
    end if;
    return new;
  end if;

  if new.plan is distinct from old.plan and not public.es_admin() then
    new.plan := old.plan;
  end if;
  if new.role is distinct from old.role and not public.es_super_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists proteger_plan_y_rol on public.profiles;
create trigger proteger_plan_y_rol
  before insert or update on public.profiles
  for each row execute function public.proteger_plan_y_rol();


-- ── 2. AUDITORÍA: quién cambió qué y cuándo ──────────────────────────
create table if not exists public.admin_auditoria (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  admin_id uuid not null,
  usuario_id uuid,
  accion text not null,
  antes jsonb,
  despues jsonb
);
alter table public.admin_auditoria enable row level security;
drop policy if exists "admin lee auditoria" on public.admin_auditoria;
create policy "admin lee auditoria" on public.admin_auditoria
  for select using (public.es_admin());


-- ── 3. ALCANCE: a qué alumnos puede tocar este admin ─────────────────
-- Super admin: a todos. Admin: solo a los de los grupos que él creó.
create or replace function public.admin_alcanza(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select public.es_super_admin()
      or (public.es_admin() and exists (
            select 1 from public.profiles p
            where p.id = p_user_id
              and p.english_group in (select nombre from public.grupos_ingles where creador_id = auth.uid())
          ));
$$;


-- ── 4. LISTADO DE USUARIOS (ahora con plan, rol, teléfono y fechas) ──
drop function if exists public.admin_listar_usuarios(text);
create function public.admin_listar_usuarios(busqueda text default null)
returns table(
  id uuid, full_name text, email text, phone text, english_group text, nivel text,
  plan text, role text, points integer, lingots numeric, racha_dias integer,
  palabras_dominadas integer, palabras_estudiadas integer,
  creado timestamptz, ultimo_acceso timestamptz, consiente_contacto boolean
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    p.id, p.full_name, u.email::text, p.phone, p.english_group, p.nivel,
    coalesce(p.plan, 'gratis'), coalesce(p.role, 'user'),
    p.points, p.lingots,
    coalesce((p.flujo -> 'racha' ->> 'days')::int, 0),
    coalesce((select count(*) from jsonb_each(coalesce(p.flujo -> 'srs', '{}'::jsonb)) s(k, d)
              where (s.d ->> 'learned')::boolean is true), 0)::int,
    coalesce((select count(*) from jsonb_each(coalesce(p.flujo -> 'srs', '{}'::jsonb))), 0)::int,
    u.created_at, u.last_sign_in_at, p.consiente_contacto
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.es_admin()
    and (public.es_super_admin()
         or p.english_group in (select nombre from public.grupos_ingles where creador_id = auth.uid()))
    and (busqueda is null or busqueda = ''
         or p.full_name ilike '%' || busqueda || '%'
         or u.email ilike '%' || busqueda || '%'
         or p.phone ilike '%' || busqueda || '%')
  order by u.created_at desc nulls last;
$$;


-- ── 5. CAMBIAR PLAN ──────────────────────────────────────────────────
create or replace function public.admin_cambiar_plan(p_user_id uuid, p_plan text)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare v_antes text;
begin
  if not public.admin_alcanza(p_user_id) then
    raise exception 'Sin permiso sobre este usuario';
  end if;
  if p_plan not in ('gratis', 'plus', 'pro', 'super_pro') then
    raise exception 'Plan no válido: %', p_plan;
  end if;
  select plan into v_antes from public.profiles where id = p_user_id;
  update public.profiles set plan = p_plan, updated_at = now() where id = p_user_id;
  insert into public.admin_auditoria(admin_id, usuario_id, accion, antes, despues)
  values (auth.uid(), p_user_id, 'plan', to_jsonb(v_antes), to_jsonb(p_plan));
  return p_plan;
end;
$$;


-- ── 6. CAMBIAR ROL (solo super admin) ────────────────────────────────
create or replace function public.admin_cambiar_rol(p_user_id uuid, p_role text)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare v_antes text;
begin
  if not public.es_super_admin() then
    raise exception 'Solo un super admin puede cambiar roles';
  end if;
  if p_role not in ('user', 'admin', 'super_admin') then
    raise exception 'Rol no válido: %', p_role;
  end if;
  if p_user_id = auth.uid() then
    raise exception 'No puedes cambiar tu propio rol';
  end if;
  select role into v_antes from public.profiles where id = p_user_id;
  update public.profiles set role = p_role, updated_at = now() where id = p_user_id;
  insert into public.admin_auditoria(admin_id, usuario_id, accion, antes, despues)
  values (auth.uid(), p_user_id, 'rol', to_jsonb(v_antes), to_jsonb(p_role));
  return p_role;
end;
$$;


-- ── 7. EDITAR DATOS DEL ALUMNO (nombre, teléfono, nivel, puntos, lingots)
create or replace function public.admin_editar_usuario(
  p_user_id uuid, p_full_name text, p_phone text, p_nivel text, p_points integer, p_lingots numeric
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare v_antes jsonb;
begin
  if not public.admin_alcanza(p_user_id) then
    raise exception 'Sin permiso sobre este usuario';
  end if;
  if p_nivel not in ('A1', 'A2', 'B1', 'B2') then
    raise exception 'Nivel no válido: %', p_nivel;
  end if;
  select jsonb_build_object('full_name', full_name, 'phone', phone, 'nivel', nivel, 'points', points, 'lingots', lingots)
    into v_antes from public.profiles where id = p_user_id;
  update public.profiles
     set full_name = p_full_name, phone = p_phone, nivel = p_nivel,
         points = greatest(p_points, 0), lingots = greatest(p_lingots, 0), updated_at = now()
   where id = p_user_id;
  insert into public.admin_auditoria(admin_id, usuario_id, accion, antes, despues)
  values (auth.uid(), p_user_id, 'datos', v_antes,
          jsonb_build_object('full_name', p_full_name, 'phone', p_phone, 'nivel', p_nivel, 'points', p_points, 'lingots', p_lingots));
end;
$$;


-- ── 8. ANALÍTICAS DE LA WEB ──────────────────────────────────────────
create or replace function public.admin_analitica(p_dias integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare
  desde timestamptz := now() - make_interval(days => greatest(p_dias, 1));
  r jsonb;
begin
  if not public.es_admin() then
    raise exception 'Solo administradores';
  end if;

  with v as (select * from public.page_visits where visited_at >= desde and coalesce(es_bot, false) = false)
  select jsonb_build_object(
    'resumen', (select jsonb_build_object(
        'visitas', count(*),
        'visitantes', count(distinct visitor_id),
        'sesiones', count(distinct session_id),
        'usuarios_logueados', count(distinct user_id),
        'duracion_media_s', round(avg(duracion_ms) / 1000.0),
        'rebote_pct', round(100.0 * avg(case when rebote then 1 else 0 end)),
        'scroll_medio', round(avg(scroll_max))
      ) from v),
    'por_dia', coalesce((select jsonb_agg(x order by x->>'dia') from (
        select jsonb_build_object('dia', to_char(date_trunc('day', visited_at), 'YYYY-MM-DD'),
                                  'visitas', count(*), 'visitantes', count(distinct visitor_id)) x
        from v group by date_trunc('day', visited_at)) t), '[]'),
    'paginas', coalesce((select jsonb_agg(x) from (
        select jsonb_build_object('nombre', coalesce(path, '—'), 'n', count(*)) x
        from v group by path order by count(*) desc limit 10) t), '[]'),
    'paises', coalesce((select jsonb_agg(x) from (
        select jsonb_build_object('nombre', coalesce(pais, 'Desconocido'), 'n', count(distinct visitor_id)) x
        from v group by pais order by count(distinct visitor_id) desc limit 10) t), '[]'),
    'ciudades', coalesce((select jsonb_agg(x) from (
        select jsonb_build_object('nombre', coalesce(ciudad, '—') || coalesce(' · ' || pais_codigo, ''), 'n', count(distinct visitor_id)) x
        from v group by ciudad, pais_codigo order by count(distinct visitor_id) desc limit 10) t), '[]'),
    'dispositivos', coalesce((select jsonb_agg(x) from (
        select jsonb_build_object('nombre', coalesce(device_type, '—'), 'n', count(distinct visitor_id)) x
        from v group by device_type order by count(distinct visitor_id) desc) t), '[]'),
    'navegadores', coalesce((select jsonb_agg(x) from (
        select jsonb_build_object('nombre', coalesce(navegador, '—') || ' / ' || coalesce(so, '—'), 'n', count(distinct visitor_id)) x
        from v group by navegador, so order by count(distinct visitor_id) desc limit 8) t), '[]'),
    'origen', coalesce((select jsonb_agg(x) from (
        select jsonb_build_object('nombre', coalesce(utm_source, referrer_dominio, 'Directo'), 'n', count(distinct session_id)) x
        from v group by coalesce(utm_source, referrer_dominio, 'Directo') order by count(distinct session_id) desc limit 10) t), '[]'),
    'botones', coalesce((select jsonb_agg(x) from (
        select jsonb_build_object('nombre', button_name, 'n', count(*)) x
        from public.button_clicks where clicked_at >= desde
        group by button_name order by count(*) desc limit 12) t), '[]'),
    'registros_por_dia', coalesce((select jsonb_agg(x order by x->>'dia') from (
        select jsonb_build_object('dia', to_char(date_trunc('day', created_at), 'YYYY-MM-DD'), 'n', count(*)) x
        from auth.users where created_at >= desde group by date_trunc('day', created_at)) t), '[]'),
    'usuarios', (select jsonb_build_object(
        'total', count(*),
        'nuevos', count(*) filter (where u.created_at >= desde),
        'activos', count(*) filter (where u.last_sign_in_at >= desde)
      ) from auth.users u),
    'planes', coalesce((select jsonb_object_agg(pl, n) from (
        select coalesce(plan, 'gratis') pl, count(*) n from public.profiles group by 1) t), '{}'),
    'interesados_pro', (select count(*) from public.pro_clicks where created_at >= desde)
  ) into r;
  return r;
end;
$$;


-- ── 9. SOPORTE ───────────────────────────────────────────────────────
create or replace function public.admin_soporte_listar()
returns table(id bigint, created_at timestamptz, user_id uuid, email text, nombre text, mensaje text, estado text)
language sql
stable
security definer
set search_path to 'public'
as $$
  select s.id, s.created_at, s.user_id, s.email, p.full_name, s.mensaje, s.estado::text
  from public.soporte s
  left join public.profiles p on p.id = s.user_id
  where public.es_super_admin() or (s.user_id is not null and public.admin_alcanza(s.user_id))
  order by (s.estado = 'abierto') desc, s.created_at desc
  limit 300;
$$;

create or replace function public.admin_soporte_estado(p_id bigint, p_estado text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare v_user uuid;
begin
  select user_id into v_user from public.soporte where id = p_id;
  if not (public.es_super_admin() or (v_user is not null and public.admin_alcanza(v_user))) then
    raise exception 'Sin permiso';
  end if;
  if p_estado not in ('abierto', 'resuelto') then
    raise exception 'Estado no válido';
  end if;
  update public.soporte set estado = p_estado where id = p_id;
end;
$$;


-- ── 10. INTERESADOS EN PAGAR (clics en "Hazte Pro") ──────────────────
create or replace function public.admin_interesados_pro(p_dias integer default 90)
returns table(created_at timestamptz, user_id uuid, email text, nombre text, phone text,
              origen text, plan_pedido text, plan_actual text, nivel text)
language sql
stable
security definer
set search_path to 'public'
as $$
  select c.created_at, c.user_id, c.email, p.full_name, p.phone,
         c.origen, c.plan, coalesce(p.plan, 'gratis'), c.nivel
  from public.pro_clicks c
  left join public.profiles p on p.id = c.user_id
  where c.created_at >= now() - make_interval(days => greatest(p_dias, 1))
    and (public.es_super_admin() or (c.user_id is not null and public.admin_alcanza(c.user_id)))
  order by c.created_at desc
  limit 500;
$$;


-- ── 11. HISTORIAL DE CAMBIOS ─────────────────────────────────────────
create or replace function public.admin_auditoria_listar()
returns table(created_at timestamptz, admin text, usuario text, accion text, antes jsonb, despues jsonb)
language sql
stable
security definer
set search_path to 'public'
as $$
  select a.created_at, coalesce(pa.full_name, ua.email::text), coalesce(pu.full_name, uu.email::text),
         a.accion, a.antes, a.despues
  from public.admin_auditoria a
  left join public.profiles pa on pa.id = a.admin_id
  left join auth.users ua on ua.id = a.admin_id
  left join public.profiles pu on pu.id = a.usuario_id
  left join auth.users uu on uu.id = a.usuario_id
  where public.es_super_admin() or a.admin_id = auth.uid()
  order by a.created_at desc
  limit 200;
$$;


-- ── 12. PERMISOS: solo usuarios logueados (el propio código valida admin)
do $$
declare f text;
begin
  foreach f in array array[
    'admin_listar_usuarios(text)', 'admin_cambiar_plan(uuid,text)', 'admin_cambiar_rol(uuid,text)',
    'admin_editar_usuario(uuid,text,text,text,integer,numeric)', 'admin_analitica(integer)',
    'admin_soporte_listar()', 'admin_soporte_estado(bigint,text)', 'admin_interesados_pro(integer)',
    'admin_auditoria_listar()', 'admin_alcanza(uuid)'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
