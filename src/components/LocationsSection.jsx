import React from 'react';
import { cities, whatsapp } from '../data/site.js';
import { Arrow } from './Icons.jsx';

export function LocationsSection({ locationsRef }) {
  return (
    <section className="locations" id="unidades" ref={locationsRef} aria-labelledby="locations-title">
        <div className="wrap locations-grid">
          <div className="locations-brand" aria-label="Dudu Barber Shop"><span>DUDU</span><small>BARBER SHOP</small></div>
          <div className="locations-heading">
            <p className="section-label">ONDE ESTAMOS</p>
            <h2 id="locations-title">Três cidades.<br />Uma história.</h2>
            <p className="locations-intro">A Dudu Barber Shop está presente em três cidades do Rio Grande do Norte.</p>
          </div>
          <ul className="city-list" aria-label="Cidades atendidas">
            {cities.map((city) => <li className="city-row" key={city}>
              <svg className="location-pin" viewBox="0 0 24 30" fill="none" aria-hidden="true"><path d="M12 28S3 19.7 3 11a9 9 0 1 1 18 0c0 8.7-9 17-9 17Z" fill="currentColor"/><circle cx="12" cy="11" r="3" fill="#111"/></svg>
              <div><h3>{city}</h3><span>RN</span></div>
            </li>)}
          </ul>
          <a className="locations-cta" href={whatsapp} target="_blank" rel="noreferrer">Fale com a equipe <Arrow diagonal /></a>
        </div>
      </section>
  );
}
