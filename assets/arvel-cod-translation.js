(() => {
  const translations = new Map([
    ['Buy with Cash on Delivery', 'Kapıda Ödeme ile Sipariş Ver'],
    ['Cash on Delivery', 'Kapıda Ödeme'],
    ['Order now', 'Şimdi Sipariş Ver'],
    ['Place order', 'Siparişi Tamamla'],
    ['Order summary', 'Sipariş Özeti'],
    ['Full name', 'Ad Soyad'],
    ['Phone number', 'Telefon Numarası'],
    ['Email address', 'E-posta Adresi'],
    ['Shipping address', 'Teslimat Adresi'],
    ['Address', 'Adres'],
    ['City', 'İl'],
    ['District', 'İlçe'],
    ['Total', 'Toplam'],
    ['Shipping', 'Kargo'],
    ['Required field', 'Zorunlu alan'],
  ]);

  const translateText = (text) => translations.get(text.trim()) || null;

  const translateNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const translated = translateText(node.textContent || '');
      if (translated) node.textContent = (node.textContent || '').replace(node.textContent.trim(), translated);
      return;
    }

    if (!(node instanceof Element)) return;
    for (const element of node.querySelectorAll('button, label, span, p, h1, h2, h3, input[placeholder]')) {
      if (element instanceof HTMLInputElement && element.placeholder) {
        const translated = translateText(element.placeholder);
        if (translated) element.placeholder = translated;
      } else if (element.childElementCount === 0) {
        const translated = translateText(element.textContent || '');
        if (translated) element.textContent = translated;
      }
    }
  };

  const start = () => {
    translateNode(document.body);
    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) translateNode(node);
      }
    }).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
