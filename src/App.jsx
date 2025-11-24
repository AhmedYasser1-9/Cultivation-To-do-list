import { motion } from 'framer-motion'
import { Brain, ScrollText, Store, Sword } from 'lucide-react'

const navItems = [
  {
    label: 'Sect Missions',
    description: 'Monitor daily cultivation tasks',
    icon: ScrollText,
  },
  {
    label: 'Inner World',
    description: 'Survey stats & cultivation base',
    icon: Brain,
  },
  {
    label: 'Spirit Pavilion',
    description: 'Trade merit for relics',
    icon: Store,
  },
]

const auraVariants = {
  rest: { opacity: 0.2, scale: 0.98 },
  hover: { opacity: 0.45, scale: 1.02 },
}

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-emerald-100">
      <div className="fixed inset-y-0 z-20 hidden w-72 flex-col border-r border-amber-900/30 bg-slate-950/95 px-6 py-10 backdrop-blur md:flex">
        <div className="mb-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.6em] text-amber-200">
            Order of Dawn
          </p>
          <h1 className="text-2xl font-semibold text-emerald-400">
            Cultivation Log
          </h1>
        </div>

        <nav className="space-y-4">
          {navItems.map(({ label, description, icon: Icon }) => (
            <motion.button
              key={label}
              initial="rest"
              whileHover="hover"
              animate="rest"
              variants={auraVariants}
              className="relative w-full rounded-2xl border border-amber-900/30 bg-gradient-to-br from-slate-950 via-slate-950/80 to-slate-900/60 px-4 py-5 text-left transition-colors duration-200 hover:border-amber-500/60"
            >
              <div className="absolute inset-0 rounded-2xl bg-amber-500/5 blur-3xl" />
              <div className="relative flex items-start space-x-3">
                <div className="rounded-xl border border-amber-900/40 bg-slate-900/80 p-2 text-amber-300">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-wide text-emerald-50">
                    {label}
                  </p>
                  <p className="text-xs text-emerald-400/80">{description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </nav>

        <div className="mt-auto rounded-3xl border border-amber-900/30 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200">
            Spirit Forecast
          </p>
          <p className="mt-3 text-sm text-emerald-400">
            Qi currents favor insight. Prepare for inner breakthroughs.
          </p>
        </div>
      </div>

      <main className="ml-0 min-h-screen bg-celestial-grid px-6 py-8 md:ml-72 md:px-12 md:py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <section className="rounded-[32px] border border-amber-900/30 bg-slate-900/60 p-6 text-emerald-50 shadow-aura backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.6em] text-amber-200">
                  Realm
                </p>
                <h2 className="text-3xl font-semibold text-emerald-300">
                  Mortal Body · Stage 1
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 rounded-2xl border border-amber-900/30 bg-amber-500/20 px-5 py-3 text-sm font-semibold text-amber-200 backdrop-blur"
              >
                <Sword size={18} />
                <span>Commence Training</span>
              </motion.button>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-emerald-400">
                <span>Qi Channeling</span>
                <span>62%</span>
              </div>
              <div className="h-2 rounded-full border border-amber-900/30 bg-slate-950/80">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-red-400"
                  initial={{ width: '0%' }}
                  animate={{ width: '62%' }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: 'Daily Missions',
                value: '4 / 7',
                hint: 'Complete to earn qi threads',
              },
              {
                title: 'Cultivation Base',
                value: '2,340 Qi',
                hint: 'Accumulated spiritual energy',
              },
              {
                title: 'Ascension Window',
                value: '12 hrs',
                hint: 'Time until next breakthrough check',
              },
            ].map(({ title, value, hint }) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-amber-900/30 bg-slate-900/70 p-5 shadow-lg shadow-amber-900/10"
              >
                <p className="text-xs uppercase tracking-[0.4em] text-amber-200">
                  {title}
                </p>
                <p className="mt-3 text-3xl font-semibold text-emerald-300">
                  {value}
                </p>
                <p className="mt-2 text-sm text-emerald-400/80">{hint}</p>
              </motion.div>
            ))}
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
