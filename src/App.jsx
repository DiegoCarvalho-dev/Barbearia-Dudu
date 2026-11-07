import React, { useState } from 'react';
import { useHeroMotion } from './hooks/useHeroMotion.js';
import { useRevealOnce } from './hooks/useRevealOnce.js';
import { useStoryScroll } from './hooks/useStoryScroll.js';
import { whatsapp } from './data/site.js';
import { BarberPole, WhatsAppIcon } from './components/Icons.jsx';
import { HeroSection } from './components/HeroSection.jsx';
import { StorySection } from './components/StorySection.jsx';
import { TeamSection } from './components/TeamSection.jsx';
import { ServicesSection } from './components/ServicesSection.jsx';
import { PlansSection } from './components/PlansSection.jsx';
import { LocationsSection } from './components/LocationsSection.jsx';
import { SiteFooter } from './components/SiteFooter.jsx';

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useHeroMotion();
  const storyRef = useRevealOnce();
  const teamRef = useRevealOnce();
  const servicesRef = useRevealOnce();
  const plansRef = useRevealOnce();
  const locationsRef = useRevealOnce();
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
      <HeroSection heroRef={heroRef} scrollToStory={scrollToStory} />

      <StorySection storyRef={storyRef} />

      <TeamSection teamRef={teamRef} />

      <ServicesSection servicesRef={servicesRef} />

      <PlansSection plansRef={plansRef} />

      <LocationsSection locationsRef={locationsRef} />
    </main>

    <SiteFooter />
    <a className="whatsapp" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Falar com a Dudu Barber Shop pelo WhatsApp"><WhatsAppIcon /></a>
  </>;
}
