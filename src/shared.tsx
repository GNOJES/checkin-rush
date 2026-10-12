import { Plane, ArrowUpRight, Check, ChevronLeft } from 'lucide-react';
import { scenario } from './scenario';
export function RouteArt() {
  return (
    <div className="route-art" aria-hidden="true">
      <div className="orbit o1" />
      <div className="orbit o2" />
      <div className="route-line" />
      <span className="route-dot" />
      <Plane className="route-plane" size={45} />
      <span className="arrival-dot" />
      <span className="art-label">NEXT STOP, SEOUL</span>
    </div>
  );
}
export function Passport() {
  return (
    <div className="passport">
      <div className="passport-top">
        REPUBLIC OF FICTION <span>여행 서류</span>
      </div>
      <div className="passport-body">
        <div className="portrait">
          <svg viewBox="0 0 70 90" aria-hidden="true">
            <circle cx="35" cy="30" r="17" />
            <path d="M5 88 Q5 52 35 52 Q65 52 65 88" />
          </svg>
          <small>가상 인물</small>
        </div>
        <div>
          <small>SURNAME / 성</small>
          <strong>HAN</strong>
          <small>GIVEN NAMES / 이름</small>
          <strong>SEOJUN</strong>
          <small>FULL NAME</small>
          <b>HAN SEOJUN</b>
        </div>
      </div>
      <div className="mrz">
        P&lt;FIC HAN&lt;&lt;SEOJUN&lt;&lt;&lt;&lt;&lt;
        <br />
        GAME&lt;DOCUMENT&lt;ONLY&lt;&lt;&lt;
      </div>
      <p>게임용 가상 서류 · 실제 신분증이 아닙니다</p>
    </div>
  );
}
export function BoardingPass() {
  return (
    <div className="boarding-pass">
      <div className="ticket-brand">
        <Plane size={20} /> moa airlines <span>BOARDING PASS</span>
      </div>
      <div className="ticket-route">
        <div>
          <small>TAIPEI</small>
          <strong>TPE</strong>
          <span>타이베이 하늘공항</span>
        </div>
        <Plane size={27} />
        <div>
          <small>SEOUL</small>
          <strong>SEL</strong>
          <span>서울</span>
        </div>
      </div>
      <div className="ticket-name">
        <small>PASSENGER / 승객</small>
        <strong>{scenario.name}</strong>
      </div>
      <div className="ticket-grid">
        <div>
          <small>FLIGHT</small>
          <b>MA204</b>
        </div>
        <div>
          <small>GATE</small>
          <b>C08</b>
        </div>
        <div>
          <small>SEAT</small>
          <b>12A</b>
        </div>
        <div>
          <small>DEPARTURE</small>
          <b>14:35</b>
        </div>
      </div>
      <div className="ticket-footer">
        <div className="barcode" aria-hidden="true" />
        <small>공항 현지 UTC+8 · 장식용 바코드</small>
      </div>
    </div>
  );
}
export function Back({ onClick, label = '돌아가기' }: { onClick: () => void; label?: string }) {
  return (
    <button className="back" onClick={onClick} aria-label={label}>
      <ChevronLeft size={19} />
      {label}
    </button>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {desc && <p>{desc}</p>}
    </div>
  );
}
export function DoneMark({ done }: { done: boolean }) {
  return (
    <span className={'done-mark ' + (done ? 'complete' : '')}>
      {done ? <Check size={15} /> : <ArrowUpRight size={15} />}
    </span>
  );
}
