import React from 'react';
import { Arrow } from './Icons.jsx';

export function StorySection({ storyRef }) {
  return (
    <section className="story section-light" id="historia" tabIndex="-1" ref={storyRef} aria-labelledby="story-title">
        <div className="wrap story-grid">
          <div className="story-heading"><p className="section-label">NOSSA HISTÓRIA</p><h2 id="story-title">Uma história que começou com um <em className="story-highlight">sonho.</em></h2></div>
          <figure className="story-visual">
            <img src="/images/dudu-historia.webp" alt="Dudu aparando a barba de um cliente na barbearia" width="1170" height="1180" loading="lazy" decoding="async" />
          </figure>
          <div className="story-copy"><p>Em <strong className="story-highlight">2016</strong>, um casal de jovens empreendedores decidiu transformar o sonho de ter o próprio negócio em realidade.</p><p>Com o tempo, a formação de novos barbeiros passou a fazer parte da <span className="story-trajectory">nossa trajetória.</span></p><a className="story-link" href="#equipe">Conheça a equipe <Arrow diagonal /></a></div>
        </div>
      </section>
  );
}
