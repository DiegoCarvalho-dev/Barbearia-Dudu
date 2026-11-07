import React from 'react';
import { plans, whatsapp } from '../data/site.js';
import { Arrow } from './Icons.jsx';

export function PlansSection({ plansRef }) {
  return (
    <section className="plans" id="planos" ref={plansRef} aria-labelledby="plans-title">
        <div className="wrap plans-inner">
          <div className="plans-heading">
            <p className="section-label">ASSINATURAS</p>
            <h2 id="plans-title">Seu plano, <em>seu estilo.</em></h2>
            <p className="plans-intro">Conheça os planos e consulte a equipe para confirmar as condições.</p>
          </div>
          <div className="plan-grid">{plans.map((plan) => <article className="plan-card" key={plan.name}>
            <h3>{plan.name}</h3>
            <p className="plan-price">R$ {plan.price},00</p>
            <p className="plan-detail">{plan.details}</p>
            <a href={whatsapp} target="_blank" rel="noreferrer" aria-label={`Consultar plano ${plan.name} pelo WhatsApp`}>Consultar plano <Arrow diagonal /></a>
          </article>)}</div>
          <p className="plan-note">Valores e condições sujeitos à confirmação com a equipe.</p>
        </div>
      </section>
  );
}
