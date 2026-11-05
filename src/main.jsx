import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

// Fotografia principal; substitua o arquivo em /public/images quando necessário.
const heroImage = '/images/dudu-home.webp';
// Número de demonstração. Substituir pelo número oficial antes da publicação final.
const whatsapp = 'https://wa.me/5500000000000';

const services = [
  ['01', 'Cabelo', 'Corte social, degradê e corte com tesoura.'],
  ['02', 'Barba', 'Barba, barba terapia e cuidados para o seu estilo.'],
  ['03', 'Mais cuidados', 'Sobrancelha, limpeza facial e outros serviços.'],
];

const plans = [
  { name: 'Cabelo', price: '55', details: '2 vezes no mês' },
  { name: 'Barba', price: '100', details: 'Consulte as condições' },
  { name: 'Cabelo + barba', price: '200', details: '4 vezes no mês' },
];

const cities = ['São José de Mipibu', 'Nísia Floresta', 'Goianinha'];

function Arrow({ diagonal = false }) {
  return <span aria-hidden="true" className="arrow">{diagonal ? '↗' : '↘'}</span>;
}

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.4 11.8a8.4 8.4 0 0 1-12.5 7.3L3.6 20.3l1.2-4.1a8.4 8.4 0 1 1 15.6-4.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8.5 7.7c.2-.4.4-.4.7-.4h.3c.1 0 .3 0 .4.4l.6 1.4c.1.2.1.4 0 .5l-.5.6c-.1.1-.2.2-.1.4.3.6.8 1.1 1.3 1.6.6.5 1.2.9 1.9 1.2.2.1.3.1.4-.1l.7-.8c.1-.2.3-.2.5-.1l1.4.7c.2.1.4.2.4.4 0 .2-.1 1-.7 1.4-.5.4-1.1.5-1.7.3-1.1-.3-2.4-.9-3.8-2.2-1.1-1-2-2.3-2.3-3.5-.2-.7 0-1.3.5-1.8Z" fill="currentColor"/></svg>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return <>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className="header">
      <a href="#inicio" className="brand" aria-label="Dudu Barber Shop, início" onClick={closeMenu}>
        <span>DUDU</span><small>BARBER SHOP</small>
      </a>
      <button className="menu-toggle" aria-expanded={menuOpen} aria-controls="navigation" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenuOpen(!menuOpen)}>
        <span></span><span></span>
      </button>
      <nav id="navigation" className={menuOpen ? 'navigation is-open' : 'navigation'} aria-label="Navegação principal">
        <a href="#historia" onClick={closeMenu}>História</a>
        <a href="#equipe" onClick={closeMenu}>Equipe</a>
        <a href="#servicos" onClick={closeMenu}>Serviços</a>
        <a href="#planos" onClick={closeMenu}>Planos</a>
        <a href="#unidades" onClick={closeMenu}>Unidades</a>
        <a className="nav-contact" href={whatsapp} target="_blank" rel="noreferrer" onClick={closeMenu}>Fale com a gente <Arrow diagonal /></a>
      </nav>
    </header>

    <main id="conteudo">
      <section id="inicio" className="hero" aria-labelledby="hero-title">
        <div className="hero-visual" aria-hidden="true">
          {heroImage ? <img className="hero-photo" src={heroImage} alt="" fetchPriority="high" /> : <div className="hero-placeholder"><span className="placeholder-ring"></span><span className="placeholder-letter">D</span><span className="placeholder-caption">DUDU / BARBER SHOP</span></div>}
        </div>
        <div className="hero-shade" aria-hidden="true"></div>
        <div className="hero-content wrap">
          <p className="eyebrow"><span></span> SÃO JOSÉ DE MIPIBU · RN</p>
          <h1 id="hero-title">DUDU<br />BARBER<br /><span>SHOP.</span></h1>
          <p className="hero-copy">Uma história construída com dedicação, estilo e pessoas.</p>
          <a className="button button-red" href="#historia">Conheça nossa história <Arrow diagonal /></a>
        </div>
        <div className="hero-foot wrap"><span>BARBEARIA · DESDE 2016</span><a href="#historia">ROLE PARA CONHECER <span>↓</span></a></div>
      </section>

      <section className="story section-light" id="historia">
        <div className="wrap story-grid">
          <div><p className="section-label"><span>01 /</span> NOSSA HISTÓRIA</p><h2>Uma história<br />feita <em>de perto.</em></h2></div>
          <div className="story-copy"><p className="lead">Tudo começou em 2016, com o sonho de construir o próprio negócio.</p><p>A Dudu Barber Shop nasceu do trabalho e da dedicação de um casal de jovens empreendedores. Ao longo da trajetória, a formação de novos barbeiros também passou a fazer parte dessa história.</p><p>Hoje, a marca está presente em São José de Mipibu, Nísia Floresta e Goianinha.</p><a className="text-link" href="https://www.instagram.com/dudu.barbershop01/" target="_blank" rel="noreferrer">ACOMPANHE NO INSTAGRAM <Arrow diagonal /></a></div>
        </div>
      </section>

      <section className="team section-light" id="equipe"><div className="wrap team-grid"><div className="team-mark" aria-hidden="true"><span>DUDU</span><small>BARBER SHOP / DESDE 2016</small></div><div><p className="section-label"><span>02 /</span> NOSSA EQUIPE</p><h2>Quem faz<br /><em>acontecer.</em></h2><p>Uma equipe que faz parte da história da Dudu Barber Shop e recebe cada cliente em suas unidades.</p><a className="text-link" href="https://www.instagram.com/dudu.barbershop01/" target="_blank" rel="noreferrer">CONHEÇA PELO INSTAGRAM <Arrow diagonal /></a></div></div></section>

      <section className="services section-dark" id="servicos">
        <div className="wrap"><div className="section-head"><div><p className="section-label"><span>03 /</span> O QUE FAZEMOS</p><h2>Seu estilo.<br /><em>Nosso cuidado.</em></h2></div><p>Do corte aos detalhes, conheça alguns dos serviços da barbearia.</p></div>
          <div className="service-list">{services.map(([number, name, description]) => <article className="service-row" key={number}><span className="service-number">{number}</span><h3>{name}</h3><p>{description}</p><Arrow diagonal /></article>)}</div>
          <div className="services-bottom"><p>Para saber mais sobre os serviços e valores, fale com a equipe.</p><a className="text-link light-link" href={whatsapp} target="_blank" rel="noreferrer">CONSULTAR PELO WHATSAPP <Arrow diagonal /></a></div>
        </div>
      </section>

      <section className="plans section-light" id="planos"><div className="wrap"><div className="section-head"><div><p className="section-label"><span>04 /</span> ASSINATURAS</p><h2>Seu cuidado,<br /><em>do seu jeito.</em></h2></div><p>Conheça os planos apresentados pela barbearia e consulte a equipe para confirmar as condições.</p></div>
        <div className="plan-grid">{plans.map((plan, i) => <article className={i === 2 ? 'plan-card featured' : 'plan-card'} key={plan.name}><span className="plan-index">0{i + 1} / PLANO</span><h3>{plan.name}</h3><p className="price"><small>R$</small> {plan.price}<span>,00</span></p><p className="plan-detail">{plan.details}</p><a href={whatsapp} target="_blank" rel="noreferrer" aria-label={`Consultar plano ${plan.name} pelo WhatsApp`}>CONSULTAR PLANO <Arrow diagonal /></a></article>)}</div><p className="plan-note">Valores e condições sujeitos a confirmação com a equipe.</p>
      </div></section>

      <section className="locations section-dark" id="unidades"><div className="wrap locations-grid"><div><p className="section-label"><span>05 /</span> ONDE ESTAMOS</p><h2>Três cidades.<br /><em>Uma história.</em></h2><p className="locations-intro">A Dudu Barber Shop está presente em três cidades do Rio Grande do Norte.</p><a className="button button-outline" href={whatsapp} target="_blank" rel="noreferrer">Fale com a equipe <Arrow diagonal /></a></div><div className="city-list">{cities.map((city, i) => <div className="city-row" key={city}><span>0{i + 1}</span><h3>{city}</h3><span>RN</span></div>)}</div></div></section>
    </main>

    <footer className="footer"><div className="wrap footer-inner"><a href="#inicio" className="brand footer-brand"><span>DUDU</span><small>BARBER SHOP</small></a><p>Uma história de cuidado e dedicação.</p><a href="https://www.instagram.com/dudu.barbershop01/" target="_blank" rel="noreferrer">INSTAGRAM <Arrow diagonal /></a></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} DUDU BARBER SHOP</span><a href="#inicio">VOLTAR AO TOPO ↑</a></div></footer>
    <a className="whatsapp" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Falar com a Dudu Barber Shop pelo WhatsApp"><WhatsAppIcon /></a>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
