import { supabase } from './supabase-client.js'

export async function shareProject(projectId,email){

const { data:user } = await supabase
.from("profiles")
.select("id")
.eq("email",email)
.single()

await supabase
.from("project_shares")
.insert({
project_id:projectId,
user_id:user.id,
permission:"edit"
})

}
