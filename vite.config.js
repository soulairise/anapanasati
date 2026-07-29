import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages는 https://<user>.github.io/<repo>/ 경로에 배포되므로
// base를 저장소 이름으로 맞춰야 자원 경로가 깨지지 않는다.
// 저장소 이름이 정해지면 아래 base 값을 '/<repo-name>/'로 수정.
export default defineConfig({
  plugins: [react()],
  base: '/anapanasati/',
  // 음성 안내 오디오(m4a)를 에셋으로 번들
  assetsInclude: ['**/*.m4a'],
})
