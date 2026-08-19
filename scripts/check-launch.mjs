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

// 5) 표시와 실제 동작의 일치 — 없는 기능을 판다고 쓰면 표시광고법 문제가 된다
results.push('\n[5] 표시 ↔ 실제 동작')
const payments = await readFile(join(ROOT, 'src/lib/payments.js'), 'utf8')
const claimsTrial = /무료\s*체험|무료로 시작/.test(premium)
const hasTrial = /trial|체험/i.test(payments) || /trial/i.test(fn)
if (claimsTrial && !hasTrial) {
  results.push(no('화면은 "무료 체험"을 약속하는데 결제 코드에 체험 로직이 없음'))
  blocking++
} else if (claimsTrial) {
  results.push(ok('무료 체험 표시 — 결제 코드에 관련 로직 있음'))
} else {
  results.push(ok('무료 체험을 표시하지 않음'))
}
const claimsAutoRenew = /자동으로 결제|자동 ?갱신/.test(premium)
const hasBilling = /billing|빌링|issueBillingKey/i.test(payments)
if (claimsAutoRenew && !hasBilling) {
  results.push(no('화면은 "자동 갱신"을 약속하는데 빌링키 발급 코드가 없음 (1회성 결제)'))
  blocking++
} else if (claimsAutoRenew) {
  results.push(ok('자동 갱신 표시 — 빌링키 코드 있음'))
} else {
  results.push(ok('자동 갱신을 표시하지 않음'))
}

// 6) 사람이 직접 봐야 하는 것
results.push('\n[6] 기계가 못 보는 것 — 직접 확인')
for (const s of [
  'Edge Function을 배포했는가 (supabase functions deploy confirm-payment)',
  'Supabase에 TOSS_SECRET_KEY 시크릿이 라이브 키로 들어갔는가',
  '통신판매업 신고서의 인터넷 도메인에 이 사이트가 포함돼 있는가 (아니면 변경신고)',
  '테스트 카드로 결제 → 프리미엄 활성 → 해지까지 한 번 돌려봤는가',
]) results.push(warn(s))

console.log(results.join('\n'))
console.log(
  blocking === 0
    ? '\n실결제를 열 준비가 됐습니다.\n'
    : `\n⚠️  막는 항목 ${blocking}개 — 해결 전에는 라이브 키로 바꾸지 마세요.\n`,
)
process.exit(blocking === 0 ? 0 : 1)
