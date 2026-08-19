import { useParams, Link, Navigate } from 'react-router-dom'
import { DOCS, BUSINESS, biz } from '../data/legal'
import './Legal.css'

// 문서 3종을 한 컴포넌트가 렌더한다. 구조가 같아 화면을 나눌 이유가 없고,
// 문구만 데이터에서 고치면 되니 개정이 쉽다.
export default function Legal() {
  const { slug } = useParams()
  const doc = DOCS[slug]
  if (!doc) return <Navigate to="/" replace />

  return (
    <div className="page">
      <div className="container container--narrow legal">
        <header className="page-head">
          <p className="eyebrow">시행일 {doc.effective}</p>
          <h1>{doc.title}</h1>
          {doc.intro && <p>{doc.intro}</p>}
        </header>

        {doc.sections.map((s) => (
          <section key={s.h} className={`legal__section ${s.emphasis ? 'is-emphasis' : ''}`}>
            <h2>{s.h}</h2>

            {s.table && (
              <div className="legal__table-wrap">
                <table className="legal__table">
                  <thead>
                    <tr>{s.table.head.map((h) => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map((r, i) => (
                      <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {s.list && (
              <ol className="legal__list">
                {s.list.map((li, i) => <li key={i}>{li}</li>)}
              </ol>
            )}
          </section>
        ))}

        <section className="legal__section">
          <h2>사업자 정보</h2>
          <ul className="legal__biz">
            <li><span>상호</span><b>{biz('name')}</b></li>
            <li><span>대표자</span><b>{biz('ceo')}</b></li>
            <li><span>사업자등록번호</span><b>{biz('regNo')}</b></li>
            <li><span>주소</span><b>{biz('address')}</b></li>
            <li><span>전화</span><b>{biz('tel')}</b></li>
            <li><span>이메일</span><b>{BUSINESS.email}</b></li>
            <li><span>통신판매업 신고</span><b>{biz('salesNo')}</b></li>
          </ul>
        </section>

        <div className="legal__nav">
          {Object.values(DOCS)
            .filter((d) => d.slug !== slug)
            .map((d) => (
              <Link key={d.slug} to={`/legal/${d.slug}`} className="faint">{d.title} →</Link>
            ))}
        </div>
      </div>
    </div>
  )
}
