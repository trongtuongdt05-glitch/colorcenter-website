'use client';

export function LanguageSwitch({english}: {english:boolean}) {
  return <div className="language-switch" role="group" aria-label={english ? 'Language' : 'Ngôn ngữ'}>
    {(['vi','en'] as const).map(language => <button
      key={language} type="button" lang={language}
      aria-label={language === 'vi' ? 'Tiếng Việt' : 'English (UK)'}
      aria-pressed={english === (language === 'en')}
      onClick={()=>{
        if (english === (language === 'en')) return;
        document.cookie = `cc-language=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;
        window.location.reload();
      }}>
      <img src={`/media/flag-${language}.png`} alt="" width={26} height={17}/>
    </button>)}
  </div>;
}
