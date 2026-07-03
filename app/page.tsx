"use client";

import dynamic from "next/dynamic";

const LastcloudScene = dynamic(() => import("@/components/LastcloudScene"), { ssr: false });

export default function Home() {
  return (
    <>
      <LastcloudScene />

      <div className="content">
        {/* HERO */}
        <section className="hero">
          <div className="hero__top">
            <span>lastcloud</span>
            <span>©2026</span>
          </div>
          <div className="hero__bottom">
            <div className="hero__tag">AI · Design · Creative Technology</div>
            <div className="hero__scroll">scroll ↓</div>
          </div>
        </section>

        {/* 01 LASTCLOUD */}
        <section className="left">
          <div className="panel">
            <h2>Your Creative<br />Basecamp</h2>
            <p>
              LastCloud는 AI 프로덕트, 디자인, 콘텐츠가 모이는 창작 베이스캠프입니다.
              다양한 아이디어를 만들고, 연결하고, 한곳에서 경험할 수 있습니다.
            </p>
          </div>
        </section>

        {/* 02 OMNI — pinned: logo morphs into ring + wave */}
        <section className="right pin-section pin-omni">
          <div className="pin-inner">
            <div className="panel">
              <h2>Your Universal<br />AI Assistant OMNI</h2>
              <p>OMNI는 더 직관적인 AI 경험을 위해 설계된 멀티모달(Multimodal) AI 비서입니다.</p>
              <div className="cta-row">
                <a className="cta" href="https://omni-teal.vercel.app/" target="_blank" rel="noreferrer">
                  OMNI 열기 →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 03 DESIGN — pinned: logo explodes into cubes */}
        <section className="left pin-section pin-explode">
          <div className="pin-inner">
            <div className="panel">
              <h2>Design Beyond<br />the Surface</h2>
              <p>브랜드, UI, 그래픽 감각적인 비주얼과 정교한 디테일의 작업들.</p>
              <div className="cta-row">
                <a className="cta" href="#" target="_blank" rel="noreferrer">
                  포트폴리오 보기 →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 04 CHANNELS */}
        <section className="right">
          <div className="panel">
            <div className="stat">
              3,388,875<span>Views</span>
            </div>
            <h2>YouTube<br />Instagram</h2>
            <div className="cta-row">
              <a className="cta" href="https://www.youtube.com/@lastcloud" target="_blank" rel="noreferrer">YouTube →</a>
              <a className="cta cta--ghost" href="https://www.instagram.com/lastcloud_official/" target="_blank" rel="noreferrer">Instagram →</a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <h2>Contact</h2>
          <div className="links">
            <a href="mailto:jhy0219@gmail.com">Email</a>
            <a href="https://www.youtube.com/@lastcloud" target="_blank" rel="noreferrer">YouTube</a>
            <a href="https://www.instagram.com/lastcloud_official/" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://omni-teal.vercel.app/" target="_blank" rel="noreferrer">OMNI</a>
          </div>
          <p className="footer__copy">© 2026 lastcloud</p>
        </footer>
      </div>
    </>
  );
}
