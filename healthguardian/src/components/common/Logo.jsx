export default function Logo({ className = '' }) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="hgGradient" x1="160" y1="120" x2="860" y2="920" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0FB3FF" />
          <stop offset="45%" stopColor="#14E0B5" />
          <stop offset="100%" stopColor="#1E6BFF" />
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M512 110C650 180 770 190 850 220V490C850 700 705 850 512 930C319 850 174 700 174 490V220C254 190 374 180 512 110Z"
        stroke="url(#hgGradient)"
        strokeWidth="42"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter="url(#softGlow)"
      />
      <path
        d="M320 380V660"
        stroke="#1E6BFF"
        strokeWidth="52"
        strokeLinecap="round"
      />
      <path
        d="M320 520H460"
        stroke="#1E6BFF"
        strokeWidth="52"
        strokeLinecap="round"
      />
      <path
        d="M460 380V660"
        stroke="#1E6BFF"
        strokeWidth="52"
        strokeLinecap="round"
      />
      <path
        d="M710 420C680 370 620 340 560 340C460 340 380 425 380 520C380 615 460 700 560 700C650 700 720 640 735 560H610"
        stroke="#1E6BFF"
        strokeWidth="52"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="575" y="225" width="42" height="120" rx="12" fill="url(#hgGradient)" />
      <rect x="536" y="264" width="120" height="42" rx="12" fill="url(#hgGradient)" />
    </svg>
  )
}
