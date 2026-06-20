import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ThemeProvider } from './Components/ThemeProvider';
import { AnimatePresence } from 'framer-motion';

const appName = 'AseroTech Cloud';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider>
                <AnimatePresence mode="wait">
                    <App {...props} />
                </AnimatePresence>
            </ThemeProvider>
        );
    },
    progress: {
        color: '#10b881',
        showSpinner: true,
    },
});
