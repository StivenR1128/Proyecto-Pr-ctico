import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
const url=process.env.VITE_SUPABASE_URL;
const key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
assert(url && key, 'Completa .env con la configuración pública de Supabase');
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
for(const table of ['profiles','projects','tasks','task_analytics']){
 const {data,error}=await client.from(table).select('*').limit(1);
 assert(error?.code==='42501',`${table}: se esperaba permiso denegado, recibido ${error?.code||error?.message||'sin error'}`);
 assert(!data,`${table}: no debe exponer datos`);
 console.log(`PASS ${table}: API real deniega lectura anónima`);
}
const invalid=await client.auth.getUser('invalid-taskflow-test-token');
assert(invalid.error && !invalid.data.user,'Auth no debe aceptar JWT inválido');
console.log('PASS Supabase Auth rechaza JWT inválido');
console.log('5 comprobaciones cloud aprobadas. Registro/correo y aislamiento entre dos sesiones se validan aparte.');
