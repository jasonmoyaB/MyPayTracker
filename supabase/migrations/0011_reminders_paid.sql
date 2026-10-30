-- REC-02jm-T02: fecha CR del vencimiento ya pagado; el dominio salta ese ciclo y deja de avisarlo.
alter table public.reminders
  add column paid_on date;

-- El dueño marca pagado sus filas...
create policy "reminders: el dueño marca pagado" on public.reminders
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ...y solo esa columna: monto, día y notified_on (lo escribe la Edge Function) siguen fuera de su alcance.
revoke update on public.reminders from authenticated;
grant update (paid_on) on public.reminders to authenticated;
