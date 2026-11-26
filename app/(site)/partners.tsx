const partners = [
  { name: 'Circle K', file: 'partner-circle-k.webp', width: 1280, height: 486 },
  { name: 'KMS Technology', file: 'partner-kms.png', width: 300, height: 156 },
  { name: 'Medical Gym', file: 'partner-medical-gym.png', width: 2048, height: 1200, dark: true },
  { name: 'Con Cưng', file: 'partner-con-cung.png', width: 1859, height: 747 },
];

export function Partners({english = false}: {english?:boolean}) {
  return <section className="partner-section" aria-labelledby="partner-title">
    <div className="wrap partner-layout">
      <h2 id="partner-title">{english ? 'Partners and clients' : 'Đối tác và khách hàng'}</h2>
      <div className="partner-window" id="partner-logos">
        <div className="partner-track">
          {[false, true].map(copy => <ul key={String(copy)} className={copy ? 'partner-row partner-copy' : 'partner-row'} aria-hidden={copy || undefined}>
            {partners.map(({name,file,width,height,dark}) => <li key={file} className={dark ? 'partner-tile partner-tile-dark' : 'partner-tile'}>
              <img src={`/media/${file}`} alt={copy ? '' : name} width={width} height={height} loading="lazy" decoding="async"/>
            </li>)}
          </ul>)}
        </div>
      </div>
    </div>
  </section>;
}
