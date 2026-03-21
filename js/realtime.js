import { supabase } from './supabase-client.js'

export function subscribeProject(projectId,callback){

return supabase
.channel('project-'+projectId)
.on(
'postgres_changes',
{
event:'*',
schema:'public',
table:'shapes',
filter:`project_id=eq.${projectId}`
},
payload=>{
callback(payload)
}
)
.subscribe()

}
