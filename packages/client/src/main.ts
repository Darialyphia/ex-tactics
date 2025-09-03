import './styles.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import gsap from 'gsap';
import { MotionPathPlugin, Flip } from 'gsap/all';

gsap.install(window);
gsap.registerPlugin(MotionPathPlugin);
gsap.registerPlugin(Flip);

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
