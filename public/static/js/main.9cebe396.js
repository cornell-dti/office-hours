const result = navigator.serviceWorker.getRegistrations().then(function unregister(registrations) {
    return Promise.all(registrations.map(registration => registration.unregister()));
}).catch(err => {
    // eslint-disable-next-line no-console
    console.error(err);
    window.location.reload();
});

if (result.finally) {
    result.finally(() => { window.location.reload(); })
}