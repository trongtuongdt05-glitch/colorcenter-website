export function ZaloLink({href, floating = false}: {href:string; floating?:boolean}) {
  return <a className={floating ? 'zalo-float' : 'button outline zalo-inline'} href={href} target="_blank" rel="noreferrer" aria-label="Nhắn Color Center qua Zalo">
    <img className="zalo-icon" src="/media/zalo.webp" alt="" width={40} height={40}/>
    {!floating && 'Nhắn Zalo'}
  </a>;
}
