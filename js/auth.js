import { supabase } from './supabase-client.js'

const email = document.getElementById("email")
const password = document.getElementById("password")

const loginBtn = document.getElementById("loginBtn")
const signupBtn = document.getElementById("signupBtn")

loginBtn.onclick = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (!error) {
    window.location.href = "dashboard.html"
  }
}

signupBtn.onclick = async () => {
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  })

  if (!error) {
    window.location.href = "dashboard.html"
  }
}
