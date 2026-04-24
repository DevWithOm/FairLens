import React from 'react'

export function FairLensLogo({ size = 'medium', showText = true, layout = 'horizontal' }) {
  const isLarge = size === 'large'
  const iconSize = isLarge ? 80 : 36
  const fontSize = isLarge ? '3.5rem' : '1.375rem'
  const subfontSize = isLarge ? '1rem' : '0.625rem'
  const gap = isLarge ? '20px' : '12px'
  
  const iconStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }

  const textContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: layout === 'horizontal' ? 'flex-start' : 'center',
    textAlign: layout === 'horizontal' ? 'left' : 'center'
  }

  const logoContent = (
    <div style={{ 
      display: 'flex', 
      flexDirection: layout === 'horizontal' ? 'row' : 'column', 
      alignItems: 'center', 
      gap: gap 
    }}>
      <div style={iconStyle}>
        <img 
          src="/logo-icon.png" 
          alt="FairLens Logo" 
          style={{ 
            width: iconSize, 
            height: iconSize, 
            objectFit: 'contain',
            mixBlendMode: 'screen',
            filter: 'grayscale(100%) sepia(100%) hue-rotate(5deg) saturate(120%) brightness(110%) opacity(0.9)'
          }} 
        />
      </div>
      
      {showText && (
        <div style={textContainerStyle}>
          <h1 style={{
            fontSize: fontSize,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: '#e5dfd3',
            margin: 0,
            fontFamily: 'var(--font-heading)'
          }}>
            <span style={{ fontWeight: 800 }}>Fair</span>
            <span style={{ fontWeight: 400 }}>Lens</span>
          </h1>
          <p style={{
            fontSize: subfontSize,
            color: '#c9c5ba',
            fontWeight: 500,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            margin: '4px 0 0 0',
            opacity: 0.9
          }}>Web App</p>
        </div>
      )}
    </div>
  )

  return logoContent
}
