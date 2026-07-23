import re
with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

stars_div = '''
      {/* Background Stars for Dimoon Themes */}
      {(isDimoon || isDimoonBlue) && (
        <div className="absolute inset-0 pointer-events-none z-[0] overflow-hidden">
          {isDimoon && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(253,224,71,0.15)_0%,transparent_70%)] animate-[dimoonPulse_10s_ease-in-out_infinite]" />
              <div className="absolute top-[10vh] right-[10vw] text-[clamp(40px,15vw,200px)] text-theme-accent animate-[moonRiseSet_30s_ease-in-out_infinite]">☽</div>
              <div className="absolute top-[30vh] left-[10vw] text-[clamp(16px,6vw,80px)] text-theme-accent opacity-60 animate-[floatSpin_15s_linear_infinite,dimoonPulse_4s_ease-in-out_infinite]">✦</div>
              <div className="absolute bottom-[20vh] right-[25vw] text-[clamp(12px,5vw,60px)] text-theme-accent opacity-40 animate-[floatSpin_20s_linear_infinite_reverse,dimoonPulse_6s_ease-in-out_infinite_2s]">✧</div>
              <div className="absolute top-0 left-0 w-[150px] h-[2px] bg-gradient-to-r from-transparent via-theme-accent to-white animate-[shootingStarDimoon_12s_cubic-bezier(0.4,0,1,1)_infinite]" />
            </>
          )}
          {isDimoonBlue && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_120%,rgba(56,189,248,0.2)_0%,transparent_60%)] animate-[dimoonPulse_12s_ease-in-out_infinite_reverse]" />
              <div className="absolute top-[5vh] left-[5vw] text-[clamp(50px,18vw,250px)] text-theme-accent drop-shadow-[0_0_40px_var(--color-theme-accent)] animate-[moonRiseSet_40s_ease-in-out_infinite_reverse]">☾</div>
              <div className="absolute top-[15vh] right-[15vw] text-[clamp(24px,8vw,120px)] text-theme-accent opacity-50 animate-[floatSpin_25s_linear_infinite,dimoonPulse_5s_ease-in-out_infinite]">✺</div>
              <div className="absolute bottom-[15vh] left-[20vw] text-[clamp(16px,6vw,80px)] text-theme-accent opacity-30 animate-[floatSpin_18s_linear_infinite_reverse,dimoonPulse_7s_ease-in-out_infinite_3s]">❅</div>
              <div className="absolute top-[20vh] right-[-20vw] w-[250px] h-[3px] bg-gradient-to-l from-transparent via-theme-accent to-white animate-[shootingStarDimoon_8s_cubic-bezier(0.4,0,1,1)_infinite_4s] origin-right" />
            </>
          )}
        </div>
      )}
'''

content = content.replace('{/* Easter Egg Overlay */}', stars_div + '\n      {/* Easter Egg Overlay */}')

# Now for hover telescope shooting stars
stars_hover_code = '''
      {isHoveringTelescope && (
        <div className="absolute inset-0 pointer-events-none z-[10] overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`shoot-${i}`}
              className="absolute w-[150px] h-[2px] bg-gradient-to-r from-transparent via-white to-white"
              style={{
                top: `${Math.random() * 50}%`,
                left: `${-20 + Math.random() * 20}%`,
                transform: `rotate(${15 + Math.random() * 20}deg)`,
                animation: `shootingStarDimoon ${0.5 + Math.random()}s cubic-bezier(0.4, 0, 1, 1) infinite ${Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}
'''

content = content.replace('{/* Easter Egg Overlay */}', stars_hover_code + '\n      {/* Easter Egg Overlay */}')

# Add state
state_code = '  const [showAudioPlayer, setShowAudioPlayer] = useState(false);\n  const [isHoveringTelescope, setIsHoveringTelescope] = useState(false);'
content = content.replace('  const [showAudioPlayer, setShowAudioPlayer] = useState(false);', state_code)

# Add onMouseEnter, onMouseLeave to Telescope
content = content.replace(
    'title="Посмотреть на звезды"\n              >',
    'title="Посмотреть на звезды"\n                onMouseEnter={() => setIsHoveringTelescope(true)}\n                onMouseLeave={() => setIsHoveringTelescope(false)}\n              >'
)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
