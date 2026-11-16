const popup = document.getElementById('arvel-wheel-popup');

if (popup instanceof HTMLDialogElement && !window.Shopify?.designMode) {
  const storageKey = 'arvel-wheel-popup-dismissed';
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

  popup.addEventListener('click', async (event) => {
    const copyButton = event.target.closest('[data-wheel-copy]');
    if (!(copyButton instanceof HTMLButtonElement)) return;

    const code = copyButton.dataset.wheelCopy;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      copyButton.textContent = 'KOPYALANDI';
      copyButton.classList.add('is-copied');
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = code;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.append(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
      copyButton.textContent = 'KOPYALANDI';
      copyButton.classList.add('is-copied');
    }
  });

  popup.querySelector('[data-wheel-spin]')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    const wheel = popup.querySelector('[data-wheel]');
    const result = popup.querySelector('[data-wheel-result]');
    if (!(button instanceof HTMLButtonElement) || !(wheel instanceof HTMLElement) || !(result instanceof HTMLElement) || button.disabled) return;
    const prizes = [
      { label: '%5 indirim', code: 'ARVEL5', rotation: 324 },
      { label: '%10 indirim', code: 'ARVEL10', rotation: 252 },
      { label: '%15 indirim', code: 'ARVEL15', rotation: 180 },
      { label: '200 TL indirim', code: 'ARVEL200', rotation: 108 },
      { label: '100 TL indirim', code: 'ARVEL100', rotation: 36 },
    ];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    const revealPrize = () => {
      popup.dataset.spun = 'true';
      popup.classList.remove('is-spinning');
      result.innerHTML = `<span class="piero-wheel-popup__win-label">KAZANDIĞIN KOD</span><span class="piero-wheel-popup__code"><strong>${prize.code}</strong><button type="button" data-wheel-copy="${prize.code}" aria-label="${prize.code} kodunu kopyala">KODU KOPYALA</button></span><small>Tebrikler! ${prize.label} kazandın.</small>`;
    };

    button.disabled = true;
    button.textContent = 'ÇARK DÖNÜYOR...';
    result.textContent = 'Şansın belirleniyor...';
    popup.dataset.spun = 'false';
    popup.classList.add('is-spinning');
    wheel.style.transform = `rotate(${2160 + prize.rotation}deg)`;
    window.setTimeout(revealPrize, 2450);
  });
}
