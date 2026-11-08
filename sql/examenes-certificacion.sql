-- ============================================================================
-- Exámenes de certificación (certificacion.html + Edge Function evaluar-examen)
-- Ejecutar una vez en el SQL Editor de Supabase (proyecto eylwewhqeaaqkgcxhgyv).
-- ============================================================================

-- 1) Intentos de examen. Solo la Edge Function (service_role) escribe aquí;
--    cada usuario puede leer únicamente los suyos.
create table if not exists public.examenes_certificacion (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  nivel       text not null,
  puntaje     numeric(5,1) not null,
  habilidades jsonb not null default '{}'::jsonb,
  detalle     jsonb not null default '{}'::jsonb,
  aprobado    boolean not null default false,
  creado_en   timestamptz not null default now()
);
create index if not exists examenes_certificacion_user_nivel on public.examenes_certificacion (user_id, nivel, creado_en desc);
alter table public.examenes_certificacion enable row level security;
drop policy if exists "examenes propios" on public.examenes_certificacion;
create policy "examenes propios" on public.examenes_certificacion for select to authenticated using (auth.uid() = user_id);
revoke insert, update, delete on public.examenes_certificacion from anon, authenticated;

-- 2) El certificado guarda cómo se obtuvo y con qué puntaje.
alter table public.certificados add column if not exists tipo text not null default 'vocabulario';
alter table public.certificados add column if not exists puntaje numeric(5,1);

-- 3) emitir_certificado: ahora también lo emite quien APROBÓ el examen del nivel
--    (95 % o más), aunque no tenga todas las palabras dominadas.
drop function if exists public.emitir_certificado(text, text, date);
create function public.emitir_certificado(p_nivel text, p_codigo text, p_fecha date default null)
returns table(codigo text, nombre text, nivel text, fecha date, tipo text, puntaje numeric)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare uid uuid := auth.uid(); v_nombre text; v_flujo jsonb; v_total int; v_ok int;
        v_examen numeric; v_fecha_examen date; v_palabras boolean;
begin
  if uid is null then raise exception 'no autenticado'; end if;
  if p_codigo !~ ('^ABU-' || p_nivel || '-[0-9A-Z]{7}$') then raise exception 'codigo invalido'; end if;
  select full_name, flujo into v_nombre, v_flujo from profiles where id = uid;
  v_nombre := trim(coalesce(v_nombre, ''));
  if v_nombre = '' then raise exception 'sin nombre'; end if;

  select e.puntaje, (e.creado_en at time zone 'America/Bogota')::date into v_examen, v_fecha_examen
    from examenes_certificacion e where e.user_id = uid and upper(e.nivel) = upper(p_nivel) and e.aprobado
    order by e.puntaje desc, e.creado_en limit 1;

  select count(*), count(*) filter (where (v_flujo->'srs'->(p.id::text)->>'learned')::boolean is true)
    into v_total, v_ok from palabras p where upper(p.nivel) = upper(p_nivel);
  v_palabras := v_total > 0 and v_ok >= v_total;

  if v_examen is null and not v_palabras then raise exception 'nivel no completado'; end if;

  insert into certificados as c (codigo, user_id, nivel, nombre, fecha, palabras, tipo, puntaje)
    values (p_codigo, uid, p_nivel, v_nombre,
            case when v_examen is not null then v_fecha_examen else least(coalesce(p_fecha, current_date), current_date) end,
            case when v_palabras then v_total else 0 end,
            case when v_examen is not null then 'examen' else 'vocabulario' end,
            v_examen)
    on conflict (user_id, nivel) do update set
      nombre = excluded.nombre,
      tipo = case when excluded.tipo = 'examen' then 'examen' else c.tipo end,
      puntaje = coalesce(excluded.puntaje, c.puntaje);
  return query select c.codigo, c.nombre, c.nivel, c.fecha, c.tipo, c.puntaje
    from certificados c where c.user_id = uid and c.nivel = p_nivel;
end $$;
revoke all on function public.emitir_certificado(text,text,date) from public, anon;
grant execute on function public.emitir_certificado(text,text,date) to authenticated;

-- 4) verificar_certificado devuelve también el tipo y el puntaje.
drop function if exists public.verificar_certificado(text);
create function public.verificar_certificado(p_codigo text)
returns table(nombre text, nivel text, fecha date, palabras int, tipo text, puntaje numeric)
language sql security definer stable set search_path = public as $$
  select nombre, nivel, fecha, palabras, tipo, puntaje from certificados where codigo = upper(trim(p_codigo));
$$;
grant execute on function public.verificar_certificado(text) to anon, authenticated;
