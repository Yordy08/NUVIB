export default defineNuxtPlugin(() => {
  const sendActivity = () => $fetch('/api/analytics/visit', { method: 'POST', body: { path: window.location.pathname } }).catch(() => undefined)
  sendActivity()
  const timer = window.setInterval(sendActivity, 60_000)
  window.addEventListener('beforeunload', () => window.clearInterval(timer), { once: true })
})
