// ──────────────────────────────────────────────────────────────
// public/sw.js — SCRIPT DE DÉSINSTRALLATION FORCE (KILL-SWITCH)
// Ce script écrase l'ancien Service Worker buggé et se suicide.
// ──────────────────────────────────────────────────────────────

self.addEventListener('install', (e) => {
    self.skipWaiting(); // Force l'activation immédiate
});

self.addEventListener('activate', (e) => {
    self.registration.unregister()
        .then(() => self.clients.matchAll())
        .then((clients) => {
            clients.forEach(client => client.navigate(client.url)); // Recharge les pages
        });
});

// Pas de fetch listener ici pour éviter d'intercepter quoi que ce soit
