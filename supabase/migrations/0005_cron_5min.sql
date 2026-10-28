-- CRON-02jm-T02: sincronizar cada 5 minutos en vez de cada hora.
-- Se mantiene el nombre del job (renombrarlo exige borrarlo y recrearlo).
select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'sync-bac-emails-hourly'),
  schedule := '*/5 * * * *'
);
