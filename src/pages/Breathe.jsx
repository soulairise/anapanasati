import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getStage } from '../data/stages'
import { playBowl, getAudioContext, INHALE_FREQ, EXHALE_FREQ } from '../lib/bowl'
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

  const tickRef = useRef(null)
  const bowlRef = useRef(null) // 현재 울리는 싱잉볼 핸들
  const rippleId = useRef(0)
  const soundOnRef = useRef(soundOn)
  soundOnRef.current = soundOn

  // 유효 페이즈만 (0초 페이즈는 건너뜀)
  const activePhases = pattern.phases
    .map((sec, i) => ({ sec, name: PHASE_NAMES[i], idx: i }))
    .filter((p) => p.sec > 0)

  // 페이즈 진입 시 연출: 싱잉볼 + 물결
  const enterPhase = (idx, durSec) => {
    setPhaseIdx(idx)

    // 이전 소리 부드럽게 정리
    if (bowlRef.current) {
      bowlRef.current.stop(0.3)
      bowlRef.current = null
    }

    if (!soundOnRef.current) return

    if (idx === 0) {
      // 들숨 — 높은 싱잉볼
      bowlRef.current = playBowl(INHALE_FREQ, durSec, 0.5)
      spawnRipple(PHASE_COLORS[0])
    } else if (idx === 2) {
      // 날숨 — 낮은 싱잉볼
      bowlRef.current = playBowl(EXHALE_FREQ, durSec, 0.5)
      spawnRipple(PHASE_COLORS[2])
    }
    // 멈춤(1,3)은 무음
  }

  const spawnRipple = (color) => {
    const id = ++rippleId.current
    setRipples((rs) => [...rs, { id, color }])
    // 애니메이션 종료 후 제거
    setTimeout(() => setRipples((rs) => rs.filter((r) => r.id !== id)), 5200)
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
    }
  }, [])

  const start = () => {
    getAudioContext() // 사용자 제스처 시점에 오디오 활성화
    setElapsed(0)
    setRunning(true)
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
  const orbScale = isInhale || phaseIdx === 1 ? 1.35 : 0.7
  const currentPhaseSec = pattern.phases[phaseIdx] || 1
  const phaseColor = PHASE_COLORS[phaseIdx]

  // 배경/오브에 넘길 CSS 변수
  const stageVars = {
    '--phase-color': phaseColor,
    '--phase-dur': `${currentPhaseSec}s`,
    '--breath-scale': isInhale || phaseIdx === 1 ? 1.15 : 0.75,
  }

  return (
    <div className="page">
      {running && (
        <>
          <div
            className={`breath-canvas ${isInhale ? 'is-inhale' : ''} ${isExhale ? 'is-exhale' : ''}`}
            style={stageVars}
          />
          <div className="ripple-layer">
            {ripples.map((r) => (
              <div key={r.id} className="ripple" style={{ '--ripple-color': r.color }} />
            ))}
          </div>
        </>
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
                {soundOn ? '🔊 싱잉볼 소리 켜짐' : '🔇 소리 꺼짐'}
              </button>
            </div>

            <div className="breathe-controls">
              <button className="btn btn--primary" onClick={start}>호흡 시작하기</button>
            </div>
          </>
        ) : (
          <>
            <div className="breathe-stage">
              <div
                className="breath-orb"
                style={{
                  ...stageVars,
                  transform: `scale(${orbScale})`,
                }}
              >
                <span>{phaseRemain}</span>
              </div>
              <div className="breath-phase-label">{PHASE_NAMES[phaseIdx]}</div>
              <div className="breath-timer">
                {Math.floor(elapsed / 60)}분 {elapsed % 60}초 / {minutes}분
              </div>
            </div>

            <div className="breathe-controls">
              <button
                className="sound-toggle"
                onClick={() => {
                  setSoundOn((v) => {
                    if (v) stopSound()
                    return !v
                  })
                }}
              >
                {soundOn ? '🔊' : '🔇'}
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
