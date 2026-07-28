export function getUser() {
  const u = sessionStorage.getItem('user') || localStorage.getItem('user')
  return u ? JSON.parse(u) : null
}

export function logout() {
  sessionStorage.removeItem('user')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

export function isLoggedIn() {
  return !!getUser()
}