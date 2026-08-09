import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getStage } from '../data/stages'
import { usePremium } from '../context/PremiumContext'
import { playBowl, getAudioContext, INHALE_FREQ, EXHALE_FREQ } from '../lib/bowl'
import { createAmbient } from '../lib/ambient'
import { speak, stopNarration, primeNarration, PHASE_WORDS } from '../lib/narration'
import './Breathe.css'

// 호흡 패턴: [들숨, 멈춤, 날숨, 멈춤] (초)
const PATTERNS = [
  { key: '4-4-6-2', label: '기본 (4-4-6-2)', phases: [4, 4, 6, 2], premium: false },
  { key: '4-7-8-0', label: '이완 (4-7-8)', phases: [4, 7, 8, 0], premium: true },
  { key: '4-4-4-4', label: '사각 (4-4-4-4)', phases: [4, 4, 4, 4], premium: true },
  { key: '6-0-6-0', label: '고요 (6-6)', phases: [6, 0, 6, 0], premium: false },
]
const PHASE_NAMES = ['들이쉬기', '멈추기', '내쉬기', '멈추기']
// 페이즈별 색상 (들숨→멈춤→날숨→멈춤 순으로 그라데이션 순환)
const PHASE_COLORS = ['#8a9a82', '#6fa0a8', '#c2a184', '#9a94a6']
// 수행 시간(분) — 전부 무료.
// 5분 제한은 아나빠나사띠 제1념처도 끝내지 못하는 길이라, 핵심 가치를 체험시키지 못했다.
// 프리미엄은 시간이 아니라 가이드 음성·커스텀 패턴·오프라인 등 "편의"로 판다.
// 근거: docs/PRODUCT_STRATEGY.md 6-2
const DURATIONS = [3, 5, 10, 15, 20].map((m) => ({ m, premium: false }))

export default function Breathe() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const stageId = Number(params.get('stage')) || 1
  const stage = getStage(stageId)
  const { isPremium } = usePremium()

  const [pattern, setPattern] = useState(PATTERNS[0])
  const [minutes, setMinutes] = useState(3)
  const [running, setRunning] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [phaseRemain, setPhaseRemain] = useState(0)
  const [elapsed, setElapsed] = useState(0) // 초
  const [soundOn, setSoundOn] = useState(true)
  const [ripples, setRipples] = useState([])
  const [orbScale, setOrbScale] = useState(0.6) // 작은 원으로 시작
  const [ambientOn, setAmbientOn] = useState(true) // 배경음(파도)
  const [ambientKind, setAmbientKind] = useState(null) // 현재 재생 중인 배경음 종류
  const [narrationOn, setNarrationOn] = useState(true) // 나레이션(inhale/exhale/hold)
  const [preparing, setPreparing] = useState(false) // 시작 직후 잠깐의 준비 시간

  const tickRef = useRef(null)
  const bowlRef = useRef(null) // 현재 울리는 싱잉볼 핸들
  const ambientRef = useRef(null) // 배경음 핸들
  const rippleId = useRef(0)
  const soundOnRef = useRef(soundOn)
  soundOnRef.current = soundOn
  const ambientOnRef = useRef(ambientOn)
  ambientOnRef.current = ambientOn
  const narrationOnRef = useRef(narrationOn)
  narrationOnRef.current = narrationOn

  // 배경음 시작 (파도/모닥불 랜덤)
  const startAmbient = () => {
    if (ambientRef.current) return
    const a = createAmbient(0.3)
    ambientRef.current = a
    setAmbientKind(a.kind)
  }
  const stopAmbient = () => {
    if (ambientRef.current) {
      ambientRef.current.stop()
      ambientRef.current = null
    }
    setAmbientKind(null)
  }

  // 유효 페이즈만 (0초 페이즈는 건너뜀)
  const activePhases = pattern.phases
    .map((sec, i) => ({ sec, name: PHASE_NAMES[i], idx: i }))
    .filter((p) => p.sec > 0)

  // 페이즈 진입 시 연출: 원 크기 · 물결 · 싱잉볼
  const enterPhase = (idx, durSec) => {
    setPhaseIdx(idx)

    // 원 크기: 들숨→커짐, 날숨→작아짐, 멈춤(1,3)→유지
    if (idx === 0) setOrbScale(1.28)
    else if (idx === 2) setOrbScale(0.6)

    // 물결(시각 연출) — 들숨/날숨에 퍼짐
    if (idx === 0) spawnRipple(PHASE_COLORS[0])
    else if (idx === 2) spawnRipple(PHASE_COLORS[2])

    // 음성 안내 (inhale / hold / exhale) — 싱잉볼과 독립적으로 동작
    if (narrationOnRef.current) speak(PHASE_WORDS[idx])

    // 이전 소리 부드럽게 정리
    if (bowlRef.current) {
      bowlRef.current.stop(0.3)
      bowlRef.current = null
    }

    // 싱잉볼 소리 (켜져 있을 때만) — 멈춤(1,3)은 무음
    if (!soundOnRef.current) return
    if (idx === 0) {
      bowlRef.current = playBowl(INHALE_FREQ, durSec, 0.5) // 들숨: 높은 울림
    } else if (idx === 2) {
      bowlRef.current = playBowl(EXHALE_FREQ, durSec, 0.5) // 날숨: 낮은 울림
    }
  }

  const spawnRipple = (color) => {
    const id = ++rippleId.current
    setRipples((rs) => [...rs, { id, color }])
    // 애니메이션(스태거 포함) 종료 후 제거
    setTimeout(() => setRipples((rs) => rs.filter((r) => r.id !== id)), 6200)
  }

  useEffect(() => {
    if (!running) return

    let cancelled = false
    let curr = 0
    let remain = activePhases[0].sec

    // 바로 시작하지 않고 ~2.5초 준비 후 첫 들숨 시작 (나레이션과 함께)
    const prepTimer = setTimeout(() => {
      if (cancelled) return
      setPreparing(false)
      enterPhase(activePhases[0].idx, activePhases[0].sec)
      setPhaseRemain(remain)

      tickRef.current = setInterval(() => {
        remain -= 1
        setElapsed((e) => e + 1)

        if (remain <= 0) {
          curr = (curr + 1) % activePhases.length
          remain = activePhases[curr].sec
          enterPhase(activePhases[curr].idx, activePhases[curr].sec)
        }
        setPhaseRemain(remain)
      }, 1000)
    }, 2500)

    return () => {
      cancelled = true
      clearTimeout(prepTimer)
      clearInterval(tickRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  // 목표 시간 도달 시 자동 종료
  useEffect(() => {
    if (running && elapsed >= minutes * 60) finish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, running])

  // 언마운트 시 소리 정리
  useEffect(() => {
    return () => {
      if (bowlRef.current) bowlRef.current.stop(0.2)
      if (ambientRef.current) ambientRef.current.stop(0.2)
      stopNarration()
    }
  }, [])

  const start = () => {
    getAudioContext() // 사용자 제스처 시점에 오디오 활성화
    if (narrationOnRef.current) primeNarration() // 나레이션 자동재생 잠금 해제
    setElapsed(0)
    setPhaseIdx(0)
    setPhaseRemain(0)
    setOrbScale(0.6) // 작은 원에서 시작 → 첫 들숨에 커짐
    setPreparing(true) // 잠깐의 준비 시간
    setRunning(true)
    if (ambientOnRef.current) startAmbient() // 배경음(파도) 재생
  }

  const stopSound = () => {
    if (bowlRef.current) {
      bowlRef.current.stop(0.3)
      bowlRef.current = null
    }
  }

  const stop = () => {
    setRunning(false)
    setPreparing(false)
    clearInterval(tickRef.current)
    stopSound()
    stopAmbient()
    stopNarration()
  }

  // 음성 안내 켜기/끄기
  const toggleNarration = () => {
    setNarrationOn((v) => {
      const next = !v
      if (!next) stopNarration()
      return next
    })
  }

  // 배경음 켜기/끄기 (수행 중이면 즉시 반영)
  const toggleAmbient = () => {
    setAmbientOn((v) => {
      const next = !v
      if (!next) stopAmbient()
      else if (running) startAmbient()
      return next
    })
  }

  const finish = () => {
    stop()
    navigate('/complete', {
      state: {
        duration_sec: elapsed,
        stage: stageId,
        breath_pattern: pattern.key,
      },
    })
  }

  const isInhale = phaseIdx === 0
  const isExhale = phaseIdx === 2
  const currentPhaseSec = pattern.phases[phaseIdx] || 1
  const phaseColor = PHASE_COLORS[phaseIdx]

  // 배경/오브에 넘길 CSS 변수 (배경 물결도 원 크기를 따라 숨쉼)
  const stageVars = {
    '--phase-color': phaseColor,
    '--phase-dur': `${currentPhaseSec}s`,
    '--breath-scale': 0.75 + (orbScale - 0.6) * 0.5,
  }

  return (
    <div className="page">
      {running && (
        <div
          className={`breath-canvas ${isInhale ? 'is-inhale' : ''} ${isExhale ? 'is-exhale' : ''}`}
          style={stageVars}
        />
      )}

      <div className="container container--narrow breathe-wrap">
        <header className="page-head text-center">
          <p className="eyebrow">Breathe · {stageId}단계</p>
          <h1>{stage?.title_ko || '호흡하기'}</h1>
        </header>

        {!running ? (
          <>
            <p className="muted" style={{ marginBottom: '1.5rem' }}>
              호흡 패턴과 시간을 고르고, 편안히 앉아 시작하세요.
            </p>

            <p className="eyebrow">호흡 패턴</p>
            <div className="pattern-picker">
              {PATTERNS.map((p) => {
                const locked = p.premium && !isPremium
                return (
                  <button
                    key={p.key}
                    className={`pattern-chip ${pattern.key === p.key ? 'active' : ''} ${locked ? 'is-locked' : ''}`}
                    onClick={() => (locked ? navigate('/premium') : setPattern(p))}
                  >
                    {p.label}
                    {locked ? ' 🔒' : ''}
                  </button>
                )
              })}
            </div>

            <p className="eyebrow" style={{ marginTop: '1.5rem' }}>수행 시간</p>
            <div className="pattern-picker">
              {DURATIONS.map((d) => {
                const locked = d.premium && !isPremium
                return (
                  <button
                    key={d.m}
                    className={`pattern-chip ${minutes === d.m ? 'active' : ''} ${locked ? 'is-locked' : ''}`}
                    onClick={() => (locked ? navigate('/premium') : setMinutes(d.m))}
                  >
                    {d.m}분
                    {locked ? ' 🔒' : ''}
                  </button>
                )
              })}
            </div>

            <div className="setting-row" style={{ marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button className={`sound-toggle ${soundOn ? '' : 'is-off'}`} onClick={() => setSoundOn((v) => !v)}>
                🔔 싱잉볼 {soundOn ? '켜짐' : '꺼짐'}
              </button>
              <button className={`sound-toggle ${ambientOn ? '' : 'is-off'}`} onClick={toggleAmbient}>
                🌊 파도 소리 {ambientOn ? '켜짐' : '꺼짐'}
              </button>
              <button className={`sound-toggle ${narrationOn ? '' : 'is-off'}`} onClick={toggleNarration}>
                🎙️ 나레이션 {narrationOn ? '켜짐' : '꺼짐'}
              </button>
            </div>
            {narrationOn && (
              <p className="faint text-center" style={{ fontSize: '0.82rem', marginTop: '0.6rem' }}>
                들숨·멈춤·날숨에 “inhale · hold · exhale” 음성이 안내됩니다
              </p>
            )}

            <div className="breathe-controls">
              <button className="btn btn--primary" onClick={start}>호흡 시작하기</button>
            </div>
          </>
        ) : (
          <>
            <div className="breathe-stage">
              <div className="orb-holder">
                {/* 물결 파동 — 동그라미 정중앙에서 여러 겹으로 퍼짐 */}
                <div className="ripple-set">
                  {ripples.map((r) => (
                    <div key={r.id} className="ripple" style={{ '--ripple-color': r.color }}>
                      <span />
                      <span />
                      <span />
                    </div>
                  ))}
                </div>
                <div
                  className="breath-orb"
                  style={{
                    ...stageVars,
                    transform: `scale(${orbScale})`,
                  }}
                >
                  <span>{preparing ? '' : phaseRemain}</span>
                </div>
              </div>
              <div className="breath-phase-label">
                {preparing ? '잠시 후 시작합니다' : PHASE_NAMES[phaseIdx]}
              </div>
              <div className="breath-timer">
                {Math.floor(elapsed / 60)}분 {elapsed % 60}초 / {minutes}분
              </div>
            </div>

            {/* 소리 토글 (싱잉볼 · 파도 · 음성 안내) */}
            <div className="breathe-controls" style={{ marginBottom: '0.75rem' }}>
              <button
                className={`sound-toggle ${soundOn ? '' : 'is-off'}`}
                title="싱잉볼 소리"
                onClick={() => {
                  setSoundOn((v) => {
                    if (v) stopSound()
                    return !v
                  })
                }}
              >
                🔔 싱잉볼
              </button>
              <button className={`sound-toggle ${ambientOn ? '' : 'is-off'}`} title="파도 소리" onClick={toggleAmbient}>
                🌊 파도
              </button>
              <button className={`sound-toggle ${narrationOn ? '' : 'is-off'}`} title="나레이션" onClick={toggleNarration}>
                🎙️ 나레이션
              </button>
            </div>
            {/* 동작 버튼 */}
            <div className="breathe-controls">
              <button className="btn btn--ghost" onClick={stop}>일시정지</button>
              <button className="btn btn--primary" onClick={finish}>마치고 기록하기</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
