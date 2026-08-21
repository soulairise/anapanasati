#!/usr/bin/env bash
# ============================================================
# 코칭용 Gemini 키를 Supabase 시크릿에 넣는다.
#
# 왜 스크립트인가:
#   터미널에 키를 그대로 치면 셸 기록(~/.zsh_history)에 평문으로 남는다.
#   여기서는 입력을 가려 받고(read -s) 화면에도 기록에도 남기지 않는다.
#
# 실행:  bash scripts/set-gemini-key.sh
# ============================================================

set -euo pipefail

PROJECT_REF="ianhttigznynatbnfrkw"

say()  { printf '%s\n' "$*"; }
fail() { printf '\n❌ %s\n' "$*" >&2; exit 1; }

say ""
say "  숨결의 길 — 수행 코칭 키 등록"
say "  ────────────────────────────────"
say ""

command -v npx >/dev/null 2>&1 || fail "npx 가 없습니다. Node.js 를 먼저 설치해 주세요."

# ── 1. 키 입력 (화면에 안 보이고 기록에도 안 남는다) ──────────
say "  1. Google AI Studio 에서 발급한 키를 붙여넣고 Enter"
say "     https://aistudio.google.com/apikey"
say ""
printf "  키 (입력해도 화면에 보이지 않습니다): "
read -rs GEMINI_KEY
printf '\n\n'

[ -n "${GEMINI_KEY}" ] || fail "키가 비어 있습니다."

# 구글 AI Studio 키는 두 형식이 있다. 둘 다 받아들인다.
#   AIza…  예전 형식
#   AQ.A…  현재 발급되는 형식 (실제로 이 형식으로 받아 확인함)
# 다른 서비스 키를 잘못 붙여넣는 실수만 막는다.
case "${GEMINI_KEY}" in
  AIza*|AQ.*) ;;
  sk-ant-*) fail "이건 Anthropic 키입니다. Google AI Studio 키가 필요합니다." ;;
  sk-*) fail "이건 OpenAI 계열 키로 보입니다. Google AI Studio 키가 필요합니다." ;;
  *) say "  ⚠️  Gemini 키는 보통 AIza 나 AQ. 로 시작합니다. 그대로 진행합니다." ;;
esac

# ── 2. Supabase 로그인 ────────────────────────────────────
if [ -n "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  say "  2. SUPABASE_ACCESS_TOKEN 을 사용합니다."
else
  say "  2. Supabase 로그인 — 브라우저가 열립니다."
  say "     (이미 로그인돼 있으면 그냥 넘어갑니다)"
  say ""
  npx --yes supabase login || fail "로그인에 실패했습니다."
fi
say ""

# ── 3. 등록 ───────────────────────────────────────────────
say "  3. 시크릿을 등록합니다…"
# 출력을 가리지 않는다. 처음에 >/dev/null 로 묻어 뒀더니 실패가 조용히
# 넘어가서 "등록했다"고 믿은 채 다음 단계로 갔다. 오류는 보여야 한다.
if ! npx --yes supabase secrets set \
  "GEMINI_API_KEY=${GEMINI_KEY}" \
  --project-ref "${PROJECT_REF}"; then
  fail "등록에 실패했습니다. 위 오류 메시지를 확인해 주세요."
fi

unset GEMINI_KEY   # 메모리에서도 지운다

# ── 4. 확인 ───────────────────────────────────────────────
say ""
say "  4. 확인합니다…"
say ""
if npx --yes supabase secrets list --project-ref "${PROJECT_REF}" | grep -q "GEMINI_API_KEY"; then
  say "  ✅ GEMINI_API_KEY 등록 완료"
  say ""
  say "  이제 수행일지에서 편지를 받으실 수 있습니다."
  say "  (프리미엄 이용 중 · 기록 3회 이상일 때)"
else
  fail "등록은 됐는데 확인이 안 됩니다. Supabase 대시보드에서 직접 확인해 주세요."
fi
say ""
