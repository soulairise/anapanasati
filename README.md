# 숨결의 길 · Ānāpānasati Path 🌬️

부처가 전한 호흡 알아차림 명상 **아나빠나사띠(Ānāpānasati)** 16단계를
**배우고(Learn) → 호흡으로 수행하고(Breathe) → 기록하는(Journal)** 고요한 웹서비스.

> 📄 기획 문서는 [PRD.md](./PRD.md) 참고.

## 주요 기능

| 기능 | 설명 |
|------|------|
| 📖 **배우기** | 아나빠나사띠 16단계(4념처 × 4단계) 목록·상세 학습 |
| 🫧 **호흡하기** | 들숨-멈춤-날숨-멈춤 4박자 원형 애니메이션 호흡 가이드 (패턴·시간 선택) |
| 🕯️ **수행일지** | 세션 기록 생성·조회·수정·삭제(CRUD) + 누적 통계(총 시간·연속일·평균 집중도) |
| 🔐 **로그인** | 이메일 로그인 (현재 목업 → Supabase Auth 연동 예정) |

## 기술 스택

- **프론트엔드:** React + Vite, React Router (HashRouter)
- **백엔드/DB:** (예정) Supabase — 현재는 localStorage 기반 목업 백엔드(`src/lib/store.js`)
- **배포:** GitHub Pages

## 로컬 실행

```bash
npm install
npm run dev
```

`http://localhost:5173` 접속.

## 빌드 & 배포

```bash
npm run build      # dist/ 생성
npm run deploy     # gh-pages로 GitHub Pages 배포
```

> GitHub Pages 배포 시 `vite.config.js`의 `base`를 저장소 이름(`/<repo>/`)에 맞추세요.

## 프로젝트 구조

```
src/
├─ main.jsx              # 진입점 (HashRouter, AuthProvider)
├─ App.jsx               # 라우팅
├─ index.css / App.css   # 디자인 시스템 (고요한 Zen 톤)
├─ context/AuthContext.jsx
├─ lib/
│  ├─ store.js           # 목업 백엔드 (Supabase 인터페이스와 호환)
│  └─ format.js
├─ data/stages.js        # 16단계 콘텐츠
├─ components/Navbar.jsx
└─ pages/
   ├─ Home.jsx           # 홈/랜딩
   ├─ Learn.jsx          # 16단계 목록
   ├─ StageDetail.jsx    # 단계 상세
   ├─ Breathe.jsx        # 호흡 가이드 타이머
   ├─ SessionComplete.jsx# 세션 완료·기록 (Create)
   ├─ Journal.jsx        # 수행일지 목록 (Read)
   ├─ JournalDetail.jsx  # 일지 상세·수정·삭제 (Update/Delete)
   └─ Login.jsx          # 로그인
```

## 데이터 계층 교체 안내 (목업 → Supabase)

현재 `src/lib/store.js`가 DB·Auth 역할을 대신합니다.
Supabase 연동 시 이 파일의 `auth`·`sessionsApi` 함수 내부만 Supabase 호출로 교체하면
화면 코드는 그대로 동작하도록 설계했습니다.

---

## 저작권

**Copyright © 2026 소울매트 · 김만영. All rights reserved.**

이 저장소의 소스와 콘텐츠는 저작권 보호를 받습니다.
서면 허락 없이 복제·배포·2차적저작물 작성·상업적 이용·기계학습 데이터 수집을 금합니다.
자세한 내용은 [LICENSE](LICENSE) 를 보세요.
