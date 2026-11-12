const popup = document.getElementById('piero-wheel-popup');

if (popup instanceof HTMLDialogElement && !window.Shopify?.designMode) {
  const storageKey = 'piero-wheel-popup-dismissed';
  const close = () => {
    if (popup.open) popup.close();
    sessionStorage.setItem(storageKey, 'true');
  };

  if (!sessionStorage.getItem(storageKey)) {
    window.setTimeout(() => popup.showModal(), 3000);
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
      { percent: 5, code: 'PIERO5' },
      { percent: 10, code: 'PIERO10' },
      { percent: 15, code: 'PIERO15' },
    ];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    button.disabled = true;
    wheel.style.transform = `rotate(${1440 + Math.floor(Math.random() * 360)}deg)`;
    popup.dataset.spun = 'true';
    result.textContent = `Tebrikler! ${prize.code} kodu ile %${prize.percent} indirim kazandın.`;
  });
}
