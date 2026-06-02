import {
  Heart,
  Mail,
  Github,
  Linkedin,
} from "lucide-react";

const developers = [
  {
    name: "Italo Vicente",
    email: "italokojoho9@gmail.com",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Layza Carneiro",
    email: "layza.mrcarneiro@gmail.com",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Pedro Nonato",
    email: "pedro.nonato@aluno.uece.br",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Samuel Valente",
    email: "samuel.valente188@gmail.com",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Silvio Gonçalves",
    email: "silvio.goncalves@usp.br",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Wallison Vieira",
    email: "wallison.vieira@aluno.uece.br",
    github: "#",
    linkedin: "#",
  },
];

const Footer = () => (
  <footer className="relative border-t border-white/10 bg-[#060816] overflow-hidden">
    {/* Background Glow */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.10),transparent_35%)]" />

    {/* Grid */}
    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />

    <div className="container relative z-10 mx-auto px-4 py-14">
      {/* TOP */}
      <div className="flex flex-col items-center text-center mb-12">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 flex items-center justify-center">
            <img
              src="/images/logo.svg"
              alt="SecureLine"
              className="w-12 h-12"
            />
          </div>

          <div className="text-left">
            <h2 className="text-xl font-black text-white tracking-tight">
              SecureLine
            </h2>

            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              Security Awareness
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="max-w-2xl text-zinc-400 leading-relaxed text-sm md:text-base">
          Plataforma educativa focada em conscientização digital,
          prevenção de golpes online e treinamento comportamental
          através de experiências modernas e interativas.
        </p>

        {/* Tag */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-zinc-400 backdrop-blur-xl">
          <Heart className="w-3.5 h-3.5 text-violet-400 fill-violet-400" />
          Feito para proteger pessoas e negócios digitais
        </div>
      </div>

        {/* DEVELOPERS */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />

            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              Desenvolvedores
            </p>

            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {developers.map((dev) => (
              <div
                key={dev.name}
                className="
                  group
                  rounded-3xl
                  border border-white/10
                  bg-white/[0.03]
                  backdrop-blur-xl
                  p-5
                  transition-all duration-300
                  hover:border-primary/30
                  hover:bg-white/[0.05]
                  hover:-translate-y-1
                "
              >
                <h3 className="text-white font-semibold text-base mb-2">
                  {dev.name}
                </h3>

                <a
                  href={`mailto:${dev.email}`}
                  className="
                    text-sm text-zinc-400
                    hover:text-primary
                    transition-colors
                  "
                >
                  {dev.email}
                </a>
              </div>
            ))}
          </div>
        </div>

      {/* BOTTOM */}
      <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-zinc-500">
          © 2026 SecureLine. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;