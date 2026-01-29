/**
 * Componente Button Acessível
 * 
 * Botão reutilizável com:
 * - Suporte a variantes visuais
 * - Estados de loading
 * - Área de toque mínima de 44px
 * - Feedback visual de foco
 */

import './Button.css'

function Button({
  children,
  variant = 'primary', // primary, secondary, outline, text
  size = 'medium',     // small, medium, large
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  className = '',
  ariaLabel,
  ...props
}) {
  const buttonClasses = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full-width',
    loading && 'btn--loading',
    icon && !children && 'btn--icon-only',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="btn-spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="spinner-icon">
            <circle cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
          </svg>
        </span>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="btn-icon" aria-hidden="true">{icon}</span>
      )}
      
      {children && (
        <span className="btn-text">{children}</span>
      )}
      
      {icon && iconPosition === 'right' && !loading && (
        <span className="btn-icon" aria-hidden="true">{icon}</span>
      )}
      
      {loading && (
        <span className="visually-hidden">Carregando...</span>
      )}
    </button>
  )
}

export default Button
