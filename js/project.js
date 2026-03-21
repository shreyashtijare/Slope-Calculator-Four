import { supabase } from './supabase-client.js'
import { requireAuth, logout } from './auth.js'

const list = document.getElementById("projectsList")
const newBtn = document.getElementById("newProject")
const logoutBtn = document.getElementById("logoutBtn")

// require login
await requireAuth()

// logout button
logoutBtn.onclick = logout

// load projects
async function loadProjects(){

const { data, error } = await supabase
.from('projects')
.select('*')
.order('created_at',{ascending:false})

if(error) console.error(error)

list.innerHTML=""

data.forEach(p=>{
const option=document.createElement("option")
option.value=p.id
option.textContent=p.name
list.appendChild(option)
})

// auto select first project
if(data.length>0){
list.value=data[0].id
localStorage.setItem("project_id",data[0].id)
}

}

// new project
newBtn.onclick = async () => {

const name = prompt("Project name")
if(!name) return

const { data:{user} } = await supabase.auth.getUser()

const { error } = await supabase
.from("projects")
.insert({
name:name,
user_id:user.id
})

if(error){
console.error(error)
alert("Error creating project")
return
}

loadProjects()
}

// switch project
list.onchange = () => {
const id = list.value
localStorage.setItem("project_id",id)
}

loadProjects()
