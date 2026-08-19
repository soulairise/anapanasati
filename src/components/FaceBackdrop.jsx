import { useFace } from '../context/FaceContext'
import './FaceBackdrop.css'

// ============================================================
// 배경의 해와 달
//
// 아주 옅게 둔다. 배경이 눈에 먼저 들어오면 글을 읽기 어렵고,
// 명상 앱에서 화면이 말을 걸어오면 안 된다. 있는 줄 모르다가
// 문득 보이는 정도가 맞다.
//
// 그림 파일 대신 SVG로 그린다. 어느 크기에서도 깨지지 않고 용량이 0이다.
// ============================================================

export default function FaceBackdrop() {
  const { face } = useFace()

  return (
    <div className={`face-backdrop face-backdrop--${face}`} aria-hidden="true">
      <svg viewBox="0 0 200 200" role="presentation" focusable="false">
        <defs>
          {/* 가장자리를 부드럽게 — 원의 경계선이 보이면 스티커처럼 붙어 보인다 */}
          <radialGradient id="faceGlow">
            <stop offset="55%" stopColor="currentColor" stopOpacity="0.95" />
            <stop offset="78%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          {/* 초승달 — 원에서 원을 덜어낸다 */}
          <mask id="crescent">
            <rect width="200" height="200" fill="black" />
            <circle cx="100" cy="100" r="62" fill="white" />
            <circle cx="132" cy="82" r="56" fill="black" />
          </mask>
        </defs>

        {face === 'moon' ? (
          <>
            <circle cx="100" cy="100" r="98" fill="url(#faceGlow)" opacity="0.22" />
            <circle cx="100" cy="100" r="62" fill="currentColor" mask="url(#crescent)" />
          </>
        ) : (
          <>
            <circle cx="100" cy="100" r="98" fill="url(#faceGlow)" opacity="0.3" />
            <circle cx="100" cy="100" r="52" fill="currentColor" opacity="0.5" />
          </>
        )}
      </svg>
    </div>
  )
}
