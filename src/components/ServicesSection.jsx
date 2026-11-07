import React from 'react';
import { services, whatsapp } from '../data/site.js';
import { Arrow, ServiceIcon } from './Icons.jsx';

export function ServicesSection({ servicesRef }) {
  return (
    <section className="services" id="servicos" ref={servicesRef} aria-labelledby="services-title">
        <div className="wrap services-inner">
          <div className="services-header">
            <div className="services-heading"><p className="section-label">O QUE FAZEMOS</p><h2 id="services-title">Cuidado em<br />cada <em>detalhe.</em></h2></div>
            <p className="services-intro">Conheça os serviços da Dudu Barber Shop.</p>
          </div>
          <div className="services-grid">{services.map(([number, name, description, icon]) => <article className="service-item" key={number}>
            <div className="service-item-number"><span>{number}</span></div>
            <ServiceIcon type={icon} />
            <div className="service-item-copy"><h3>{name}</h3><p>{description}</p></div>
          </article>)}</div>
          <a className="services-link" href={whatsapp} target="_blank" rel="noreferrer">Consultar pelo WhatsApp <Arrow diagonal /></a>
        </div>
      </section>
  );
}
