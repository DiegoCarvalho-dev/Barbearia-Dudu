import React from 'react';
import { Arrow } from './Icons.jsx';

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-content">
        <div className="footer-main">
          <div className="footer-about">
            <div className="footer-logo" aria-label="Dudu Barber Shop"><span>DUDU</span><small>BARBER SHOP</small></div>
            <p>Uma história de cuidado e dedicação.</p>
          </div>
          <nav className="footer-nav" aria-label="Navegação do rodapé">
            <span>Explore</span>
            <div className="footer-nav-links"><a href="#historia">História</a><a href="#equipe">Equipe</a><a href="#servicos">Serviços</a><a href="#planos">Planos</a><a href="#unidades">Unidades</a></div>
          </nav>
          <div className="footer-social"><span>Acompanhe</span><a href="https://www.instagram.com/dudu.barbershop01/" target="_blank" rel="noreferrer">Instagram <Arrow diagonal /></a></div>
        </div>
        <div className="footer-meta"><span>© {new Date().getFullYear()} Dudu Barber Shop</span><a href="#inicio">Voltar ao topo <span aria-hidden="true">↑</span></a></div>
      </div>
    </footer>
  );
}
