import { supabase } from "./supabase-client.js"

const list = document.getElementById("projectsList")
const newBtn = document.getElementById("newProject")

const loginBtn = document.getElementById("loginBtn")
const logoutBtn = document.getElementById("logoutBtn")

const projectControls = document.getElementById("projectControls")

let currentUser = null
let projects = []

// ================= AUTH =================

async function checkUser(){

const { data:{ user } } = await supabase.auth.getUser()

currentUser = user

if(user){
projectControls.style.display="flex"
logoutBtn.style.display="block"
loginBtn.style.display="none"
loadProjects()
}else{
projectControls.style.display="none"
logoutBtn.style.display="none"
loginBtn.style.display="block"
}

}

checkUser()

loginBtn.onclick = ()=>{
window.location.href="login.html"
}

logoutBtn.onclick = async ()=>{
await supabase.auth.signOut()
location.reload()
}

// ================= LOAD =================

async function loadProjects(){

const { data } = await supabase
.from("projects")
.select("*")
.order("created_at",{ascending:false})

projects = data || []

renderDropdown()

}

// ================= RENDER =================

function renderDropdown(){

list.innerHTML=""

projects.forEach(p=>{

const option=document.createElement("option")
option.value=p.id
option.textContent=p.name

list.appendChild(option)

})

// auto select first
if(projects.length>0){
list.value=projects[0].id
localStorage.setItem("project_id",projects[0].id)
}

}

// ================= NEW PROJECT =================

newBtn.onclick = ()=>{

const input=document.createElement("input")
input.className="project-input"
input.placeholder="Project name..."

list.parentNode.insertBefore(input,list)
input.focus()

input.onkeydown=async(e)=>{

if(e.key==="Enter"){

const name=input.value.trim()
if(!name) return

const { data, error } = await supabase
.from("projects")
.insert({
name:name,
user_id:currentUser.id
})
.select()
.single()

if(!error){
projects.unshift(data)
input.remove()
renderDropdown()
list.value=data.id
}

}

if(e.key==="Escape"){
input.remove()
}

}

}

// ================= SWITCH =================

list.onchange = ()=>{
localStorage.setItem("project_id",list.value)
}

// ================= RENAME =================

list.ondblclick = ()=>{

const id=list.value
const project=projects.find(p=>p.id===id)

const input=document.createElement("input")
input.className="project-input"
input.value=project.name

list.parentNode.insertBefore(input,list)
input.focus()
input.select()

input.onkeydown=async(e)=>{

if(e.key==="Enter"){

const newName=input.value.trim()

await supabase
.from("projects")
.update({name:newName})
.eq("id",id)

project.name=newName

input.remove()
renderDropdown()
list.value=id

}

if(e.key==="Escape"){
input.remove()
}

}

}

// ================= DELETE =================

document.addEventListener("keydown",async(e)=>{

if(e.key==="Delete" && document.activeElement===list){

const id=list.value
if(!confirm("Delete project?")) return

await supabase
.from("projects")
.delete()
.eq("id",id)

projects = projects.filter(p=>p.id!==id)

renderDropdown()

}

})

// ================= DUPLICATE =================

document.addEventListener("keydown",async(e)=>{

if(e.ctrlKey && e.key==="d"){

const id=list.value
const project=projects.find(p=>p.id===id)

const { data } = await supabase
.from("projects")
.insert({
name:project.name+" copy",
user_id:currentUser.id
})
.select()
.single()

projects.unshift(data)
renderDropdown()
list.value=data.id

}

})
