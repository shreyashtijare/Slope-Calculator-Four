import { supabase } from "./supabase-client.js"

export async function getUser(){
const { data } = await supabase.auth.getUser()
return data.user
}

export async function logout(){
await supabase.auth.signOut()
window.location.href="login.html"
}

// protect dashboard
export async function requireAuth(){
const user = await getUser()

if(!user){
window.location.href="login.html"
}
}
