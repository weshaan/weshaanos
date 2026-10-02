/** Public LinkedIn copy for the in-browser profile page (linkedin.com/in/eshaan-walia). */

export const LINKEDIN_BANNER_SRC = '/browser/linkedin%20banner.jpeg'
export const LINKEDIN_PICTURE_SRC = '/browser/linkedin%20picture.png'

let linkedInProfileAssetsPreloaded = false

/** Warm banner + avatar cache before the profile page mounts. */
export function preloadLinkedInProfileAssets() {
  if (linkedInProfileAssetsPreloaded) return
  linkedInProfileAssetsPreloaded = true
  for (const src of [LINKEDIN_BANNER_SRC, LINKEDIN_PICTURE_SRC]) {
    const img = new Image()
    img.src = src
  }
}

/** Company logos for Experience / Volunteering (under public/browser/logos/). */
export const LINKEDIN_COMPANY_LOGOS: Record<string, string> = {
  'Google Summer of Code': '/browser/logos/gsoc.png',
  FOSSASIA: '/browser/logos/fossasia.png',
  DevAnant: '/browser/logos/devanant.png',
  'Techfest, IIT Bombay': '/browser/logos/techfest-iitb.jpg',
  'GirlScript Summer of Code': '/browser/logos/girlscript.png',
  Hacktoberfest: '/browser/logos/hacktoberfest.png',
}

export function linkedInLogoForCompany(company: string): string | undefined {
  return LINKEDIN_COMPANY_LOGOS[company]
}

export const LINKEDIN_DISPLAY = {
  name: 'Eshaan Walia',
  headline:
    "GSoC'26 @ FOSSAISA | Open Source Enthusiast | Built Project Resilience (20K members)",
  location: 'Patiala, Punjab, India',
  followers: '1,172 followers',
  about: `Hello reader! I am a software developer with skills in full-stack development, backend systems, and applied AI projects.

My goal with coding is primarily to have fun, and I also want to create something impactful. I enjoy being able to create something that other people can use and enjoy as well. My time in open source has taught me the importance of giving back to the community and learning how to approach unfamiliar problems.

I was selected as a Google Summer of Code (GSoC) contributor with FOSSASIA, where I worked on an AI-powered real-time interpretation system involving Python, JavaScript, APIs, real-time communication, and backend services. In my other ventures and personal projects, I have worked with Python, RAG, SQL, JavaScript, REST APIs, and full-stack development, and have experience building and working on production-oriented software, with 50+ PRs merged in various open source repositories.

My interest in coding started early in my school days, being curious about tech I used to visit the library and issue Java and OOPs books to later run the codes written in them on my laptop. Recently, I have been focusing on improving my skills in system design, backend architecture, and AI-powered applications, particularly in areas such as large language models (LLMs), and neural networks. At the same time, I continue to explore new technologies and opportunities in the field of software engineering.`,
}

export const LINKEDIN_EXPERIENCE = [
  {
    title: 'Open Source Developer',
    company: 'Google Summer of Code',
    dates: 'May 2026 – Sept 2026',
    location: 'Remote',
    bullets: ['Selected for GSoC 2026.'],
  },
  {
    title: 'Open Source Developer',
    company: 'FOSSASIA',
    dates: 'May 2026 – Sept 2026',
    location: 'Remote',
    bullets: ['Contributing to open-source projects as part of the FOSSASIA ecosystem.'],
  },
  {
    title: 'Software Engineer Intern',
    company: 'DevAnant',
    dates: 'Jun 2024 – July 2024',
    location: 'Rupnagar, Punjab, India',
    bullets: [
      'Built and deployed full-stack web apps with the MERN stack.',
      'Implemented REST APIs, JWT authentication, and performance-oriented backend queries.',
    ],
  },
] as const

export const LINKEDIN_VOLUNTEERING = [
  {
    title: 'Campus Ambassador',
    company: 'Techfest, IIT Bombay',
    dates: 'July 2025 – Dec 2025',
    location: 'Remote',
    bullets: ['I worked as a college ambassador with IIT Bombay.',
      'Finished in the top 200 best performers of a 2,500+ college network.',
    ],
  },
  {
    title: 'Open Source Contributor',
    company: 'GirlScript Summer of Code',
    dates: 'Oct 2024 – Nov 2024',
    location: 'Remote',
    bullets: ['Contributing to open-source projects as part of the GSsoC24 Extended program.'],
  },
  {
    title: 'Open Source Contributor',
    company: 'Hacktoberfest',
    dates: 'Oct 2023, 2024, 2025',
    location: 'Remote',
    bullets: [
      'Participating in yearly Hacktoberfest events.',
    ],
  },
] as const

export const LINKEDIN_EDUCATION = {
  school: 'Thapar Institute of Engineering & Technology',
  degree: 'Bachelor of Technology, Electronics and Computer Engineering',
  dates: '2022 – 2026',
  logoSrc: '/browser/logos/thapar.png',
} as const
