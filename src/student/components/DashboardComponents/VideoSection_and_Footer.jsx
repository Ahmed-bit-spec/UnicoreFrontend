import { useState } from "react";
import {
  UserCheck, Search, CalendarCheck, BookOpen,
  Brain, CheckCircle2, ArrowRight, ChevronDown,
} from "lucide-react";
import useLanguage from "@/hooks/useLanguage";

const STEPS = [
  {
    number: "01",
    icon: UserCheck,
    color: "green",
    titleEn: "Create your account",
    titleSo: "Samee Cinwaan cusub",
    descEn: "Sign up with your email or Google account. It takes less than a minute and it's completely free for all enrolled students.",
    descSo: "Isku diiwaan geli adiga oo isticmaalaya emailkaaka ama akoonka Google. Waxay qaadan doontaa in yar waan bilaash.",
    tipEn: "Use your google account for instant verification.",
    tipSo: "Isticmaal google si xaqiijinta ugu dhakhso badanaato.",
  },
  {
    number: "02",
    icon: Search,
    color: "green",
    titleEn: "Check seat availability",
    titleSo: "Eeg kuraasta banaan",
    descEn: "Go to the seats section and tap 'Reserve'. A window will pop up showing all time slots. Buttons that are disabled are already taken, while the enabled ones are free to book.",
    descSo: "Aad qaybta kuraasta, ka dibna taabo badhanka 'Reserve'. Waxaa kuusoo baxaya daaqad yar oo ay ku qoran yihiin saacadaha. Badhamada aan riixmaynin (Disable) waa la qabsaday, laakiin kuwa furan waad qabsan kartaa.",
    tipEn: "Disabled time slots mean someone else booked them first.",
    tipSo: "Haddii aad aragto saacad aan riixmaynin, taasi waxay la macno tahay in la qabsaday.",
  },
  {
    number: "03",
    icon: CalendarCheck,
    color: "green",
    titleEn: "Pick your time slot",
    titleSo: "Dooro saacaddaada",
    descEn: "Choose how long you need (30 min up to 2 hours), then select any available slot between 7:00 AM and 5:00 PM. The system only allows slots ending at :00 or :30.",
    descSo: "Dooro mudada aad u baahan tahay (30 daqiiqo ilaa 2 saacadood), ka dibna dooro saacadaha banaan ee u dhaxeeya 7:00 subaxnimo ilaa 5:00 galabnimo. Nidaamku wuxuu ogol yahay kaliya saacadaha ku dhamaato :00 ama :30.",
    tipEn: "You can only have one active reservation at a time.",
    tipSo: "Xusuuso, hal kursi ayaad qabsan kartaa hal markiiba.",
  },
  {
    number: "04",
    icon: BookOpen,
    color: "green",
    titleEn: "Browse the academic library",
    titleSo: "Ka baaro maktabadda internetka",
    descEn: "While your seat is secured, head to the Library section to explore hundreds of textbooks, past exams, and research papers — all available online.",
    descSo: "Inta uu kursigaaga kuu xajisan yahay, tag qaybta Maktabadda si aad u baarto boqolaal buug, imtixaanadii hore, iyo cilmi-baarisyadii jaamacadda oo dhan khadka ku jira.",
    tipEn: "No downloads needed — read directly in your browser.",
    tipSo: "Soo degsasho uma baahnid — si toos ah ayaad ugu akhrisan kartaa website-ka.",
  },
  {
    number: "05",
    icon: Brain,
    color: "green",
    titleEn: "Use AI book summaries",
    titleSo: "U isticmaal AI-ga soo-koobista",
    descEn: "Paste a chapter or upload a PDF file to get a clear, structured summary in seconds. Built to help you master dense study materials faster.",
    descSo: "Kaliya qoraal udhiib ama u dhiib fayl PDF ah, waxaadna ku heleysaa soo-koobid cad oo habaysan ilbiriqsiyo gudahood. Waxaa loo dhisay inuu kugu caawiyo fahamka casharada adag.",
    tipEn: "Works best with textbook chapters and research papers.",
    tipSo: "Wuxuu ugu shaqeeyaa si fiican cutubyada buugaagta iyo qoraalada cilmi-baarista.",
  },
];

const StepCard = ({ step, index, isLast, lang }) => {
  const [open, setOpen] = useState(index === 0);
  const Icon = step.icon;
  const isSo = lang === "so";

  return (
    <div className="relative flex gap-5">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-[#2C2DE0] flex items-center justify-center shadow-sm shadow-[#2C2DE0] dark:shadow-none flex-shrink-0">
          <Icon size={18} className="text-white" strokeWidth={2} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-gradient-to-b from-[#2C2DE0] dark:from-[#2C2DE0] to-transparent mt-2 min-h-[32px]" />
        )}
      </div>

      <div className="flex-1 pb-8">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-start justify-between gap-3 text-left group"
        >
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2C2DE0] block mb-1">
              Step {step.number}
            </span>
            <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">
              {isSo ? step.titleSo : step.titleEn}
            </h3>
          </div>
          <ChevronDown
            size={16}
            className={`flex-shrink-0 text-gray-400 mt-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="mt-3 flex flex-col gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {isSo ? step.descSo : step.descEn}
            </p>
            <div className="flex items-start gap-2.5 bg-[#2C2DE0] dark:bg-[#2C2DE0]/10 border border-[#2C2DE0] dark:border-[#2C2DE0]/20 rounded-xl px-3.5 py-3">
              <CheckCircle2 size={13} className="text-[#2C2DE0] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#2C2DE0] dark:text-[#2C2DE0] leading-relaxed">
                {isSo ? step.tipSo : step.tipEn}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const TutorialSection = () => {
  const { language } = useLanguage();
  const isSo = language === "so";

  return (
    <section className="max-w-6xl mx-auto mt-10 px-6">
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="md:sticky md:top-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-full mb-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {isSo ? "Sida loo isticmaalo" : "How it works"}
            </span>
          </div>

          <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
            {isSo
              ? "Bilow adiga oo raacaya \ntallaabooyin fudud"
              : "Get started in\nfive simple steps"}
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm leading-relaxed max-w-sm">
            {isSo
              ? "Nidaamku wuu fudud yahay — ma u baahna tababar. Diiwaangeli, dooro kursi, oo bilow barashada."
              : "The system is straightforward — no training needed. Register, pick a seat, and start studying."}
          </p>

          <div className="grid grid-cols-3 gap-3 mt-8">
            {[
              { value: "< 1 min", labelEn: "To sign up", labelSo: "Diiwaan gelinta" },
              { value: "40", labelEn: "Study seats", labelSo: "Kursiyaha" },
              { value: "Free", labelEn: "For students", labelSo: "Ardayda" },
            ].map((s) => (
              <div
                key={s.value}
                className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl px-3 py-3 text-center"
              >
                <p className="text-lg font-black text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                  {isSo ? s.labelSo : s.labelEn}
                </p>
              </div>
            ))}
          </div>

          <a
            href="/seats"
            className="mt-8 inline-flex items-center gap-2 bg-[#2C2DE0] hover:bg-[#2C2DE0] active:bg-[#2C2DE0] text-white font-bold px-5 py-3 rounded-xl transition-all shadow-sm shadow-[#2C2DE0] dark:shadow-none group text-sm"
          >
            {isSo ? "Hada qabso balan" : "Reserve your seat"}
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl px-6 pt-7 pb-2 shadow-sm">
          {STEPS.map((step, i) => (
            <StepCard
              key={step.number}
              step={step}
              index={i}
              isLast={i === STEPS.length - 1}
              lang={language}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const DashboardFooter = () => {
  const { t } = useLanguage();

  return (
    <footer className="max-w-6xl mx-auto mt-16 px-6 pb-8">
      <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Uniso Digital Library · {t.dashboard.footerRights}
        </p>
        <p className="text-xs text-gray-400">
          {t.dashboard.footerBuilt}
        </p>
      </div>
    </footer>
  );
};