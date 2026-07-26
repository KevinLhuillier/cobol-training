import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Terminal,
  LayoutGrid,
  Database,
  Server,
  ArrowRight,
  Briefcase,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  MonitorPlay,
  Users
} from "lucide-react";

export default function HomePage() {
  const courses = [
    {
      id: 1,
      title: "COBOL Foundations",
      description: "Master the syntax, file management, and control structures of this historical language.",
      imageGradient: "from-blue-500 to-cyan-400",
      icon: Terminal,
      level: "Beginner"
    },
    {
      id: 2,
      title: "JCL Automation",
      description: "Learn to orchestrate your jobs, manage system utilities, and optimize batch processing.",
      imageGradient: "from-slate-700 to-slate-900",
      icon: LayoutGrid,
      level: "Intermediate"
    },
    {
      id: 3,
      title: "IBM DB2 & SQL",
      description: "Design, query, and optimize relational databases directly on the Mainframe.",
      imageGradient: "from-purple-500 to-indigo-500",
      icon: Database,
      level: "Intermediate"
    },
    {
      id: 4,
      title: "CICS Transactions",
      description: "Develop highly performant, real-time transactional applications.",
      imageGradient: "from-orange-500 to-red-500",
      icon: Server,
      level: "Advanced"
    }
  ];

  const includedFeatures = [
    "Access to all training modules",
    "Quizzes, exercises, and final project",
    "Mainframe access (Built-in emulator)",
    "Personalized exercise reviews",
    "Help and support via Teams"
  ];

  return (
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-slate-200">

        {/* NAVBAR */}
        <header className="max-w-[1600px] mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
              <Terminal className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 text-xl tracking-tight">
            Code Legacy
          </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link
                href="/auth/register"
                className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm h-10 px-4 text-sm font-medium transition-colors"
            >
              Sign up
            </Link>
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 pb-20">

          {/* HERO SECTION */}
          <section className="mt-8 mb-20">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-16 lg:p-20 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-slate-800 rounded-full blur-3xl opacity-50 pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <Badge className="bg-slate-800 text-slate-300 hover:bg-slate-800 border-none mb-6 px-4 py-1.5 text-sm">
                  The reference for the IBM ecosystem
                </Badge>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                  Become the Mainframe expert the industry needs.
                </h1>
                <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
                  Learn COBOL, JCL, DB2, and CICS through hands-on tracks. Master the critical technologies that power the global economy and future-proof your career.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                      href="/auth/register"
                      className="inline-flex items-center justify-center bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold h-14 px-8 text-base transition-colors"
                  >
                    Start learning <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                      href="#programme"
                      className="inline-flex items-center justify-center bg-transparent border-2 border-slate-700 text-white hover:bg-slate-800 hover:text-white rounded-xl font-bold h-14 px-8 text-base transition-colors"
                  >
                    View curriculum
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ARGUMENTS SECTION */}
          <section className="mb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Talent Shortage</h3>
                <p className="text-slate-600 leading-relaxed">
                  Legacy experts are retiring. Companies are actively seeking the next generation of Mainframe developers to take over.
                </p>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Critical Infrastructure</h3>
                <p className="text-slate-600 leading-relaxed">
                  Banking, insurance, transport: COBOL handles over 70% of global financial transactions. A technology that is here to stay.
                </p>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                  <Cpu className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Modernization</h3>
                <p className="text-slate-600 leading-relaxed">
                  The Mainframe is evolving. Learn to interface it with modern web architectures (APIs, microservices) to bridge the gap to the future.
                </p>
              </div>
            </div>
          </section>

          {/* DETAILED PRESENTATION SECTION */}
          <section className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                A unique learning methodology
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                We have completely rethought how to learn Mainframe to make it accessible, visual, and directly applicable to the enterprise.
              </p>
            </div>

            <div className="max-w-6xl mx-auto space-y-12">

              <div className="bg-white border border-slate-100 shadow-sm rounded-[2.5rem] p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16">
                <div className="space-y-5">
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 text-sm">
                    Total Immersion
                  </Badge>
                  <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                    An enterprise terminal built right into your browser.
                  </h3>
                  <p className="text-base text-slate-600 leading-relaxed">
                    Forget complex setups and network configurations. With Code Legacy, you get instant access to a real Mainframe development environment.
                  </p>
                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 font-medium text-sm">Fluid and responsive 3270 emulator</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 font-medium text-sm">Real-time job compilation and execution</span>
                    </li>
                  </ul>
                </div>

                <div className="w-full aspect-[4/3] bg-slate-900 rounded-3xl shadow-lg border border-slate-800 p-6 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
                  <div className="flex items-center gap-2 mb-4 opacity-50">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center text-emerald-400">
                    <MonitorPlay className="h-16 w-16 mb-3 opacity-80" />
                    <p className="font-mono text-xs opacity-60">{"// Terminal screenshot"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-100 shadow-sm rounded-[2.5rem] p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16">
                <div className="space-y-5 lg:order-last">
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 text-sm">
                    Hands-on Projects
                  </Badge>
                  <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                    Work on real-world scenarios.
                  </h3>
                  <p className="text-base text-slate-600 leading-relaxed">
                    Theory is not enough. Our curriculum is built around use cases directly from the banking, insurance, and logistics sectors.
                  </p>
                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 font-medium text-sm">Massive bank file processing (Batch)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 font-medium text-sm">Resilient DB2 database architecture</span>
                    </li>
                  </ul>
                </div>

                <div className="w-full aspect-[4/3] bg-slate-50 rounded-3xl shadow-inner border border-slate-200 p-6 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Database className="h-16 w-16 mb-3 opacity-50" />
                    <p className="font-sans font-semibold text-xs">DB2 Architecture</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-100 shadow-sm rounded-[2.5rem] p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16">
                <div className="space-y-5">
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-3 py-1 text-sm">
                    Mentorship
                  </Badge>
                  <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                    Technical mentorship at every step.
                  </h3>
                  <p className="text-base text-slate-600 leading-relaxed">
                    You are never alone when facing a system error or an abend. The platform includes personalized support to ensure you master every skill.
                  </p>
                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 font-medium text-sm">Detailed code reviews</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 font-medium text-sm">JCL and CICS debugging assistance</span>
                    </li>
                  </ul>
                </div>

                <div className="w-full aspect-[4/3] bg-slate-100 rounded-3xl shadow-sm border border-slate-200 p-6 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
                  <div className="flex flex-col items-center justify-center text-slate-400 relative z-10">
                    <Users className="h-16 w-16 mb-3 opacity-50" />
                    <p className="font-sans font-semibold text-xs">Code Legacy Mentorship</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* COURSES CATALOG SECTION */}
          <section id="programme" className="mb-24 scroll-mt-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">The Modules</h2>
                <p className="text-slate-600 text-lg">Our individual courses, available a la carte or as a full track.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {courses.map((course) => {
                const Icon = course.icon;
                return (
                    <div
                        key={course.id}
                        className="flex flex-col bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                    >
                      <div className={`h-48 w-full bg-gradient-to-br ${course.imageGradient} relative p-5 flex items-end justify-between`}>
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                          <Icon className="h-8 w-8 text-white drop-shadow-md" />
                        </div>
                        <Badge variant="secondary" className="bg-white/90 text-slate-900 shadow-sm border-none font-bold backdrop-blur-md">
                          {course.level}
                        </Badge>
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                          {course.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                          {course.description}
                        </p>

                        <Link
                            href="/auth/register"
                            className="inline-flex items-center justify-center w-full rounded-xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-100 font-semibold h-11 transition-colors mt-auto"
                        >
                          Discover module
                        </Link>
                      </div>
                    </div>
                );
              })}
            </div>
          </section>

          {/* TIMELINE SECTION */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                The Logical Path
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                If you want to become fully autonomous, we recommend following the modules in this specific order, mirroring real-world enterprise projects.
              </p>
            </div>

            <div className="max-w-4xl mx-auto px-4 relative">
              <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 md:-translate-x-1/2 rounded-full"></div>

              <div className="space-y-12 md:space-y-16">

                <div className="relative flex flex-col md:flex-row items-center justify-between">
                  <div className="w-full md:w-[45%] pl-20 md:pl-0 md:pr-12 text-left md:text-right">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none mb-3">Step 1</Badge>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">COBOL Foundations</h3>
                      <p className="text-slate-600 text-sm">Learn syntax, file management (VSAM/Sequential), and basic algorithms.</p>
                    </div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 top-10 md:top-1/2 -translate-y-1/2 md:-translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full border-[6px] border-slate-50 bg-blue-500 text-white z-10 shadow-sm">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div className="hidden md:block w-[45%]"></div>
                </div>

                <div className="relative flex flex-col md:flex-row items-center justify-between">
                  <div className="hidden md:block w-[45%]"></div>
                  <div className="absolute left-4 md:left-1/2 top-10 md:top-1/2 -translate-y-1/2 md:-translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full border-[6px] border-slate-50 bg-slate-800 text-white z-10 shadow-sm">
                    <LayoutGrid className="h-4 w-4" />
                  </div>
                  <div className="w-full md:w-[45%] pl-20 md:pl-12 text-left">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <Badge className="bg-slate-200 text-slate-800 hover:bg-slate-200 border-none mb-3">Step 2</Badge>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">JCL Automation</h3>
                      <p className="text-slate-600 text-sm">Create batch processing chains to compile and execute your COBOL programs at an industrial scale.</p>
                    </div>
                  </div>
                </div>

                <div className="relative flex flex-col md:flex-row items-center justify-between">
                  <div className="w-full md:w-[45%] pl-20 md:pl-0 md:pr-12 text-left md:text-right">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none mb-3">Step 3</Badge>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">IBM DB2 & SQL</h3>
                      <p className="text-slate-600 text-sm">Replace flat files with relational databases embedded directly within your COBOL code.</p>
                    </div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 top-10 md:top-1/2 -translate-y-1/2 md:-translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full border-[6px] border-slate-50 bg-purple-500 text-white z-10 shadow-sm">
                    <Database className="h-4 w-4" />
                  </div>
                  <div className="hidden md:block w-[45%]"></div>
                </div>

                <div className="relative flex flex-col md:flex-row items-center justify-between">
                  <div className="hidden md:block w-[45%]"></div>
                  <div className="absolute left-4 md:left-1/2 top-10 md:top-1/2 -translate-y-1/2 md:-translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full border-[6px] border-slate-50 bg-orange-500 text-white z-10 shadow-sm">
                    <Server className="h-4 w-4" />
                  </div>
                  <div className="w-full md:w-[45%] pl-20 md:pl-12 text-left">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none mb-3">Step 4</Badge>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">CICS Transactions</h3>
                      <p className="text-slate-600 text-sm">Transition from asynchronous batch processing to real-time transactions, including terminal screen management (BMS).</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* PRICING SECTION */}
          <section id="tarifs" className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                Invest in your career
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Transparent, commitment-free pricing to access the entire Code Legacy ecosystem.<br/>
                <span className="font-semibold text-slate-900">All plans start with a 7-day free trial.</span>
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">

              {/* MONTHLY PLAN */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-sm flex flex-col hover:border-slate-300 transition-colors">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Monthly</h3>
                <p className="text-slate-500 text-sm mb-6">Total flexibility, cancel anytime.</p>

                <div className="mb-8">
                  <span className="text-5xl font-extrabold text-slate-900">€39</span>
                  <span className="text-slate-500 font-medium"> / month</span>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {includedFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        <span className="text-slate-700 text-sm">{feature}</span>
                      </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Link
                      href="/auth/register"
                      className="inline-flex items-center justify-center w-full bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold h-14 px-8 text-base transition-colors"
                  >
                    Start your 7-day free trial
                  </Link>
                  <p className="text-center text-xs text-slate-500 mt-4 font-medium">
                    Then €39/month. Cancel anytime.
                  </p>
                </div>
              </div>

              {/* YEARLY PLAN */}
              <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 border border-slate-800 shadow-xl flex flex-col relative overflow-hidden transform md:-translate-y-4">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">Yearly</h3>
                    <Badge className="bg-blue-500 text-white hover:bg-blue-600 border-none px-3 py-1 font-bold shadow-sm">
                      2 months free
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm mb-6">The best choice for a comprehensive learning experience.</p>

                  <div className="mb-8">
                    <span className="text-5xl font-extrabold text-white">€390</span>
                    <span className="text-slate-400 font-medium"> / year</span>
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {includedFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                          <span className="text-slate-300 text-sm">{feature}</span>
                        </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <Link
                        href="/auth/register"
                        className="inline-flex items-center justify-center w-full bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold h-14 px-8 text-base transition-colors shadow-sm"
                    >
                      Start your 7-day free trial
                    </Link>
                    <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                      Then €390/year. Cancel anytime.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>

        </main>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-[1600px] mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-slate-900" />
              <span className="font-bold text-slate-900">Code Legacy</span>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Code Legacy. Premium Mainframe Training.
            </p>
          </div>
        </footer>
      </div>
  );
}