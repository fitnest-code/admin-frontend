'use client'

interface FitNestLogoProps {
  showText?: boolean
  className?: string
}

export function FitNestLogo({ showText = true, className = '' }: FitNestLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>

      {showText && (
        <>
          <img src="/FitnestLogo.png" alt="FitNest Logo" width={28} height={28} />
          <span
            className="text-[18px] font-bold tracking-tight text-white"
            aria-label="FitNest"
          >
            FitNest
          </span>
        </>

      )}
    </div>
  )
}
