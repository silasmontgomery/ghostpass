if (workbox) {

    console.log(`Yay! Workbox is loaded 🎉`);

    self.__precacheManifest = [].concat(self.__precacheManifest || []);
    workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

    const safeHandler = new workbox.strategies.NetworkFirst({
        cacheName: 'safe-cache',
        plugins: [
                new workbox.expiration.Plugin({
                maxEntries: 5,
            })
        ]
    });
    
    workbox.routing.registerRoute(/(.*)safe\/(.*)/, args => {
        return safeHandler.handle(args);
    });
} else {
    console.log(`Boo! Workbox didn't load 😬`);
}