const popup = document.getElementById('piero-wheel-popup');

if (popup instanceof HTMLDialogElement && !window.Shopify?.designMode) {
  const storageKey = 'piero-wheel-popup-dismissed';
  const close = () => {
    if (popup.open) popup.close();
    sessionStorage.setItem(storageKey, 'true');
  };

  if (!sessionStorage.getItem(storageKey)) {
    window.setTimeout(() => popup.showModal(), 1000);
  }

  popup.querySelector('[data-wheel-close]')?.addEventListener('click', close);
  popup.addEventListener('close', () => sessionStorage.setItem(storageKey, 'true'));
  popup.addEventListener('click', (event) => {
    if (event.target === popup) close();
  });

  popup.querySelector('[data-wheel-spin]')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    const wheel = popup.querySelector('[data-wheel]');
    const result = popup.querySelector('[data-wheel-result]');
    if (!(button instanceof HTMLButtonElement) || !(wheel instanceof HTMLElement) || !(result instanceof HTMLElement) || button.disabled) return;
    const prizes = [
      { label: '%5 indirim', code: 'PIERO5', rotation: 315 },
      { label: '%10 indirim', code: 'PIERO10', rotation: 225 },
      { label: '%15 indirim', code: 'PIERO15', rotation: 135 },
      { label: '200 TL indirim', code: 'PIERO200', rotation: 45 },
    ];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    button.disabled = true;
    wheel.style.transform = `rotate(${2160 + prize.rotation}deg)`;
    popup.dataset.spun = 'true';
    result.innerHTML = `<strong>${prize.code}</strong><small>Tebrikler! ${prize.label} kazandın.</small>`;
  });
}
