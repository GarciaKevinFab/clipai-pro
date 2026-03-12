import { Link } from 'react-router-dom'

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-4 font-[family-name:var(--font-heading)]">
        {title}
      </h4>
      <ul className="flex flex-col gap-2.5">
        {links.map(({ label, to }) => (
          <li key={label}>
            <Link
              to={to}
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-lg bg-white/5 border border-[var(--border)] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
    >
      {children}
    </a>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <FooterColumn
            title="Producto"
            links={[
              { label: 'Crear Video', to: '/create' },
              { label: 'Precios', to: '/pricing' },
              { label: 'Blog', to: '/blog' },
            ]}
          />
          <FooterColumn
            title="Legal"
            links={[
              { label: 'Terminos de Uso', to: '#' },
              { label: 'Politica de Privacidad', to: '#' },
            ]}
          />
          <FooterColumn
            title="Empresa"
            links={[
              { label: 'Sobre Nosotros', to: '#' },
              { label: 'Contacto', to: '#' },
              { label: 'Programa de Afiliados', to: '/affiliates' },
            ]}
          />
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 font-[family-name:var(--font-heading)]">
              Redes Sociales
            </h4>
            <div className="flex gap-2">
              <SocialIcon href="#" label="TikTok">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="YouTube">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.56 31.56 0 0 0 0 12a31.56 31.56 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.84.55 9.38.55 9.38.55s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.56 31.56 0 0 0 24 12a31.56 31.56 0 0 0-.5-5.81zM9.54 15.57V8.43L15.82 12l-6.28 3.57z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.44.41a4.08 4.08 0 0 1 1.52.99c.47.47.78.93.99 1.52.17.47.36 1.27.41 2.44.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.41 2.44a4.08 4.08 0 0 1-.99 1.52 4.08 4.08 0 0 1-1.52.99c-.47.17-1.27.36-2.44.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.44-.41a4.08 4.08 0 0 1-1.52-.99 4.08 4.08 0 0 1-.99-1.52c-.17-.47-.36-1.27-.41-2.44C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.24-1.97.41-2.44a4.08 4.08 0 0 1 .99-1.52 4.08 4.08 0 0 1 1.52-.99c.47-.17 1.27-.36 2.44-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.87 5.87 0 0 0-2.13 1.38A5.87 5.87 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.87 5.87 0 0 0 1.38 2.13 5.87 5.87 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.87 5.87 0 0 0 2.13-1.38 5.87 5.87 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.87 5.87 0 0 0-1.38-2.13A5.87 5.87 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
                </svg>
              </SocialIcon>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>&copy; 2025 ClipAI Pro. Todos los derechos reservados.</p>
          <p>Hecho con amor en Peru</p>
        </div>
      </div>
    </footer>
  )
}
