import { createClient } from '@supabase/supabase-js'

// 환경변수(.env)에서 접속 정보를 읽는다.
// VITE_ 접두사가 붙은 변수만 브라우저 코드에 노출된다.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn(
    '[Supabase] 환경변수가 설정되지 않았습니다. .env 파일에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 를 넣어주세요.',
  )
}

export const supabase = createClient(url, key)
