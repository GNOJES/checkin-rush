import { Search, ChevronRight, Mail as MailIcon, ChevronDown, Plane } from 'lucide-react';
import { GameState, Action } from './game';
import { mailData, scenario } from './scenario';
import { Back } from './shared';
import { useState } from 'react';
export type Send = (a: Omit<Action, 'now'>) => void;
export function Mail({ s, send }: { s: GameState; send: Send }) {
  const [expanded, setExpanded] = useState(false);
  const selected = mailData.find((m) => m.id === s.mail);
  if (selected)
    return (
      <div className="mail-detail">
        <Back label="메일함으로" onClick={() => send({ type: 'MAIL_BACK' })} />
        <span className={'mail-tag ' + selected.kind}>
          {selected.kind === 'ad'
            ? '광고'
            : selected.kind === 'important'
              ? '중요 안내'
              : '여행 정보'}
        </span>
        <h2>{selected.subject}</h2>
        <div className="sender-row">
          <div className="sender-avatar">{selected.initial}</div>
          <div>
            <b>{selected.sender}</b>
            <small>받는 사람: 나 · {selected.time} (공항 현지)</small>
          </div>
        </div>
        <div className="mail-letter">
          {selected.id === 'payment' && (
            <>
              <span className="eyebrow">PAYMENT CONFIRMED</span>
              <h3>여행 준비, 결제 완료!</h3>
              <div className="order-card">
                <small>여행사 주문번호</small>
                <strong>{scenario.order}</strong>
              </div>
            </>
          )}
          <p>{selected.body}</p>
          {selected.id === 'payment' && (
            <>
              <button className="expand" onClick={() => setExpanded(!expanded)}>
                {expanded ? '예약 상세 접기' : '예약 상세 펼치기'}
                <ChevronDown size={18} />
              </button>
              {expanded && (
                <dl className="details">
                  <dt>항공사 예약번호</dt>
                  <dd>{scenario.code}</dd>
                  <dt>예약 이름</dt>
                  <dd>{scenario.wrongName}</dd>
                  <dt>항공편</dt>
                  <dd>모아항공 MA204</dd>
                </dl>
              )}
            </>
          )}
          {selected.id === 'gate' && (
            <div className="gate-change">
              <span>B12</span>
              <ChevronRight />
              <strong>C08</strong>
            </div>
          )}
          {selected.id === 'departure' && (
            <div className="flight-note">
              <Plane size={24} />
              <strong>MA204 · 서울행</strong>
              <dl className="details">
                <dt>탑승권 발급 마감</dt>
                <dd>14:05</dd>
                <dt>출발 예정</dt>
                <dd>14:35</dd>
                <dt>최초 탑승구</dt>
                <dd>B12</dd>
              </dl>
              <small>공항 현지 UTC+8 · 한국보다 1시간 느림</small>
            </div>
          )}
          <div className="letter-sign">
            좋은 여행 되세요.
            <br />
            {selected.sender} 드림
          </div>
        </div>
      </div>
    );
  const query = s.inputs.search.toLowerCase();
  const filtered = mailData.filter((m) =>
    `${m.subject} ${m.sender} ${m.preview} ${m.body}`.toLowerCase().includes(query),
  );
  return (
    <>
      <div className="app-title">
        <div>
          <span className="eyebrow">YOUR TRAVEL INBOX</span>
          <h2>
            받은 메일함<span className="count">4</span>
          </h2>
        </div>
        <MailIcon size={28} />
      </div>
      <label className="search-box">
        <Search size={18} />
        <input
          aria-label="메일 검색"
          placeholder="메일 검색"
          value={s.inputs.search}
          onChange={(e) => send({ type: 'INPUT', key: 'search', value: e.target.value })}
        />
      </label>
      <div className="mail-filter">
        전체 메일 <span>여행에 필요한 소식이 도착했어요</span>
      </div>
      <div className="mail-list">
        {filtered.map((m) => (
          <button
            key={m.id}
            className={'mail-item ' + (s.read.includes(m.id) ? 'read' : '')}
            onClick={() => {
              setExpanded(false);
              send({ type: 'MAIL', key: m.id });
            }}
          >
            <span className={'sender-avatar ' + m.kind}>{m.initial}</span>
            <span className="mail-info">
              <span className="mail-meta">
                <b>{m.sender}</b>
                <small>{m.time}</small>
              </span>
              <strong>{m.subject}</strong>
              <span>{m.preview}</span>
              {m.kind === 'important' && <em>탑승구 변경</em>}
              {m.kind === 'ad' && <em className="ad-tag">광고</em>}
            </span>
            <ChevronRight size={15} />
          </button>
        ))}
      </div>
      {!filtered.length && <p className="empty">검색 결과가 없습니다.</p>}
      <p className="app-footnote">모든 메일은 게임 속 가상 데이터입니다.</p>
    </>
  );
}
