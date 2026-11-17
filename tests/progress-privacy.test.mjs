import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import net from 'node:net';

test('real PostgreSQL enforces private buyer progress, active access, revisions and retained history', async () => {
  // A brand-new, loopback-only test database. Never reads DATABASE_URL or connects to Supabase.
  const temporary = mkdtempSync(path.join(tmpdir(),'growth-edit-rls-'));
  const data = path.join(temporary,'postgres');
  const server = net.createServer();
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  const run = (bin,args) => execFileSync(bin,args,{encoding:'utf8',stdio:['ignore','pipe','pipe']});
  let started = false;
  try {
    run('initdb',['-D',data,'-U','plan_test','-A','trust','--no-locale']);
    run('pg_ctl',['-D',data,'-l',path.join(temporary,'postgres.log'),'-o',`-h 127.0.0.1 -p ${port} -k ${temporary}`,'-w','start']);
    started = true;
    const sql = text => run('psql',['-X','-q','-A','-t','-v','ON_ERROR_STOP=1','-h','127.0.0.1','-p',String(port),'-U','plan_test','-d','postgres','-c',text]).trim();
    const a='00000000-0000-0000-0000-000000000001', b='00000000-0000-0000-0000-000000000002', c='00000000-0000-0000-0000-000000000003';
    sql(`create role authenticated; create role anon; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema public,auth to authenticated,anon;
      create table public.courses(id uuid primary key,slug text,is_published boolean);
      create table public.entitlements(user_id uuid,course_id uuid,status text);
      grant select on public.courses,public.entitlements to authenticated;
      insert into auth.users values ('${a}'),('${b}'),('${c}');
      insert into public.courses values ('10000000-0000-0000-0000-000000000001','hair-growth-edit',true);
      insert into public.entitlements values
      ('${a}','10000000-0000-0000-0000-000000000001','active'),
      ('${b}','10000000-0000-0000-0000-000000000001','active');`);
    sql(readFileSync(new URL('../supabase/migrations/202611180001_growth_edit_routine_progress.sql',import.meta.url),'utf8'));
    const key='map1-0a0b0c0d';
    const progress = {version:1,planKey:key,revision:1,firstName:'Test buyer',startDate:'2026-11-18',completedDays:[1],
      checkIns:{baseline:{day:1,kind:'baseline',ratings:{scalp:3,lengths:3,tangling:3,breakage:3},note:'Baseline',irritated:false,recordedAt:'2026-11-18T12:00:00Z'}}};
    const literal = p => JSON.stringify(p).replaceAll("'","''");
    const asUser = (id,text) => sql(`set role authenticated; set request.jwt.claim.sub='${id}'; ${text}`);
    const insert = (owner,p=progress) => `insert into public.growth_edit_routine_progress(user_id,plan_key,revision,progress) values ('${owner}','${key}',1,'${literal(p)}') returning revision;`;
    assert.equal(asUser(a,insert(a)),'1');
    assert.equal(asUser(b,`select count(*) from public.growth_edit_routine_progress where user_id='${a}';`),'0');
    assert.equal(asUser(b,`with changed as (update public.growth_edit_routine_progress set revision=2 where user_id='${a}' returning 1) select count(*) from changed;`),'0');
    assert.throws(()=>asUser(b,insert(a)),/row-level security/);
    assert.throws(()=>asUser(c,insert(c)),/row-level security/);
    assert.throws(()=>sql('set role anon; select * from public.growth_edit_routine_progress;'),/permission denied/);
    assert.equal(asUser(b,insert(b)),'1');
    assert.equal(asUser(a,'select count(*) from public.growth_edit_routine_progress;'),'1');
    assert.equal(asUser(b,'select count(*) from public.growth_edit_routine_progress;'),'1');
    assert.throws(()=>asUser(a,'delete from public.growth_edit_routine_progress;'),/permission denied/);
    const next={...progress,revision:2};
    const update=`with changed as (update public.growth_edit_routine_progress set revision=2,progress='${literal(next)}' where user_id='${a}' and plan_key='${key}' and revision=1 returning 1) select count(*) from changed;`;
    assert.equal(asUser(a,update),'1');
    assert.equal(asUser(a,update),'0');
    assert.throws(()=>asUser(a,`update public.growth_edit_routine_progress set revision=4,progress='${literal({...progress,revision:4})}';`),/Invalid progress revision/);
    assert.throws(()=>asUser(a,`update public.growth_edit_routine_progress set revision=3,progress='${literal({...progress,revision:3,checkIns:{}})}';`),/Cannot accidentally delete/);
    assert.throws(()=>asUser(a,`update public.growth_edit_routine_progress set revision=3,progress='${literal({...progress,revision:3,startDate:'2026-11-19'})}';`),/Start date is locked/);
    sql(`update public.entitlements set status='revoked' where user_id='${a}';`);
    assert.equal(asUser(a,'select count(*) from public.growth_edit_routine_progress;'),'0');
    assert.equal(asUser(a,update),'0');
    sql(`update public.courses set is_published=false;`);
    assert.equal(asUser(b,'select count(*) from public.growth_edit_routine_progress;'),'0');
  } finally {
    if(started) run('pg_ctl',['-D',data,'-m','immediate','-w','stop']);
    rmSync(temporary,{recursive:true,force:true});
  }
});
