/**
 * Prism@.TEC landing — clon en Alset JS Runtime
 * Diseño y copy fieles a https://prismatec.onrender.com/w/prismatec.app.ans
 */
import {
  AlsetInspector, Column, Row, Text, mod, alsetState,
  Card, Input, Spacer, Theme, AlsetRegistry, Image
} from '../../src/core/AlsetPulseCore.js';

Theme.set({
  primary: '#F4B400',
  secondary: '#E4572E',
  background: '#121316',
  surface: '#1b1c21',
  radius: 0
});

const GOLD = '#F4B400';
const AMBER = '#FB8C00';
const EMBER = '#E4572E';
const CYAN = '#00ACC1';
const INK = '#F5F3EE';
const MUTED = '#ABA9A3';
const BG = '#121316';
const BG_ALT = '#0d0e10';
const SURFACE = '#1b1c21';
const LINE = 'rgba(244,180,0,0.16)';

const scrolled = alsetState(false);
const menuOpen = alsetState(false);
const formName = alsetState('');
const formEmail = alsetState('');
const formPhone = alsetState('');
const formMsg = alsetState('');
const formStatus = alsetState('idle');

const bpTick = alsetState(0);
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => {
    scrolled.set(window.scrollY > 24);
  }, { passive: true });
  window.addEventListener('resize', () => {
    bpTick.set(bpTick.get() + 1);
    if (window.innerWidth >= 900) menuOpen.set(false);
  }, { passive: true });
}

function openWhatsApp(text = 'Hola, quiero información sobre los servicios de Prism@.TEC') {
  window.open(`https://wa.me/5351069717?text=${encodeURIComponent(text)}`, '_blank');
}

function scrollTo(id) {
  const el = AlsetRegistry.get(id) || document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Eyebrow(label) {
  return Row(mod().gap(10).align('center', 'start').margin('0 0 18px 0'), () => {
    Column(mod().width(22).height(1)
      .addStyle('background', `linear-gradient(90deg, ${GOLD}, ${EMBER})`), () => {});
    Text(label, mod()
      .sizeText(12.5)
      .weight('600')
      .color(GOLD)
      .addStyle('letterSpacing', '0.16em')
      .addStyle('textTransform', 'uppercase'));
  });
}

function FacetDivider() {
  return Column(mod().width('100%').height(1).position('relative')
    .addStyle('background', `linear-gradient(90deg, transparent, ${LINE} 20%, ${LINE} 80%, transparent)`), () => {
    Column(mod()
      .size(10, 10)
      .position('absolute')
      .addStyle('left', '50%')
      .addStyle('top', '-5px')
      .addStyle('transform', 'translateX(-50%)')
      .addStyle('background', `linear-gradient(135deg, ${GOLD}, ${CYAN})`)
      .addStyle('clipPath', 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'), () => {});
  });
}

function PrimaryBtn(label, onClick, extra = mod()) {
  return Column(
    extra
      .padding('14px 28px')
      .addStyle('background', `linear-gradient(100deg, ${GOLD}, ${AMBER})`)
      .color('#181205')
      .clickable(onClick)
      .align('center', 'center')
      .addStyle('clipPath', 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)')
      .addStyle('transition', 'transform .25s ease, box-shadow .25s ease')
      .on('mouseover', (e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 30px rgba(244,180,0,0.25)'; })
      .on('mouseout', (e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }),
    () => Text(label, mod().weight('600').sizeText(15).color('#181205'))
  );
}

function OutlineBtn(label, onClick, extra = mod()) {
  return Column(
    extra
      .padding('14px 28px')
      .background('rgba(244,180,0,0.05)')
      .border(`1px solid ${LINE}`)
      .clickable(onClick)
      .align('center', 'center')
      .addStyle('clipPath', 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)')
      .addStyle('transition', 'transform .25s ease, background .25s ease, border-color .25s ease')
      .on('mouseover', (e) => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = 'rgba(244,180,0,0.09)'; e.currentTarget.style.transform = 'translateY(-3px)'; })
      .on('mouseout', (e) => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.background = 'rgba(244,180,0,0.05)'; e.currentTarget.style.transform = ''; }),
    () => Text(label, mod().weight('600').sizeText(15).color(INK))
  );
}

function NavLink(label, id) {
  return Text(label, mod()
    .sizeText(15)
    .weight('500')
    .color(MUTED)
    .clickable(() => scrollTo(id))
    .addStyle('transition', 'color .2s')
    .on('mouseover', (e) => { e.currentTarget.style.color = GOLD; })
    .on('mouseout', (e) => { e.currentTarget.style.color = MUTED; }));
}

function BrandMark(height = 34) {
  return Image('./assets/brand.png', mod().height(height).width(height * 0.95)
    .addStyle('objectFit', 'contain'));
}

function HeroCrystal() {
  return Image('./assets/hero-crystal.png', mod()
    .width('min(360px, 80%)')
    .height('auto')
    .addStyle('objectFit', 'contain')
    .addStyle('animation', 'floaty 6s ease-in-out infinite')
    .addStyle('filter', 'drop-shadow(0 12px 40px rgba(244,180,0,0.35))')
    .addStyle('position', 'relative')
    .addStyle('zIndex', '2'));
}

function ServiceCard(icon, title, desc) {
  return Column(
    mod()
      .padding(28)
      .background(SURFACE)
      .border(`1px solid ${LINE}`)
      .gap(14)
      .addStyle('transition', 'border-color .25s, transform .25s')
      .on('mouseover', (e) => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.transform = 'translateY(-4px)'; })
      .on('mouseout', (e) => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.transform = ''; }),
    () => {
      Text(icon, mod().sizeText(28).color(GOLD));
      Text(title, mod().sizeText(18).weight('600').color(INK)
        .addStyle('fontFamily', 'Fraunces, serif'));
      Text(desc, mod().sizeText(14.5).color(MUTED).addStyle('lineHeight', '1.55'));
    }
  );
}

function EcoCard(tag, title, desc, linkLabel, href) {
  return Column(
    mod()
      .padding(28)
      .background(SURFACE)
      .border(`1px solid ${LINE}`)
      .gap(12)
      .addStyle('transition', 'border-color .25s, transform .25s')
      .on('mouseover', (e) => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.transform = 'translateY(-4px)'; })
      .on('mouseout', (e) => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.transform = ''; }),
    () => {
      Text(tag, mod().sizeText(11).weight('700').color(CYAN)
        .addStyle('letterSpacing', '0.08em').addStyle('textTransform', 'uppercase'));
      Text(title, mod().sizeText(20).weight('600').color(INK)
        .addStyle('fontFamily', 'Fraunces, serif'));
      Text(desc, mod().sizeText(14.5).color(MUTED).addStyle('lineHeight', '1.55'));
      Text(linkLabel + ' →', mod()
        .sizeText(14).weight('600').color(GOLD).margin('8 0 0 0')
        .clickable(() => window.open(href, '_blank'))
        .on('mouseover', (e) => { e.currentTarget.style.opacity = '0.8'; })
        .on('mouseout', (e) => { e.currentTarget.style.opacity = '1'; }));
    }
  );
}

function TechCard(title, desc) {
  return Column(
    mod().padding(24).background(SURFACE).border(`1px solid ${LINE}`).gap(10),
    () => {
      Text(title, mod().sizeText(16).weight('600').color(GOLD)
        .addStyle('fontFamily', 'Fraunces, serif'));
      Text(desc, mod().sizeText(14).color(MUTED));
    }
  );
}

function CodeBlock(lines) {
  return Column(
    mod()
      .padding(16)
      .background('#0a0b0c')
      .border(`1px solid ${LINE}`)
      .gap(4)
      .addStyle('fontFamily', "'JetBrains Mono', monospace"),
    () => {
      lines.forEach((line) => {
        Text(line, mod().sizeText(12.5).color('#c8c4b8').addStyle('fontFamily', "'JetBrains Mono', monospace"));
      });
    }
  );
}

function ContactItem(icon, title, body) {
  return Row(mod().gap(14).align('start', 'start').margin('0 0 18px 0'), () => {
    Text(icon, mod().sizeText(18));
    Column(mod().gap(2), () => {
      Text(title, mod().sizeText(13).weight('700').color(INK));
      Text(body, mod().sizeText(13.5).color(MUTED).addStyle('lineHeight', '1.45'));
    });
  });
}

AlsetInspector(() => {
  Column(
    mod().width('100%').background(BG).addStyle('minHeight', '100vh')
      .addStyle('overflowY', 'auto').addStyle('overflowX', 'hidden'),
    () => {
      bpTick.get(); // subscribe to resize
      const isMobile = window.innerWidth < 900;
      // ========== HEADER ==========
      const isScrolled = scrolled.get();
      Row(
        mod()
          .key('prismatec-header')
          .position('fixed')
          .top(0).left(0).right(0)
          .zIndex(1000)
          .padding(isScrolled ? '12px 28px' : '18px 28px')
          .align('center', 'space-between')
          .background(isScrolled ? 'rgba(18,19,22,0.92)' : 'transparent')
          .addStyle('backdropFilter', isScrolled ? 'blur(14px)' : 'none')
          .border(isScrolled ? `1px solid ${LINE}` : '1px solid transparent')
          .addStyle('transition', 'background .3s, padding .3s, border-color .3s')
          .addStyle('maxWidth', '100%'),
        () => {
          // Brand
          Row(mod().gap(12).align('center', 'center').clickable(() => scrollTo('home')), () => {
            BrandMark(34);
            Row(mod().gap(0).align('center', 'center'), () => {
              Text('Prism', mod().sizeText(20).weight('600').color(INK)
                .addStyle('fontFamily', 'Fraunces, serif'));
              Text('@', mod().sizeText(20).weight('600').color(AMBER)
                .addStyle('fontFamily', 'Fraunces, serif'));
              Text('.TEC', mod().sizeText(20).weight('600').color(INK)
                .addStyle('fontFamily', 'Fraunces, serif'));
            });
          });

          // Nav links (desktop)
          Row(mod().gap(34).align('center', 'center')
            .addStyle('display', isMobile ? 'none' : 'flex'), () => {
            NavLink('Servicios', 'servicios');
            NavLink('Ecosistema Alset', 'ecosistema');
            NavLink('Investigación', 'investigacion');
            NavLink('Tecnología', 'tecnologia');
            NavLink('Contacto', 'contacto');
          });

          // CTA + hamburger
          Row(mod().gap(14).align('center', 'center'), () => {
            Column(mod().addStyle('display', isMobile ? 'none' : 'flex'), () => {
              PrimaryBtn('Hablemos', () => scrollTo('contacto'), mod().padding('10px 20px'));
            });

            // Hamburger (mobile)
            if (isMobile) {
              Column(
                mod()
                  .gap(5)
                  .padding(6)
                  .clickable(() => menuOpen.set(!menuOpen.get()))
                  .align('center', 'center'),
                () => {
                  [0,1,2].forEach(() => {
                    Column(mod().width(22).height(2).background(INK), () => {});
                  });
                }
              );
            }
          });
        }
      );

      // Mobile menu panel
      if (menuOpen.get() && isMobile) {
        Column(
          mod()
            .key('mobile-menu')
            .position('fixed')
            .top(0).left(0).right(0).bottom(0)
            .zIndex(1100)
            .background('rgba(13,14,16,0.97)')
            .padding('24px 28px')
            .gap(8),
          () => {
            Row(mod().align('center', 'space-between').margin('0 0 32px 0'), () => {
              Row(mod().gap(12).align('center', 'center'), () => {
                BrandMark(28);
                Text('Prism@.TEC', mod().sizeText(18).weight('600').color(INK)
                  .addStyle('fontFamily', 'Fraunces, serif'));
              });
              Text('✕', mod().sizeText(22).color(MUTED).clickable(() => menuOpen.set(false)));
            });

            [
              ['Servicios', 'servicios'],
              ['Ecosistema Alset', 'ecosistema'],
              ['Investigación', 'investigacion'],
              ['Tecnología', 'tecnologia'],
              ['Contacto', 'contacto']
            ].forEach(([label, id]) => {
              Text(label, mod()
                .sizeText(22).weight('600').color(INK).padding('14px 0')
                .addStyle('fontFamily', 'Fraunces, serif')
                .addStyle('borderBottom', `1px solid ${LINE}`)
                .clickable(() => { menuOpen.set(false); scrollTo(id); }));
            });

            Spacer(24);
            PrimaryBtn('Hablemos', () => { menuOpen.set(false); scrollTo('contacto'); },
              mod().width('100%'));
          }
        );
      }

      // ========== HERO ==========
      Column(
        mod()
          .key('home')
          .width('100%')
          .addStyle('minHeight', '100vh')
          .padding('110px 28px 80px')
          .align('center', 'center')
          .addStyle('background',
            `radial-gradient(ellipse 60% 50% at 82% 18%, rgba(0,172,193,0.13), transparent 60%),
             radial-gradient(ellipse 55% 45% at 8% 85%, rgba(228,87,46,0.10), transparent 60%),
             ${BG}`),
        () => {
          Row(mod()
            .width('100%')
            .addStyle('maxWidth', '1240px')
            .gap(48)
            .align('center', 'space-between')
            .wrap('wrap'), () => {

            // Text column
            Column(mod().addStyle('flex', '1.1 1 320px').gap(0).addStyle('maxWidth', '560px'), () => {
              Eyebrow('Tecnología · Finanzas · Consultoría');

              // H1 with accent span simulation
              Column(mod().margin('0 0 26px 0'), () => {
                Text('Construimos la infraestructura sobre la que', mod()
                  .sizeText(window.innerWidth < 700 ? 36 : 52)
                  .weight('600').color(INK)
                  .addStyle('fontFamily', 'Fraunces, serif')
                  .addStyle('lineHeight', '1.1')
                  .addStyle('letterSpacing', '-0.01em'));
                Text('crece tu negocio', mod()
                  .sizeText(window.innerWidth < 700 ? 36 : 52)
                  .weight('600')
                  .addStyle('fontFamily', 'Fraunces, serif')
                  .addStyle('lineHeight', '1.1')
                  .addStyle('letterSpacing', '-0.01em')
                  .addStyle('background', `linear-gradient(120deg, ${GOLD} 10%, ${AMBER} 45%, ${EMBER} 75%)`)
                  .addStyle('webkitBackgroundClip', 'text')
                  .addStyle('backgroundClip', 'text')
                  .addStyle('color', 'transparent')
                  .addStyle('webkitTextFillColor', 'transparent'));
              });

              Text('Prism@.TEC es un trabajo por cuenta propia guantanamero dedicado a tecnología, finanzas y consultoría. Detrás de cada servicio corre Alset, nuestra propia red descentralizada — no alquilamos infraestructura ajena, la construimos nosotros.',
                mod().sizeText(17.5).color(MUTED).margin('0 0 34px 0')
                  .addStyle('lineHeight', '1.6').addStyle('maxWidth', '520px'));

              Row(mod().gap(16).wrap('wrap').margin('0 0 42px 0'), () => {
                PrimaryBtn('Escríbenos por WhatsApp', () => openWhatsApp());
                OutlineBtn('Ver ecosistema Alset', () => scrollTo('ecosistema'));
              });

              // Meta
              Row(mod().gap(36).wrap('wrap').padding('28px 0 0 0')
                .border(`1px solid transparent`)
                .addStyle('borderTop', `1px solid ${LINE}`), () => {
                [
                  ['3', 'Apps en producción'],
                  ['P2P', 'Red propia, sin depender de terceros'],
                  ['GTMO', 'Con sede en Guantánamo, Cuba']
                ].forEach(([k, v]) => {
                  Column(mod().gap(2), () => {
                    Text(k, mod().sizeText(17).weight('600').color(GOLD)
                      .addStyle('fontFamily', 'Fraunces, serif'));
                    Text(v, mod().sizeText(12.5).color(MUTED));
                  });
                });
              });
            });

            // Visual
            Column(mod()
              .addStyle('flex', '0.9 1 280px')
              .align('center', 'center')
              .position('relative')
              .addStyle('minHeight', '360px'), () => {
              Column(mod()
                .size(420, 420)
                .position('absolute')
                .addStyle('background', `radial-gradient(circle, rgba(244,180,0,0.20), rgba(0,172,193,0.08) 55%, transparent 72%)`)
                .addStyle('filter', 'blur(10px)')
                .addStyle('animation', 'pulse 5s ease-in-out infinite'), () => {});
              Column(mod().size(300, 320).align('center', 'center')
                .addStyle('position', 'relative').addStyle('zIndex', '2'), () => {
                HeroCrystal();
              });
            });
          });
        }
      );

      FacetDivider();

      // ========== SERVICIOS ==========
      Column(mod().key('servicios').width('100%').padding('108px 28px').align('center', 'center'), () => {
        Column(mod().width('100%').addStyle('maxWidth', '1240px'), () => {
          Column(mod().addStyle('maxWidth', '640px').margin('0 0 56px 0'), () => {
            Eyebrow('Lo que hacemos');
            Text('Un mismo equipo, seis frentes de trabajo', mod()
              .sizeText(window.innerWidth < 700 ? 28 : 40).weight('600').color(INK)
              .addStyle('fontFamily', 'Fraunces, serif').margin('0 0 16px 0'));
            Text('No somos una agencia de un solo servicio. Cubrimos desde la instalación de tu red hasta la revisión de tu tesis, con el mismo nivel de rigor.',
              mod().sizeText(16.5).color(MUTED));
          });

          Row(mod().gap(20).wrap('wrap')
            .addStyle('display', 'grid')
            .addStyle('gridTemplateColumns', 'repeat(auto-fill, minmax(300px, 1fr))'), () => {
            ServiceCard('⌁', 'Cableado estructurado & redes',
              'Instalación, mantenimiento y certificación de redes de datos y telefonía. Infraestructura pensada para crecer contigo.');
            ServiceCard('⧉', 'Desarrollo de software',
              'Aplicaciones a medida, automatización de procesos y sistemas propios — como los que construimos sobre la red Alset.');
            ServiceCard('▤', 'Teneduría de libros',
              'Gestión contable integral, balances e impuestos para PYMES y TCPs. Números claros para decisiones claras.');
            ServiceCard('◈', 'Estudios de factibilidad',
              'Evaluación económico-financiera de proyectos de inversión: rentabilidad, riesgo y punto de equilibrio.');
            ServiceCard('✎', 'Corrección & edición',
              'Revisión de estilo y ortotipografía para tesis, trabajos de curso y documentos profesionales.');
            ServiceCard('◬', 'Consultoría académica',
              'Asesoría en metodología de la investigación para tesis de grado y posgrado.');
          });
        });
      });

      FacetDivider();

      // ========== ECOSISTEMA ==========
      Column(mod().key('ecosistema').width('100%').padding('108px 28px')
        .background(BG_ALT).align('center', 'center'), () => {
        Column(mod().width('100%').addStyle('maxWidth', '1240px'), () => {
          Column(mod().addStyle('maxWidth', '640px').margin('0 0 56px 0'), () => {
            Eyebrow('Nuestra infraestructura propia');
            Text('El ecosistema construido sobre Alset', mod()
              .sizeText(window.innerWidth < 700 ? 28 : 40).weight('600').color(INK)
              .addStyle('fontFamily', 'Fraunces, serif').margin('0 0 16px 0'));
            Text('Alset es la red peer-to-peer que desarrollamos como base técnica de Prism@.TEC. Cada aplicación de abajo corre sobre ese mismo motor — identidad, almacenamiento por CID y agentes compartidos.',
              mod().sizeText(16.5).color(MUTED));
          });

          Row(mod().gap(20).wrap('wrap')
            .addStyle('display', 'grid')
            .addStyle('gridTemplateColumns', 'repeat(auto-fill, minmax(300px, 1fr))'), () => {
            EcoCard('Ventas', 'Alset Sales Hub',
              'Plataforma que conecta negocios, gestores y clientes: catálogo, chat unificado, WhatsApp directo y comprobante de venta por QR. Pagos en CUP, USD, MLC y Zelle.',
              'Ver plataforma', 'https://prismatec.onrender.com/w/sales.app.ans');
            EcoCard('Identidad comercial', 'Vero',
              'Identidad comercial portable para cualquier negocio: un link, un QR, catálogo y reputación. El cliente te encuentra y cierra la venta en el chat de siempre.',
              'Ver plataforma', 'https://vero-1ca3.onrender.com/');
            EcoCard('Vertical científico', 'AlsetBio · LabFlow',
              'Gestión del ciclo de vida de muestras de laboratorio: cadena de custodia, verificación pública por CID y workflows configurables por tipo de análisis.',
              'Ver repositorio', 'https://github.com/yecharlot/AlsetBio');
          });

          Text('¿Necesitas algo parecido para tu negocio o institución? Podemos construir un nuevo vertical sobre Alset, igual que hicimos con estos tres.',
            mod().sizeText(15).color(MUTED).margin('36 0 0 0').addStyle('textAlign', 'center'));
        });
      });

      FacetDivider();

      // ========== INVESTIGACIÓN ==========
      Column(mod().key('investigacion').width('100%').padding('108px 28px').align('center', 'center'), () => {
        Column(mod().width('100%').addStyle('maxWidth', '1240px'), () => {
          Column(mod().addStyle('maxWidth', '640px').margin('0 0 48px 0'), () => {
            Eyebrow('Investigación & desarrollo');
            Text('Lo que estamos probando en el laboratorio Alset', mod()
              .sizeText(window.innerWidth < 700 ? 28 : 40).weight('600').color(INK)
              .addStyle('fontFamily', 'Fraunces, serif').margin('0 0 16px 0'));
            Text('Además de los productos que ya están en uso, dentro de Prism@.TEC investigamos las piezas de más largo plazo: el intérprete y la lógica que le dan a la red su capacidad de razonar, no solo de transportar datos.',
              mod().sizeText(16.5).color(MUTED));
          });

          Row(mod().gap(24).wrap('wrap')
            .addStyle('display', 'grid')
            .addStyle('gridTemplateColumns', 'repeat(auto-fill, minmax(340px, 1fr))'), () => {

            Column(mod().padding(28).background(SURFACE).border(`1px solid ${LINE}`).gap(12), () => {
              Text('En desarrollo activo', mod().sizeText(11).weight('700').color(CYAN)
                .addStyle('letterSpacing', '0.08em').addStyle('textTransform', 'uppercase'));
              Text('LispAI', mod().sizeText(22).weight('600').color(INK)
                .addStyle('fontFamily', 'Fraunces, serif'));
              Text('Intérprete Lisp embebido directamente en cada nodo Alset, expuesto por HTTP. Permite definir agentes, lógica y modelos ligeros dentro de la propia red — sin recompilar el nodo cada vez que cambia una regla.',
                mod().sizeText(14.5).color(MUTED));
              CodeBlock(['POST /api/lispai', '{"cmd":"(zyrion (list 1 1 0))"}']);
            });

            Column(mod().padding(28).background(SURFACE).border(`1px solid ${LINE}`).gap(12), () => {
              Text('Investigación exploratoria', mod().sizeText(11).weight('700').color(AMBER)
                .addStyle('letterSpacing', '0.08em').addStyle('textTransform', 'uppercase'));
              Text('Zyrion', mod().sizeText(22).weight('600').color(INK)
                .addStyle('fontFamily', 'Fraunces, serif'));
              Text('Unidad lógica ternaria (0 / 1 / 2) que estamos desarrollando como alternativa a la lógica binaria clásica, pensada para modelos ligeros y embeddings dentro de la red. Base experimental para una IA distribuida más económica en recursos.',
                mod().sizeText(14.5).color(MUTED));
              CodeBlock(['estado ::= 0 | 1 | 2', 'zyrion(lista) → capa ternaria']);
            });
          });

          Text('Próximas líneas — El laboratorio Alset sigue abierto: cada nuevo hallazgo que llegue a un estado presentable se suma aquí.',
            mod().sizeText(14).color(MUTED).margin('32 0 0 0'));
        });
      });

      FacetDivider();

      // ========== TECNOLOGÍA ==========
      Column(mod().key('tecnologia').width('100%').padding('108px 28px')
        .background(BG_ALT).align('center', 'center'), () => {
        Column(mod().width('100%').addStyle('maxWidth', '1240px'), () => {
          Column(mod().addStyle('maxWidth', '640px').margin('0 0 48px 0'), () => {
            Eyebrow('Bajo el capó');
            Text('Estándares abiertos, no cajas negras', mod()
              .sizeText(window.innerWidth < 700 ? 28 : 40).weight('600').color(INK)
              .addStyle('fontFamily', 'Fraunces, serif').margin('0 0 16px 0'));
            Text('La red Alset no depende de un solo proveedor. Está construida sobre tecnología abierta y verificable.',
              mod().sizeText(16.5).color(MUTED));
          });

          Row(mod().gap(16).wrap('wrap')
            .addStyle('display', 'grid')
            .addStyle('gridTemplateColumns', 'repeat(auto-fill, minmax(240px, 1fr))'), () => {
            TechCard('IPFS & CID', 'Almacenamiento distribuido e inmutable, direccionado por contenido.');
            TechCard('libp2p', 'Red P2P descentralizada: sin servidor único que pueda caerse.');
            TechCard('Ed25519', 'Firmas y verificación de identidad con criptografía moderna.');
            TechCard('Motor Alset', 'Agentes, módulos y API propia sobre los que corren todas nuestras apps.');
          });
        });
      });

      FacetDivider();

      // ========== CONTACTO ==========
      Column(mod().key('contacto').width('100%').padding('108px 28px').align('center', 'center'), () => {
        Column(mod().width('100%').addStyle('maxWidth', '1240px'), () => {
          Column(mod().addStyle('maxWidth', '640px').margin('0 0 48px 0'), () => {
            Eyebrow('Conversemos');
            Text('Empecemos con tu proyecto', mod()
              .sizeText(window.innerWidth < 700 ? 28 : 40).weight('600').color(INK)
              .addStyle('fontFamily', 'Fraunces, serif').margin('0 0 16px 0'));
            Text('Cuéntanos qué necesitas — tecnología, finanzas o consultoría — y te respondemos en menos de 24 horas.',
              mod().sizeText(16.5).color(MUTED));
          });

          Row(mod().gap(40).wrap('wrap').align('start', 'start'), () => {
            // Info
            Column(mod().addStyle('flex', '1 1 280px').gap(4), () => {
              ContactItem('📍', 'Oficina', 'Calle 10 Este e/ Paseo y 1 Norte, Rpto. San Justo #603 A, Guantánamo, Cuba');
              ContactItem('🕐', 'Horario', 'Lunes a viernes: 8:00 am – 5:00 pm · Sábados: 9:00 am – 1:00 pm');
              ContactItem('✉', 'Email', 'contacto@prismatec.cu');
              ContactItem('💬', 'WhatsApp', '+53 5 106 9717');
            });

            // Form
            Column(mod().addStyle('flex', '1 1 320px').padding(28).background(SURFACE)
              .border(`1px solid ${LINE}`).gap(14), () => {
              Text('Solicita información', mod().sizeText(18).weight('600').color(INK)
                .addStyle('fontFamily', 'Fraunces, serif'));
              Text('Te contactamos por WhatsApp o correo, lo que prefieras.',
                mod().sizeText(13.5).color(MUTED).margin('0 0 8 0'));

              Input(formName, mod().key('contact-name').padding(13).background(BG)
                .border(`1px solid ${LINE}`).color(INK).width('100%'),
                { placeholder: 'Nombre' });
              Input(formEmail, mod().key('contact-email').padding(13).background(BG)
                .border(`1px solid ${LINE}`).color(INK).width('100%'),
                { placeholder: 'Correo electrónico', type: 'email' });
              Input(formPhone, mod().key('contact-phone').padding(13).background(BG)
                .border(`1px solid ${LINE}`).color(INK).width('100%'),
                { placeholder: 'Teléfono / WhatsApp' });
              Input(formMsg, mod().key('contact-msg').padding(13).background(BG)
                .border(`1px solid ${LINE}`).color(INK).width('100%')
                .height(100).addStyle('resize', 'vertical'),
                { placeholder: 'Cuéntanos tu proyecto' });

              PrimaryBtn(
                formStatus.get() === 'sent' ? 'Mensaje preparado' : 'Enviar mensaje',
                () => {
                  const text = `Hola, soy ${formName.get() || '(sin nombre)'}. Email: ${formEmail.get()}. Tel: ${formPhone.get()}. Proyecto: ${formMsg.get()}`;
                  openWhatsApp(text);
                  formStatus.set('sent');
                },
                mod().width('100%').padding('14px 20px')
              );
            });
          });
        });
      });

      // ========== FOOTER ==========
      Column(mod().width('100%').padding('56px 28px 34px').background(BG_ALT)
        .border(`1px solid transparent`).addStyle('borderTop', `1px solid ${LINE}`)
        .align('center', 'center'), () => {
        Column(mod().width('100%').addStyle('maxWidth', '1240px'), () => {
          Row(mod().gap(40).wrap('wrap').margin('0 0 36px 0').align('start', 'space-between'), () => {
            Column(mod().addStyle('flex', '1.4 1 240px').gap(12), () => {
              Row(mod().gap(10).align('center', 'center'), () => {
                BrandMark(28);
                Row(mod().gap(0), () => {
                  Text('Prism', mod().sizeText(18).weight('600').color(INK).addStyle('fontFamily', 'Fraunces, serif'));
                  Text('@', mod().sizeText(18).weight('600').color(AMBER).addStyle('fontFamily', 'Fraunces, serif'));
                  Text('.TEC', mod().sizeText(18).weight('600').color(INK).addStyle('fontFamily', 'Fraunces, serif'));
                });
              });
              Text('Tecnología, finanzas y consultoría desde Guantánamo, Cuba. Creadores de la red Alset.',
                mod().sizeText(14).color(MUTED).addStyle('maxWidth', '320px'));
            });

            Column(mod().gap(10).addStyle('flex', '1 1 140px'), () => {
              Text('Navegación', mod().sizeText(12).weight('600').color(MUTED)
                .addStyle('letterSpacing', '0.06em').addStyle('textTransform', 'uppercase').margin('0 0 6 0'));
              ['Servicios', 'Ecosistema Alset', 'Tecnología', 'Contacto'].forEach((l, i) => {
                const ids = ['servicios', 'ecosistema', 'tecnologia', 'contacto'];
                Text(l, mod().sizeText(14).color(MUTED).clickable(() => scrollTo(ids[i]))
                  .on('mouseover', (e) => e.currentTarget.style.color = GOLD)
                  .on('mouseout', (e) => e.currentTarget.style.color = MUTED));
              });
            });

            Column(mod().gap(10).addStyle('flex', '1 1 140px'), () => {
              Text('Ecosistema', mod().sizeText(12).weight('600').color(MUTED)
                .addStyle('letterSpacing', '0.06em').addStyle('textTransform', 'uppercase').margin('0 0 6 0'));
              [
                ['Alset Sales Hub', 'https://prismatec.onrender.com/w/sales.app.ans'],
                ['Vero', 'https://vero-1ca3.onrender.com/'],
                ['AlsetBio', 'https://github.com/yecharlot/AlsetBio'],
                ['Repositorio Alset', 'https://github.com/yecharlot/PrismaTec']
              ].forEach(([l, href]) => {
                Text(l, mod().sizeText(14).color(MUTED).clickable(() => window.open(href, '_blank'))
                  .on('mouseover', (e) => e.currentTarget.style.color = GOLD)
                  .on('mouseout', (e) => e.currentTarget.style.color = MUTED));
              });
            });
          });

          Row(mod().padding('28px 0 0 0').addStyle('borderTop', `1px solid ${LINE}`)
            .align('center', 'space-between').wrap('wrap').gap(12), () => {
            Text('© 2026 Prism@.TEC — Trabajo por Cuenta Propia registrado en Guantánamo, Cuba',
              mod().sizeText(12.5).color('#7a7975'));
            Text('Tecnología · Finanzas · Consultoría', mod().sizeText(12.5).color('#7a7975'));
          });
        });
      });

      // ========== WhatsApp float ==========
      Column(
        mod()
          .key('wa-float')
          .position('fixed')
          .bottom(26).right(26)
          .size(58, 58)
          .background('#25D366')
          .zIndex(900)
          .align('center', 'center')
          .clickable(() => openWhatsApp())
          .addStyle('clipPath', 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)')
          .addStyle('boxShadow', '0 8px 22px rgba(37,211,102,0.35)')
          .addStyle('transition', 'transform .25s ease')
          .on('mouseover', (e) => { e.currentTarget.style.transform = 'scale(1.08)'; })
          .on('mouseout', (e) => { e.currentTarget.style.transform = ''; }),
        () => Text('💬', mod().sizeText(22))
      );
    }
  );
});
