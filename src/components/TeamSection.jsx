import React from 'react';
import { Arrow } from './Icons.jsx';

export function TeamSection({ teamRef }) {
  return (
    <section className="team" id="equipe" ref={teamRef} aria-labelledby="team-title">
        <div className="wrap team-grid">
          <div className="team-heading">
            <p className="section-label">NOSSA EQUIPE</p>
            <h2 id="team-title">Pessoas que fazem a <em>diferença.</em></h2>
          </div>
          <div className="team-copy">
            <p>Por trás de cada atendimento, existe uma equipe que faz parte da história da Dudu Barber Shop.</p>
            <p>Conheça as pessoas que recebem nossos clientes em cada unidade.</p>
            <a className="team-link" href="https://www.instagram.com/dudu.barbershop01/" target="_blank" rel="noreferrer">Acompanhe no Instagram <Arrow diagonal /></a>
          </div>
          <figure className="team-visual">
            <img src="/images/equipe-dudu.webp" alt="Equipe da Dudu Barber Shop reunida para uma fotografia" width="885" height="885" loading="lazy" decoding="async" />
          </figure>
        </div>
      </section>
  );
}
