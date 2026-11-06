import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useHeroMotion } from './hooks/useHeroMotion.js';
import { useRevealOnce } from './hooks/useRevealOnce.js';
import { useStoryScroll } from './hooks/useStoryScroll.js';
import './style.css';
import './home.css';
import './story.css';

// Fotografia principal; substitua o arquivo em /public/images quando necessário.
const heroImage = '/images/dudu-recorte.webp';
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

function BarberPole() {
  return <svg className="brand-pole" viewBox="0 0 28 50" fill="none" aria-hidden="true"><path d="M9 7V5a5 5 0 0 1 10 0v2M9 43v2a5 5 0 0 0 10 0v-2M6 9h16M6 41h16M9 9h10a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5"/><path d="m8 21 12-10v7L8 28v-7Zm0 12 12-10v7L8 40v-7Z" fill="#b92732"/><path d="M8 21 20 11M8 28l12-10M8 33l12-10M8 40l12-10" stroke="currentColor" strokeWidth=".8"/></svg>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useHeroMotion();
  const storyRef = useRevealOnce();
  const scrollToStory = useStoryScroll();
  const closeMenu = () => setMenuOpen(false);

  return <>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className="header">
      <div className="brand">
        <BarberPole /><span className="brand-text"><span>DUDU</span><small>BARBER SHOP</small></span>
      </div>
      <button className="menu-toggle" aria-expanded={menuOpen} aria-controls="navigation" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenuOpen(!menuOpen)}>
        <span></span><span></span>
      </button>
      <nav id="navigation" className={menuOpen ? 'navigation is-open' : 'navigation'} aria-label="Navegação principal">
        <a href="#historia" onClick={closeMenu}>História</a>
        <a href="#equipe" onClick={closeMenu}>Equipe</a>
        <a href="#servicos" onClick={closeMenu}>Serviços</a>
        <a href="#planos" onClick={closeMenu}>Planos</a>
        <a href="#unidades" onClick={closeMenu}>Unidades</a>
      </nav>
    </header>

    <main id="conteudo">
      <section id="inicio" className="hero" aria-labelledby="hero-title" ref={heroRef}>
        <div className="hero-word" aria-hidden="true"><span>DUDU</span></div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-photo-layer">{heroImage ? <img className="hero-photo" src={heroImage} alt="" fetchPriority="high" /> : <div className="hero-placeholder"><span className="placeholder-ring"></span><span className="placeholder-letter">D</span><span className="placeholder-caption">DUDU / BARBER SHOP</span></div>}</div>
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

      <section className="story section-light" id="historia" tabIndex="-1" ref={storyRef} aria-labelledby="story-title">
        <div className="wrap story-grid">
          <div className="story-heading"><p className="section-label">NOSSA HISTÓRIA</p><h2 id="story-title">Uma história que começou com um <em className="story-highlight">sonho.</em></h2></div>
          <figure className="story-visual">
            <img src="/images/dudu-historia.webp" alt="Dudu aparando a barba de um cliente na barbearia" width="1170" height="1180" loading="lazy" decoding="async" />
          </figure>
          <div className="story-copy"><p>Em <strong className="story-highlight">2016</strong>, um casal de jovens empreendedores decidiu transformar o sonho de ter o próprio negócio em realidade.</p><p>Com o tempo, a formação de novos barbeiros passou a fazer parte da <span className="story-trajectory">nossa trajetória.</span></p><a className="story-link" href="#equipe">Conheça a equipe <Arrow diagonal /></a></div>
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
