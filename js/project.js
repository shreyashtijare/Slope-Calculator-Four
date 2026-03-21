import { supabase } from './supabase-client.js'

const list = document.getElementById("projectsList")
const newBtn = document.getElementById("newProject")

async function loadProjects(){

const { data } = await supabase
.from('projects')
.select('*')
.order('created_at',{ascending:false})

list.innerHTML=""

data.forEach(p=>{
const div=document.createElement("div")
div.textContent=p.name
div.onclick=()=>openProject(p.id)
list.appendChild(div)
})

}

async function openProject(id){
localStorage.setItem("project_id",id)
}

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
