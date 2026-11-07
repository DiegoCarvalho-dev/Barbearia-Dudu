import React from 'react';
import { heroImage } from '../data/site.js';

export function HeroSection({ heroRef, scrollToStory }) {
  return (
    <section id="inicio" className="hero" aria-labelledby="hero-title" ref={heroRef}>
        <div className="hero-word" aria-hidden="true"><span>DUDU</span></div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-photo-layer"><img className="hero-photo" src={heroImage} alt="" fetchPriority="high" /></div>
        </div>
        <div className="hero-shade" aria-hidden="true"></div>
        <div className="hero-content wrap">
          <div className="hero-content-inner">
            <p className="hero-kicker">DUDU BARBER SHOP <span>·</span> DESDE 2016</p>
            <div className="hero-rule" aria-hidden="true"></div>
            <h1 id="hero-title"><span>Seu estilo,</span><span>nossa história.</span></h1>
            <a className="button hero-button" href="#historia" onClick={scrollToStory}>Conheça a barbearia <span className="arrow" aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className="hero-cities wrap" aria-label="Unidades no Rio Grande do Norte"><span className="city-pin" aria-hidden="true">●</span><span>São José de Mipibu</span><i aria-hidden="true"></i><span>Goianinha</span><i aria-hidden="true"></i><span>Nísia Floresta</span><span className="state">RN</span></div>
      </section>
  );
}
