// ============================================================
// 실결제 개시 전 점검
//
// 왜 스크립트인가:
//   사업자 정보가 빈 채로 라이브 키만 바꾸면 전자상거래법 제10조 위반 상태로
//   결제가 열린다. 사람이 기억하는 대신 기계가 막는다.
//
// 실행: npm run check:launch
// ============================================================

import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ok = (s) => `  ✅ ${s}`
const no = (s) => `  ❌ ${s}`
const warn = (s) => `  ⚠️  ${s}`

const results = []
let blocking = 0

// 1) 사업자 정보 (전자상거래법 제10조)
const legal = await readFile(join(ROOT, 'src/data/legal.js'), 'utf8')
const field = (k) => {
  const m = legal.match(new RegExp(`${k}:\\s*'([^']*)'`))
  return m ? m[1] : ''
}
const REQUIRED = {
  name: '상호',
  ceo: '대표자',
  regNo: '사업자등록번호',
  address: '영업소 주소',
  tel: '전화번호',
  email: '이메일',
  salesNo: '통신판매업 신고번호',
}
results.push('\n[1] 사업자 정보 — 전자상거래법 제10조')
for (const [k, label] of Object.entries(REQUIRED)) {
  const v = field(k)
  if (v) results.push(ok(`${label}: ${v}`))
  else {
    results.push(no(`${label} — 비어 있음 (화면에 "등록 후 표기"로 노출됨)`))
    blocking++
  }
}

// 2) 토스 키
results.push('\n[2] 결제 키')
let env = ''
try {
  env = await readFile(join(ROOT, '.env'), 'utf8')
} catch {
  /* .env 없음 */
}
const ck = (env.match(/^VITE_TOSS_CLIENT_KEY=(.*)$/m) || [])[1]?.trim() || ''
if (!ck) {
  results.push(no('VITE_TOSS_CLIENT_KEY 없음 — 데모 모드로 동작'))
  blocking++
} else if (ck.startsWith('test_ck_')) {
  results.push(warn('테스트 키(test_ck_) — 실제 결제가 되지 않습니다'))
} else if (ck.startsWith('live_ck_')) {
  results.push(ok('라이브 키(live_ck_)'))
} else {
  results.push(warn(`형식 미상 (${ck.slice(0, 8)}…)`))
}

// 3) 요금표가 서버·프론트에서 일치하는지 — 어긋나면 결제가 조용히 거부된다
results.push('\n[3] 요금표 일치 (프론트 ↔ 서버)')
const premium = await readFile(join(ROOT, 'src/pages/Premium.jsx'), 'utf8')
const fn = await readFile(join(ROOT, 'supabase/functions/confirm-payment/index.ts'), 'utf8')
const front = {}
for (const m of premium.matchAll(/key:\s*'(\w+)',[\s\S]*?price:\s*(\d+)/g)) front[m[1]] = Number(m[2])
const server = {}
const priceLine = fn.match(/const PRICE[^=]*=\s*\{([^}]*)\}/)
if (priceLine) {
  for (const m of priceLine[1].matchAll(/(\w+):\s*(\d+)/g)) server[m[1]] = Number(m[2])
}
const keys = new Set([...Object.keys(front), ...Object.keys(server)])
for (const k of keys) {
  if (front[k] === server[k]) results.push(ok(`${k}: ${front[k]}원`))
  else {
    results.push(no(`${k}: 프론트 ${front[k] ?? '없음'} ≠ 서버 ${server[k] ?? '없음'}`))
    blocking++
  }
}
results.push(warn('서버 값은 로컬 파일 기준입니다. Edge Function을 배포했는지 별도 확인하세요.'))

// 4) 법정 문서 존재
results.push('\n[4] 법정 고지 문서')
for (const [slug, label] of [
  ['terms', '이용약관'],
  ['terms-payment', '유료·정기결제 약관'],
  ['privacy', '개인정보처리방침'],
]) {
  legal.includes(`slug: '${slug}'`)
    ? results.push(ok(label))
    : results.push(no(`${label} 없음`)) || blocking++
}

// 5) 선언한 판매 방식과 실제 구현이 맞는지
//    처음에는 화면 문구를 정규식으로 훑었는데, "자동으로 다시 결제되지 않습니다"를
//    자동결제 약속으로 읽었다. 부정문을 정규식으로 가리는 건 틀린 방법이다.
//    코드가 스스로 선언하게 하고 그 선언만 검사한다.
results.push('\n[5] 판매 방식 선언 ↔ 구현')
const payments = await readFile(join(ROOT, 'src/lib/payments.js'), 'utf8')
const model = (payments.match(/BILLING_MODEL\s*=\s*'(\w+)'/) || [])[1]
const needsCard = /TRIAL_REQUIRES_CARD\s*=\s*true/.test(payments)
const hasBilling = /issueBillingKey|billingKey/i.test(payments) || /billingKey/i.test(fn)

if (!model) {
  results.push(no('payments.js에 BILLING_MODEL 선언이 없음'))
  blocking++
} else if (model === 'recurring' || needsCard) {
  if (hasBilling) results.push(ok(`${model} — 빌링키 코드 있음`))
  else {
    results.push(no(`${model}로 선언했는데 빌링키 발급 코드가 없음`))
    blocking++
  }
} else {
  results.push(ok('one_time — 자동 갱신 없음. 갱신 고지·해지 실동작 의무가 걸리지 않는다'))
  if (hasBilling) {
    results.push(warn('빌링키로 보이는 코드가 있다. 선언과 맞는지 확인하세요.'))
  }
}

const trialDays = (payments.match(/TRIAL_DAYS\s*=\s*(\d+)/) || [])[1]
results.push(
  trialDays
    ? ok(`무료 체험 ${trialDays}일 (카드 ${needsCard ? '받음' : '받지 않음'})`)
    : warn('TRIAL_DAYS 선언 없음'),
)

// 5-b) Edge Function 의 CORS 사본이 어긋나지 않았는지
//     배포 도구가 상위 폴더 참조를 못 해서 함수마다 같은 파일을 복사해 뒀다.
//     한쪽만 고치면 그 함수만 조용히 CORS 로 막힌다 — 로그에도 안 남는다.
results.push('\n[5-b] Edge Function CORS 사본 일치')
const corsPaths = [
  'supabase/functions/coach/cors.ts',
  'supabase/functions/confirm-payment/cors.ts',
]
const corsBodies = []
for (const rel of corsPaths) {
  try {
    corsBodies.push(await readFile(join(ROOT, rel), 'utf8'))
  } catch {
    results.push(no(`${rel} 없음`))
    blocking++
  }
}
if (corsBodies.length === corsPaths.length) {
  if (corsBodies.every((b) => b === corsBodies[0])) {
    results.push(ok(`사본 ${corsPaths.length}개가 동일`))
    // supabase-js 가 보내는 헤더가 허용되는지
    if (corsBodies[0].includes('x-supabase-api-version')) {
      results.push(ok('x-supabase-api-version 허용됨'))
    } else {
      results.push(no('x-supabase-api-version 이 허용 목록에 없음 — 브라우저가 요청을 막는다'))
      blocking++
    }
  } else {
    results.push(no('사본이 서로 다르다 — 한쪽 함수만 CORS 로 막힌다'))
    blocking++
  }
}

// 6) 사람이 직접 봐야 하는 것
results.push('\n[6] 기계가 못 보는 것 — 직접 확인')
for (const s of [
  'Edge Function을 배포했는가 (supabase functions deploy confirm-payment)',
  'Supabase에 TOSS_SECRET_KEY 시크릿이 라이브 키로 들어갔는가',
  '통신판매업 변경신고 반영 확인 (공정위 조회: ftc.go.kr → 통신판매사업자조회)',
  '  ㄴ 소재지가 양천로 564 로 나오는가 / 도메인에 이 사이트가 있는가',
  '테스트 카드로 결제 → 기간이 이어붙는지 한 번 돌려봤는가',
  'TRIAL_DAYS 와 DB 트리거(handle_new_user)의 체험 일수가 같은가',
]) results.push(warn(s))

console.log(results.join('\n'))
console.log(
  blocking === 0
    ? '\n실결제를 열 준비가 됐습니다.\n'
    : `\n⚠️  막는 항목 ${blocking}개 — 해결 전에는 라이브 키로 바꾸지 마세요.\n`,
)
process.exit(blocking === 0 ? 0 : 1)
