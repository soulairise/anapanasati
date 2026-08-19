// ============================================================
// 수련 갈래(track) — 수행일지를 3갈래 공용으로 쓰기 위한 라벨 해석기
//
// sessions.track = 'anapanasati' | 'yoga' | 'vipassana'
// 화면마다 if문으로 갈래를 분기하면 금방 흩어지므로, "기록 한 줄 → 표시용 정보"
// 변환을 여기 한 곳에 모은다. 갈래가 늘어도 이 파일만 고치면 된다.
// ============================================================

import { getStage } from '../data/stages'
import { getTechnique } from '../data/pranayama'
import { getPractice } from '../data/vipassana'
import { getPractice as getMetta } from '../data/metta'

export const TRACKS = {
  anapanasati: { key: 'anapanasati', label: '호흡하기', icon: '🫧', to: '/breathe' },
  yoga: { key: 'yoga', label: '요가 호흡', icon: '🌀', to: '/yoga' },
  vipassana: { key: 'vipassana', label: '관찰 수행', icon: '💧', to: '/vipassana' },
  metta: { key: 'metta', label: '마음 나누기', icon: '💛', to: '/metta' },
}

export const getTrack = (key) => TRACKS[key] || TRACKS.anapanasati

/**
 * 기록 한 줄을 표시용 정보로 푼다.
 * @param {{track?:string, stage?:number, practice?:string, breath_pattern?:string}} s
 * @returns {{track:object, title:string, detail:string, backTo:string}}
 */
export function describeSession(s) {
  const track = getTrack(s.track)

  if (track.key === 'yoga') {
    const t = getTechnique(s.practice)
    return {
      track,
      title: t?.name_ko || '요가 호흡',
      detail: t?.name_sanskrit || '',
      backTo: t ? `/yoga/${t.id}` : '/yoga',
    }
  }

  if (track.key === 'vipassana') {
    const p = getPractice(s.practice)
    return {
      track,
      title: p?.title || '관찰 수행',
      // 브레스 카운팅은 결과 숫자가 곧 내용이라 그걸 우선 보여준다.
      detail: s.breath_pattern || p?.context || '',
      backTo: p ? `/vipassana/${p.id}` : '/vipassana',
    }
  }

  if (track.key === 'metta') {
    const m = getMetta(s.practice)
    return {
      track,
      title: m?.title || '마음 나누기',
      detail: m?.context || '',
      backTo: m ? `/metta/${m.id}` : '/metta',
    }
  }

  // 아나빠나사띠 — stage로 식별한다
  const stage = getStage(s.stage)
  return {
    track,
    title: stage?.title_ko || `${s.stage}단계`,
    detail: s.breath_pattern ? `패턴 ${s.breath_pattern}` : '',
    backTo: stage ? `/learn/${stage.id}` : '/learn',
  }
}
