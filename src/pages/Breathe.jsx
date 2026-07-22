import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getStage } from '../data/stages'
import { playBowl, getAudioContext, INHALE_FREQ, EXHALE_FREQ } from '../lib/bowl'
import { createAmbient, AMBIENT_LABELS } from '../lib/ambient'
import './Breathe.css'

// 호흡 패턴: [들숨, 멈춤, 날숨, 멈춤] (초)
const PATTERNS = [
  { key: '4-4-6-2', label: '기본 (4-4-6-2)', phases: [4, 4, 6, 2] },
  { key: '4-7-8-0', label: '이완 (4-7-8)', phases: [4, 7, 8, 0] },
  { key: '4-4-4-4', label: '사각 (4-4-4-4)', phases: [4, 4, 4, 4] },
  { key: '6-0-6-0', label: '고요 (6-6)', phases: [6, 0, 6, 0] },
]
const PHASE_NAMES = ['들이쉬기', '멈추기', '내쉬기', '멈추기']
// 페이즈별 색상 (들숨→멈춤→날숨→멈춤 순으로 그라데이션 순환)
const PHASE_COLORS = ['#8a9a82', '#6fa0a8', '#c2a184', '#9a94a6']
const DURATIONS = [3, 5, 10] // 분

export default function Breathe() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const stageId = Number(params.get('stage')) || 1
  const stage = getStage(stageId)

  const [pattern, setPattern] = useState(PATTERNS[0])
  const [minutes, setMinutes] = useState(3)
  const [running, setRunning] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [phaseRemain, setPhaseRemain] = useState(0)
  const [elapsed, setElapsed] = useState(0) // 초
  const [soundOn, setSoundOn] = useState(true)
  const [ripples, setRipples] = useState([])
  const [orbScale, setOrbScale] = useState(0.6) // 작은 원으로 시작
  const [ambientOn, setAmbientOn] = useState(true) // 배경음(파도/모닥불)
  const [ambientKind, setAmbientKind] = useState(null) // 현재 재생 중인 배경음 종류

  const tickRef = useRef(null)
  const bowlRef = useRef(null) // 현재 울리는 싱잉볼 핸들
  const ambientRef = useRef(null) // 배경음 핸들
  const rippleId = useRef(0)
  const soundOnRef = useRef(soundOn)
  soundOnRef.current = soundOn
  const ambientOnRef = useRef(ambientOn)
  ambientOnRef.current = ambientOn

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

    let curr = 0
    let remain = activePhases[0].sec
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

    return () => clearInterval(tickRef.current)
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
    }
  }, [])

  const start = () => {
    getAudioContext() // 사용자 제스처 시점에 오디오 활성화
    setElapsed(0)
    setOrbScale(0.6) // 작은 원에서 시작 → 첫 들숨에 커짐
    setRunning(true)
    if (ambientOnRef.current) startAmbient() // 배경음(파도/모닥불) 재생
  }

  const stopSound = () => {
    if (bowlRef.current) {
      bowlRef.current.stop(0.3)
      bowlRef.current = null
    }
  }

  const stop = () => {
    setRunning(false)
    clearInterval(tickRef.current)
    stopSound()
    stopAmbient()
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
              {PATTERNS.map((p) => (
                <button
                  key={p.key}
                  className={`pattern-chip ${pattern.key === p.key ? 'active' : ''}`}
                  onClick={() => setPattern(p)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <p className="eyebrow" style={{ marginTop: '1.5rem' }}>수행 시간</p>
            <div className="pattern-picker">
              {DURATIONS.map((m) => (
                <button
                  key={m}
                  className={`pattern-chip ${minutes === m ? 'active' : ''}`}
                  onClick={() => setMinutes(m)}
                >
                  {m}분
                </button>
              ))}
            </div>

            <div className="setting-row" style={{ marginTop: '1.5rem' }}>
              <button className="sound-toggle" onClick={() => setSoundOn((v) => !v)}>
                {soundOn ? '🔊 싱잉볼 켜짐' : '🔇 싱잉볼 꺼짐'}
              </button>
              <button className="sound-toggle" onClick={toggleAmbient}>
                {ambientOn ? '🌊 파도 소리 켜짐' : '🔇 파도 소리 꺼짐'}
              </button>
            </div>
            {ambientOn && (
              <p className="faint text-center" style={{ fontSize: '0.82rem', marginTop: '0.6rem' }}>
                잔잔한 파도 소리가 배경으로 재생됩니다
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
                  <span>{phaseRemain}</span>
                </div>
              </div>
              <div className="breath-phase-label">{PHASE_NAMES[phaseIdx]}</div>
              <div className="breath-timer">
                {Math.floor(elapsed / 60)}분 {elapsed % 60}초 / {minutes}분
              </div>
            </div>

            <div className="breathe-controls">
              <button
                className="sound-toggle"
                title="싱잉볼 소리"
                onClick={() => {
                  setSoundOn((v) => {
                    if (v) stopSound()
                    return !v
                  })
                }}
              >
                {soundOn ? '🔊 싱잉볼' : '🔇 싱잉볼'}
              </button>
              <button className="sound-toggle" title="배경음 (파도)" onClick={toggleAmbient}>
                {ambientOn ? (ambientKind ? AMBIENT_LABELS[ambientKind] : '🌊 파도') : '🔇 파도'}
              </button>
              <button className="btn btn--ghost" onClick={stop}>일시정지</button>
              <button className="btn btn--primary" onClick={finish}>마치고 기록하기</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
