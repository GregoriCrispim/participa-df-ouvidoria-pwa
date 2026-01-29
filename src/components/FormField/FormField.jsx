/**
 * Componente FormField Acessível
 * 
 * Campo de formulário com:
 * - Label associado via htmlFor/id
 * - Mensagens de erro acessíveis
 * - Texto de ajuda
 * - Indicador de campo obrigatório
 * - aria-describedby para contexto adicional
 */

import { useId } from 'react'
import './FormField.css'

function FormField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  maxLength,
  minLength,
  min,
  max,
  pattern,
  autoComplete,
  rows = 4,        // para textarea
  options = [],    // para select
  className = '',
  children,        // para conteúdo customizado
  ...props
}) {
  const generatedId = useId()
  const fieldId = props.id || `field-${name}-${generatedId}`
  const errorId = `${fieldId}-error`
  const helpId = `${fieldId}-help`
  
  const hasError = Boolean(error)
  
  // Monta aria-describedby com IDs disponíveis
  const describedBy = [
    hasError && errorId,
    helpText && helpId
  ].filter(Boolean).join(' ') || undefined

  const commonProps = {
    id: fieldId,
    name,
    value,
    onChange,
    onBlur,
    disabled,
    required,
    'aria-required': required,
    'aria-invalid': hasError,
    'aria-describedby': describedBy,
    className: `form-control ${hasError ? 'form-control--error' : ''}`,
  }

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          placeholder={placeholder}
          maxLength={maxLength}
          minLength={minLength}
          rows={rows}
          {...props}
        />
      )
    }
    
    if (type === 'select') {
      return (
        <select {...commonProps} {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }
    
    return (
      <input
        {...commonProps}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        minLength={minLength}
        min={min}
        max={max}
        pattern={pattern}
        autoComplete={autoComplete}
        {...props}
      />
    )
  }

  return (
    <div className={`form-field ${hasError ? 'field-error' : ''} ${className}`}>
      <label htmlFor={fieldId} className={`form-label ${required ? 'field-required' : ''}`}>
        {label}
      </label>
      
      {children || renderInput()}
      
      {/* Contador de caracteres (para campos com maxLength) */}
      {maxLength && type !== 'select' && (
        <div className="char-counter" aria-live="polite">
          {value?.length || 0}/{maxLength} caracteres
        </div>
      )}
      
      {/* Texto de ajuda */}
      {helpText && (
        <p id={helpId} className="field-help">
          {helpText}
        </p>
      )}
      
      {/* Mensagem de erro */}
      {hasError && (
        <p id={errorId} className="field-error-message" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
