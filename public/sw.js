self.addEventListener('push', function (event) {
  const data = event.data.json();
  const { title, body } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/favicon.svg'
    })
  );
});
