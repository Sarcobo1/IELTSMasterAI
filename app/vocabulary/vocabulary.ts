export interface VocabularyItem {
  word: string;
  pronunciation?: string;
  definition: string;
  example: string;
  highlightWord: string;
}

export interface VocabularyData {
  [topic: string]: VocabularyItem[];
}

export const vocabularyData: VocabularyData = {
  Environment: [
    {
      word: "Irreversible damage",
      pronunciation: "ɪrɪˈvɜːsəbl ˈdæmɪdʒ",
      definition:
        "Permanent harm that cannot be undone or repaired, typically referring to environmental destruction.",
      example:
        "The continued deforestation of the Amazon rainforest could lead to irreversible damage to the global ecosystem, affecting climate patterns for generations to come.",
      highlightWord: "irreversible damage",
    },
    {
      word: "Eco-friendly",
      pronunciation: "ˈiːkəʊ ˈfrendli",
      definition:
        "Not harmful to the environment; designed to have minimal negative impact on the natural world.",
      example:
        "Many companies are now adopting eco-friendly practices, such as using renewable energy sources and reducing plastic packaging, to meet consumer demand for sustainable products.",
      highlightWord: "eco-friendly",
    },
    {
      word: "Carbon footprint",
      pronunciation: "ˈkɑːbən ˈfʊtprɪnt",
      definition:
        "The total amount of greenhouse gases produced directly and indirectly by human activities, measured in units of carbon dioxide.",
      example:
        "Individuals can significantly reduce their carbon footprint by choosing public transportation over private vehicles and adopting a plant-based diet.",
      highlightWord: "carbon footprint",
    },
    {
      word: "Sustainable development",
      pronunciation: "səˈsteɪnəbl dɪˈveləpmənt",
      definition:
        "Economic development that meets present needs without compromising the ability of future generations to meet their own needs.",
      example:
        "Sustainable development requires a delicate balance between economic growth and environmental protection, ensuring long-term prosperity for all.",
      highlightWord: "sustainable development",
    },
  ],
  Technology: [
    {
      word: "Cutting-edge",
      pronunciation: "ˈkʌtɪŋ edʒ",
      definition:
        "The most advanced or innovative stage of development in a particular field, especially technology.",
      example:
        "The company's cutting-edge artificial intelligence system has revolutionized the healthcare industry by enabling early disease detection with unprecedented accuracy.",
      highlightWord: "cutting-edge",
    },
    {
      word: "Obsolete",
      pronunciation: "ˈɒbsəliːt",
      definition:
        "No longer in use or outdated, having been replaced by something newer and more efficient.",
      example:
        "Many traditional manufacturing jobs have become obsolete due to automation and robotics, forcing workers to acquire new skills to remain employable.",
      highlightWord: "obsolete",
    },
    {
      word: "Technological breakthrough",
      pronunciation: "ˌteknəˈlɒdʒɪkəl ˈbreɪkθruː",
      definition:
        "A significant discovery or advancement in technology that opens up new possibilities or solves major problems.",
      example:
        "The development of CRISPR gene editing represents a technological breakthrough that could potentially eradicate hereditary diseases and transform medicine.",
      highlightWord: "technological breakthrough",
    },
  ],
  Education: [
    {
      word: "Lifelong learning",
      pronunciation: "ˈlaɪflɒŋ ˈlɜːnɪŋ",
      definition:
        "The ongoing, voluntary, and self-motivated pursuit of knowledge throughout one's entire life.",
      example:
        "In today's rapidly changing job market, lifelong learning has become essential for professionals who wish to remain competitive and adapt to new industry demands.",
      highlightWord: "lifelong learning",
    },
    {
      word: "Critical thinking",
      pronunciation: "ˈkrɪtɪkəl ˈθɪŋkɪŋ",
      definition:
        "The ability to analyze information objectively and make reasoned judgments, rather than accepting information at face value.",
      example:
        "Universities should prioritize developing students' critical thinking skills, as this enables them to evaluate complex problems and make informed decisions in their future careers.",
      highlightWord: "critical thinking",
    },
    {
      word: "Curriculum",
      pronunciation: "kəˈrɪkjʊləm",
      definition:
        "The subjects and content taught in a school or educational program, including the planned learning experiences.",
      example:
        "Many educators argue that the traditional curriculum should be reformed to include more practical skills such as financial literacy and digital competence.",
      highlightWord: "curriculum",
    },
    {
      word: "Pedagogical approach",
      pronunciation: "ˌpedəˈɡɒdʒɪkəl əˈprəʊtʃ",
      definition:
        "The method and practice of teaching, including the strategies and techniques used to facilitate learning.",
      example:
        "A student-centered pedagogical approach, which encourages active participation and collaborative learning, has been shown to be more effective than traditional lecture-based methods.",
      highlightWord: "pedagogical approach",
    },
  ],
  Health: [
    {
      word: "Preventive healthcare",
      pronunciation: "prɪˈventɪv ˈhelθkeə",
      definition:
        "Medical care focused on disease prevention and health maintenance rather than treatment of illness.",
      example:
        "Investing in preventive healthcare measures, such as regular screenings and vaccination programs, can significantly reduce long-term healthcare costs and improve public health outcomes.",
      highlightWord: "preventive healthcare",
    },
    {
      word: "Sedentary lifestyle",
      pronunciation: "ˈsedəntri ˈlaɪfstaɪl",
      definition:
        "A way of life characterized by little or no physical activity, typically involving prolonged sitting or inactivity.",
      example:
        "The rise of desk jobs and screen-based entertainment has led to an increasingly sedentary lifestyle among urban populations, contributing to rising obesity rates and cardiovascular diseases.",
      highlightWord: "sedentary lifestyle",
    },
    {
      word: "Mental well-being",
      pronunciation: "ˈmentl wel ˈbiːɪŋ",
      definition:
        "A state of psychological and emotional health characterized by happiness, contentment, and the ability to cope with stress.",
      example:
        "Employers are increasingly recognizing the importance of mental well-being in the workplace, implementing programs such as counseling services and flexible working arrangements.",
      highlightWord: "mental well-being",
    },
  ],
  Crime: [
    {
      word: "Deterrent effect",
      pronunciation: "dɪˈterənt ɪˈfekt",
      definition:
        "The discouraging influence that prevents someone from taking a particular action, especially committing a crime.",
      example:
        "Research suggests that the certainty of punishment has a stronger deterrent effect on potential criminals than the severity of the penalty itself.",
      highlightWord: "deterrent effect",
    },
    {
      word: "Recidivism rate",
      pronunciation: "rɪˈsɪdɪvɪzəm reɪt",
      definition:
        "The tendency of convicted criminals to reoffend, measured as a percentage of those who return to criminal behavior after release.",
      example:
        "Countries with comprehensive rehabilitation programs and education initiatives in prisons tend to have lower recidivism rates compared to those that focus solely on punishment.",
      highlightWord: "recidivism rate",
    },
    {
      word: "White-collar crime",
      pronunciation: "waɪt ˈkɒlə kraɪm",
      definition:
        "Non-violent, financially motivated crimes typically committed by business professionals or government officials.",
      example:
        "White-collar crime, including fraud, embezzlement, and insider trading, can cause billions of dollars in economic damage and erode public trust in institutions.",
      highlightWord: "white-collar crime",
    },
    {
      word: "Rehabilitation",
      pronunciation: "ˌriːəbɪlɪˈteɪʃən",
      definition:
        "The process of helping offenders reintegrate into society through education, therapy, and skills training.",
      example:
        "Many criminologists advocate for a greater emphasis on rehabilitation rather than punishment, arguing that this approach is more effective in reducing crime rates in the long term.",
      highlightWord: "rehabilitation",
    },
  ],
};
