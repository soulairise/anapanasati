// GitHub Pages 용 SPA 폴백.
//
// GitHub Pages 는 _redirects 를 모른다. 대신 없는 경로를 404.html 로 보낸다.
// index.html 을 그대로 404.html 로 복사해 두면, /learn 을 직접 열어도
// 앱이 뜨고 BrowserRouter 가 경로를 받아 처리한다. (상태코드는 404지만
// 사용자에게는 정상으로 보인다 — Cloudflare 로 옮기면 200 이 된다.)
import { copyFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
await copyFile(join(dist, 'index.html'), join(dist, '404.html'))
console.log('spa-fallback: dist/404.html 생성')
