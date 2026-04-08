(function() {
  'use strict';

  const CALENDLY_URL = 'https://calendly.com/aclinicaigrowth/nueva-reunion';

  const checkSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary shrink-0" style="color: hsl(210 100% 50%); flex-shrink:0; min-width:18px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';

  const starSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';

  const crownSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-5 4-5-4-5 4-3-4Z"/><path d="M5 16h14"/><path d="M5 20h14"/></svg>';

  const rocketSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>';

  function buildFeatureItem(text) {
    return `<li style="display:flex; align-items:flex-start; gap:10px; font-size:0.9rem; line-height:1.5; color:hsl(210 40% 85%);">
      ${checkSvg}
      <span>${text}</span>
    </li>`;
  }

  function buildServiceCard(config) {
    const {
      badgeIcon, badgeText, badgeColor, borderColor,
      title, subtitle, features, price, paymentNote, 
      btnBg, btnHoverBg, btnTextColor, glowClass, isPopular
    } = config;

    const popularBadge = isPopular ? `<div style="position:absolute; top:0; right:24px; background: linear-gradient(135deg, #0080ff, #00c8ff); color:#fff; font-size:0.7rem; font-weight:700; padding:4px 12px; border-radius:0 0 8px 8px; letter-spacing:0.05em; text-transform:uppercase;">Más Popular</div>` : '';

    return `
    <div style="position:relative; border-radius:16px; border:1px solid ${borderColor}; background: linear-gradient(135deg, rgba(20,27,41,0.9), rgba(13,18,28,0.95)); backdrop-filter:blur(10px); padding:32px; display:flex; flex-direction:column; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow:hidden;" 
         onmouseenter="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 0 40px ${borderColor}33, 0 0 80px ${borderColor}1a';"
         onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
      ${popularBadge}
      
      <!-- Badge -->
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px; color:${badgeColor}; font-weight:700; font-size:0.75rem; letter-spacing:0.1em; text-transform:uppercase;">
        ${badgeIcon}
        ${badgeText}
      </div>

      <!-- Title -->
      <h3 style="font-size:1.4rem; font-weight:800; margin-bottom:8px; color:hsl(210 40% 96%);">${title}</h3>
      
      <!-- Subtitle / Promise -->
      <p style="font-size:0.875rem; color:hsl(215 20% 60%); margin-bottom:24px; line-height:1.6;">${subtitle}</p>

      <!-- Features -->
      <ul style="list-style:none; padding:0; margin:0 0 24px 0; display:flex; flex-direction:column; gap:12px; flex-grow:1;">
        ${features.map(f => buildFeatureItem(f)).join('')}
      </ul>

      <!-- Price -->
      <div style="font-size:1.8rem; font-weight:900; margin-bottom:4px; color:hsl(210 40% 96%);">${price}</div>
      <div style="font-size:0.8rem; color:hsl(215 20% 55%); margin-bottom:24px;">${paymentNote}</div>

      <!-- CTA Button -->
      <a href="${CALENDLY_URL}" target="_blank" rel="noopener noreferrer" 
         style="display:block; width:100%; text-align:center; background:${btnBg}; color:${btnTextColor}; font-weight:700; font-size:0.95rem; padding:14px 24px; border-radius:10px; text-decoration:none; transition: all 0.3s ease; border:none; cursor:pointer;"
         onmouseenter="this.style.background='${btnHoverBg}'; this.style.transform='scale(1.02)';"
         onmouseleave="this.style.background='${btnBg}'; this.style.transform='scale(1)';">
        Agendar Llamada
      </a>
    </div>`;
  }

  function replaceServicesSection() {
    // Find the services heading
    const allH2 = document.querySelectorAll('h2');
    let servicesSection = null;

    for (const h2 of allH2) {
      if (h2.textContent && h2.textContent.toLowerCase().includes('servicio')) {
        // Walk up to find the section container
        servicesSection = h2.closest('section') || h2.parentElement?.parentElement;
        break;
      }
    }

    if (!servicesSection) return false;

    // Build the 3 cards
    const starterCard = buildServiceCard({
      badgeIcon: starSvg,
      badgeText: 'PACK STARTER',
      badgeColor: '#38bdf8',
      borderColor: 'rgba(56,189,248,0.2)',
      title: 'STARTER: Presencia Inteligente',
      subtitle: 'Automatiza tu primera línea de atención médica 24/7. Ideal para clínicas locales o pequeñas PYMES médicas.',
      features: [
        'Landing Page Esencial: Diseño neuro-persuasivo de carga ultra-rápida, optimizado para un (1) tratamiento principal.',
        'Agente IA Chat Básico: Instalación en tu sitio web para responder preguntas frecuentes y capturar datos de contacto (Leads).',
        'Sistema de Notificación Instantánea: Aviso inmediato a tu equipo de recepción por email o panel cuando entra un nuevo lead.',
        'Configuración Inicial "Plug & Play": Puesta en marcha completa en menos de 7 días.'
      ],
      price: '700€',
      paymentNote: '50% inicio + 50% activación',
      btnBg: 'hsl(210 100% 50%)',
      btnHoverBg: 'hsl(210 100% 40%)',
      btnTextColor: '#fff',
      isPopular: false
    });

    const proCard = buildServiceCard({
      badgeIcon: rocketSvg,
      badgeText: 'PACK PRO — PRODUCTO ESTRELLA',
      badgeColor: '#38bdf8',
      borderColor: 'rgba(0,128,255,0.4)',
      title: 'PRO: El Sistema de Citas Predecibles',
      subtitle: 'Duplicamos tus citas confirmadas en 30 días sin contratar más personal. Para clínicas en crecimiento que necesitan escalar.',
      features: [
        '<strong>Todo lo del Starter PLUS:</strong>',
        'Landing Page Neuro-Persuasiva Premium: Diseño avanzado y optimizado para la máxima conversión en dispositivos móviles.',
        'Agente IA Chat Avanzado (WhatsApp + Web): Integración multicanal completa. No solo captura datos, gestiona la conversación.',
        'Sistema Inteligente de Reservas + CRM Automatizado: Sincronización en tiempo real con tu agenda y gestión automatizada de pacientes.',
        'Recordatorios Automáticos Anti-No-Show: Flujo de confirmación + reconfirmación vía WhatsApp/SMS para asegurar la asistencia.',
        'Reactivación Automática de Pacientes Antiguos: Campañas automatizadas para llenar huecos en la agenda.',
        'Soporte y Optimización Continua: Ajustes mensuales para maximizar la tasa de conversión.'
      ],
      price: '1.200€',
      paymentNote: '50% inicio + 50% activación',
      btnBg: 'hsl(210 100% 50%)',
      btnHoverBg: 'hsl(210 100% 40%)',
      btnTextColor: '#fff',
      isPopular: true
    });

    const eliteCard = buildServiceCard({
      badgeIcon: crownSvg,
      badgeText: 'PACK ELITE — PRODUCTO PREMIUM',
      badgeColor: '#f4c025',
      borderColor: 'rgba(244,192,37,0.3)',
      title: 'ELITE: La Clínica de Siete Cifras',
      subtitle: 'Convertimos tu clínica en una máquina de captación, cierre y reactivación totalmente autónoma. Transformación Total Llave en Mano.',
      features: [
        '<strong>Todo lo del PRO PLUS:</strong>',
        'Infraestructura Digital de Alta Conversión: Landing pages neuro-persuasivas premium con optimización avanzada CRO y Test A/B continuo.',
        'IA Completa (Voz + Chat): Incluye Agente IA de Voz 24/7 para cierre de citas por teléfono, entrenado con objeciones reales y scripts personalizados.',
        'Sistema Comercial Avanzado: CRM inteligente con segmentación por valor de paciente, reactivación avanzada segmentada por tratamiento.',
        'Estrategia & Optimización Élite: Auditoría estratégica inicial, rediseño del posicionamiento digital, formación al equipo médico en cierres, reuniones estratégicas mensuales (6 meses).',
        'Exclusividad Total: Implementación 100% personalizada con acceso directo al estratega principal. Cupos limitados por mes.'
      ],
      price: '2.500€',
      paymentNote: '50% inicio + 50% activación · Sin permanencia',
      btnBg: 'linear-gradient(135deg, #f4c025, #f0d175)',
      btnHoverBg: 'linear-gradient(135deg, #d4a010, #e0c060)',
      btnTextColor: '#0a0d15',
      isPopular: false
    });

    // Build the new section inner HTML
    const newContent = `
    <div style="width:100%; margin-left:auto; margin-right:auto; padding-left:2rem; padding-right:2rem; position:relative; z-index:10; max-width:1400px;">
      <!-- Section Heading -->
      <div style="text-align:center; margin-bottom:56px;">
        <h2 style="font-size:2.25rem; font-weight:900; margin-bottom:16px; color:hsl(210 40% 96%); font-family:'DM Sans',sans-serif;">
          Nuestros <span style="background:linear-gradient(135deg,#39f,#9cf); -webkit-background-clip:text; background-clip:text; color:transparent; font-style:italic;">servicios</span>
        </h2>
      </div>

      <!-- 3-Column Grid -->
      <div style="display:grid; grid-template-columns: repeat(1, 1fr); gap:24px; max-width:1200px; margin:0 auto;" id="services-grid">
        ${starterCard}
        ${proCard}
        ${eliteCard}
      </div>
    </div>`;

    // Replace the section content
    servicesSection.innerHTML = newContent;
    servicesSection.style.paddingTop = '6rem';
    servicesSection.style.paddingBottom = '6rem';
    servicesSection.style.position = 'relative';
    servicesSection.style.overflow = 'hidden';

    // Make grid responsive
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @media (min-width: 768px) {
        #services-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
      }
      @media (min-width: 640px) and (max-width: 767px) {
        #services-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
      }
    `;
    document.head.appendChild(styleTag);

    return true;
  }

  // Use MutationObserver to wait for React to render
  let attempts = 0;
  const maxAttempts = 50;

  function tryReplace() {
    if (replaceServicesSection()) {
      console.log('[services-override] Services section replaced successfully.');
      return;
    }
    attempts++;
    if (attempts < maxAttempts) {
      setTimeout(tryReplace, 200);
    } else {
      console.warn('[services-override] Could not find services section after max attempts.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(tryReplace, 500));
  } else {
    setTimeout(tryReplace, 500);
  }
})();
