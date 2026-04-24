import { Sparkles, Shield, BarChart3, Wrench, Search, Zap, Code, ShieldCheck, Aperture } from 'lucide-react'
import { useData } from '../../lib/DataContext'
import { FairLensLogo } from '../common/FairLensLogo'

export default function LandingTab({ onAuth }) {
  const { t } = useData()

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      
      {/* ── High-Impact Hero Section ── */}
      <div className="fade-in-up" style={{ minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Cinematic Background Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0" 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.6 }}
        >
          <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
        </video>

        {/* Dark Gradient Overlay for readability and cinematic vibe */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,1) 100%)', zIndex: 1 }} />

        {/* Holographic Background effects */}
        <div style={{
          position: 'absolute',
          top: '10%', left: '0%',
          width: '500px', height: '500px',
          background: 'var(--gradient-primary)',
          filter: 'blur(120px)', opacity: 0.15,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 1
        }} />
        <div className="float-anim delay-1" style={{
          position: 'absolute',
          bottom: '10%', right: '0%',
          width: '400px', height: '400px',
          background: 'var(--accent-blue)',
          filter: 'blur(100px)', opacity: 0.15,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', zIndex: 2, position: 'relative', padding: '0 20px' }}>
          <div className="bias-heartbeat" style={{ justifyContent: 'center', marginBottom: '32px', height: '48px' }}>
             <div className="bar" style={{ width: '4px', height: '100%' }} />
             <div className="bar" style={{ width: '4px', height: '100%' }} />
             <div className="bar" style={{ width: '4px', height: '100%' }} />
             <div className="bar" style={{ width: '4px', height: '100%' }} />
             <div className="bar" style={{ width: '4px', height: '100%' }} />
             <div className="bar" style={{ width: '4px', height: '100%' }} />
          </div>
          
          <div style={{ marginBottom: '40px' }}>
            <FairLensLogo size="large" layout="vertical" />
          </div>
          
          <p className="fade-in-up stagger-1" style={{ 
            fontSize: '1.35rem', 
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '56px',
            lineHeight: 1.6,
            fontWeight: 400,
            textShadow: '0 4px 30px rgba(0,0,0,0.8)'
          }}>
            {t("Next-Generation AI Bias Auditor. Detect, Measure, and Remediate bias within your datasets before they hit production.")}
          </p>

          <div className="fade-in-up stagger-2" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button 
              className="btn btn-primary btn-lg pulse-ring" 
              onClick={() => onAuth('inspect')}
              style={{ fontWeight: 600, padding: '16px 48px', fontSize: '1.125rem', letterSpacing: '0.02em' }}
            >
              <Zap size={20} />
              {t("Initialize Audit")}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content Below Hero ── */}
      <div style={{ padding: '60px 48px', display: 'flex', flexDirection: 'column', gap: '48px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

      {/* ── 3D Feature Flip Cards ── */}
      <h2 className="fade-in-up stagger-3" style={{ fontSize: '1.5rem', fontWeight: 700, margin: '16px 0 0', textAlign: 'center' }}>
        {t("Core Capabilities")}
      </h2>
      
      <div className="fade-in-up stagger-4" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px' 
      }}>
        
        {/* Card 1: Inspect */}
        <div className="flip-card float-anim" style={{ height: '220px' }}>
          <div className="flip-card-inner">
            <div className="flip-card-front card-glass" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <Search size={40} color="var(--accent-blue)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t("Inspect Data")}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '8px' }}>
                {t("Upload CSV files and perform automatic demographic analysis.")}
              </p>
            </div>
            <div className="flip-card-back card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'var(--bg-elevated)', borderColor: 'var(--accent-blue)' }}>
               <h4 className="text-gradient" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>{t("Automated Parsing")}</h4>
               <p style={{ fontSize: '0.875rem' }}>{t("Instantly extract sensitive attributes and observe distributions via deep integration with generative AI.")}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Measure */}
        <div className="flip-card float-anim delay-1" style={{ height: '220px' }}>
          <div className="flip-card-inner">
            <div className="flip-card-front card-glass" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <BarChart3 size={40} color="var(--accent-teal)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t("Measure Bias")}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '8px' }}>
                {t("Compute Disparate Impact, Statistical Parity, and Class Imbalance.")}
              </p>
            </div>
            <div className="flip-card-back card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'var(--bg-elevated)', borderColor: 'var(--accent-teal)' }}>
               <h4 style={{ color: 'var(--accent-teal)', fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>{t("Complex Metrics")}</h4>
               <p style={{ fontSize: '0.875rem' }}>{t("Review real-time mathematical breakdowns and thresholds that highlight systemic inequalities.")}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Fix */}
        <div className="flip-card float-anim delay-2" style={{ height: '220px' }}>
          <div className="flip-card-inner">
            <div className="flip-card-front card-glass" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <Wrench size={40} color="var(--accent-yellow)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t("Remediate")}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '8px' }}>
                {t("Apply AI-powered fixes using reweighing and suppression algorithms.")}
              </p>
            </div>
            <div className="flip-card-back card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'var(--bg-elevated)', borderColor: 'var(--accent-yellow)' }}>
               <h4 style={{ color: 'var(--accent-yellow)', fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>{t("Actionable Insights")}</h4>
               <p style={{ fontSize: '0.875rem' }}>{t("Tap into the Gemini model to receive direct step-by-step solutions to neutralize bias efficiently.")}</p>
            </div>
          </div>
        </div>

      </div>

      {/* ── System Status Footer ── */}
      <div className="fade-in-up stagger-5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: 'auto', padding: '16px' }}>
         <ShieldCheck size={16} color="var(--accent-green)" />
         <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
           {t("System Online • All connections secure")}
         </span>
      </div>

      </div>
    </div>
  )
}
