import { supabase } from './supabase-client.js'

const list = document.getElementById("projectsList")
const newBtn = document.getElementById("newProject")
const logoutBtn = document.getElementById("logoutBtn")

// logout
logoutBtn.onclick = async ()=>{
await supabase.auth.signOut()
window.location.href="login.html"
}

// load projects
async function loadProjects(){

const { data } = await supabase
.from('projects')
.select('*')
.order('created_at',{ascending:false})

list.innerHTML=""

data.forEach(p=>{
const option=document.createElement("option")
option.value=p.id
option.textContent=p.name
list.appendChild(option)
})

}

// switch project
list.onchange=()=>{
const id=list.value
localStorage.setItem("project_id",id)
}

// new project
newBtn.onclick=async()=>{

const name=prompt("Project name")

const { data:user } = await supabase.auth.getUser()

await supabase.from("projects").insert({
name:name,
user_id:user.user.id
})

loadProjects()

}

loadProjects()
