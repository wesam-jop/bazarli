import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'

import '../css/app.css'
import { syncDirectionWithStoredLocale } from './utils/locale'
import { initializePushNotifications } from './utils/pushNotifications'

syncDirectionWithStoredLocale()

const appName = import.meta.env.VITE_APP_NAME || 'DeliGo'

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
  setup({ el, App, props }) {
    const root = createRoot(el)
    root.render(<App {...props} />)
    
    // Initialize Push Notifications if VAPID key is available
    if (props.vapidPublicKey) {
      initializePushNotifications(props.vapidPublicKey)
    }
  },
  progress: {
    color: '#4B5563',
  },
})
