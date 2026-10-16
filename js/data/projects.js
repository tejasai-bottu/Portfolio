/* ============================================================================
   PROJECT DATA: the only file you need to edit to add or change projects.

   Categories
     id           short, unique, used in each project's "categories" list
     label        shown on the filter buttons and the tags
     description  one line shown when the filter is selected

   Projects (shown in this order)
     id           unique; also the share link: index.html#project-<id>
     title        full project name
     short        one line for the compact card
     summary      overview paragraph for the detail view
     type         e.g. "Research project"; year is optional
     categories   one or more category ids
     visual       an illustration name from js/projects/visuals.js
                  ("guard", "pqc", "agent", "stego", "scan", "network")
     image        optional instead of visual: { src: "images/x.webp", alt: "..." }
     Optional detail sections, shown only when present:
       role        { title, detail }       your role
       approach    string                  technical approach
       highlights  [string]                what you built / key features
       outcome     string                  result
       stack       [string]                technologies
       links       [{ label, href }]       e.g. GitHub, demo
       related     { label, href }         research on this page, e.g. "#paper-icdect"

   To add a project: copy one block below, change the fields, save, reload.
   ============================================================================ */
(function () {
  'use strict';
  var P = window.Portfolio = window.Portfolio || {};

  P.data = {
    categories: [
      {
        id: 'ai-security',
        label: 'AI Security',
        description: 'How language models behave under adversarial conditions, and the defenses and tests that keep AI systems secure.'
      },
      {
        id: 'cybersecurity',
        label: 'General Cybersecurity',
        description: 'Automated vulnerability testing and security tooling for web applications.'
      },
      {
        id: 'cryptography',
        label: 'Cryptography',
        description: 'Finding the cryptography an organization depends on, planning its move to post-quantum alternatives, and hiding data where nobody looks for it.'
      }
    ],

    projects: [
      {
        id: 'ai-guardian',
        title: 'AI-GUARDIAN: Secure LLM Defense Framework',
        short: 'A unified framework that protects large language models from adversarial attacks in real time.',
        summary: 'A unified security framework that protects large language models from adversarial attacks, with detection and defense layers that respond in real time.',
        type: 'Academic and research project',
        year: '2026',
        categories: ['ai-security'],
        visual: 'guard',
        highlights: [
          'Designed and built a unified security framework to protect large language models from adversarial attacks on AI systems.',
          'Developed an adversarial attack module with multi-layered detection and defense mechanisms for real-time threat mitigation.'
        ],
        outcome: 'Reduced attack success rates and improved model robustness for secure deployment in real-world generative AI systems.',
        stack: ['Python', 'LLM security', 'Adversarial testing'],
        related: { label: 'Related research: Adversarial Security Assessment of Large Language Models (KalingaConf 2026)', href: '#paper-kalingaconf' }
      },
      {
        id: 'pqc-migration',
        title: 'Post-Quantum Cryptography Migration Tool',
        short: 'Finds the cryptography an organization uses, flags what quantum computers could break, and guides the move.',
        summary: 'A scanner that finds which cryptographic algorithms an organization uses, flags the ones quantum computers could break, and guides the move to safer replacements.',
        type: 'Internship project',
        year: '2025 to 2026',
        categories: ['cryptography'],
        visual: 'pqc',
        highlights: [
          'Built a scanning system to identify cryptographic algorithms in use across organizational infrastructure.',
          'Developed a role-based dashboard (Admin, Manager, Developer) to visualize findings and deliver actionable migration insights.',
          'Classified algorithms as quantum-safe or vulnerable and enabled automated migration to post-quantum secure alternatives.'
        ],
        stack: ['Python', 'Cryptography', 'Security', 'Role-based dashboard']
      },
      {
        id: 'security-agent',
        title: 'Autonomous LLM-Driven Security Agent',
        short: 'An AI agent that tests web applications for vulnerabilities with little human involvement.',
        summary: 'An AI agent that runs web application vulnerability tests with little human involvement and writes structured reports. Published at ICDECT.',
        type: 'Research project',
        year: '2025',
        categories: ['ai-security', 'cybersecurity'],
        visual: 'agent',
        highlights: [
          'Built an AI-powered agent to automate web application vulnerability testing with minimal human involvement.',
          'Integrated multiple security tools with a local LLM to detect and report common web vulnerabilities.'
        ],
        outcome: 'Improved testing efficiency by eliminating redundant scans and generating structured, actionable security reports.',
        stack: ['Python', 'LLM security', 'Local LLM', 'Vulnerability testing'],
        related: { label: 'Publication: Autonomous LLM-Driven Security Agent (ICDECT 2025)', href: '#paper-icdect' }
      },
      {
        id: 'steganography',
        title: 'Dynamic Pattern-Based Text Steganography with Advanced Encryption',
        short: 'Hides encrypted files of any format inside ordinary text using invisible Unicode patterns.',
        summary: 'A system that hides encrypted files of any format inside ordinary text. A user-defined code generates invisible Unicode patterns, so the file travels without looking like a file. Published at ICCCT.',
        type: 'B.Tech team project',
        year: 'Paper 2026',
        categories: ['cryptography'],
        visual: 'stego',
        role: {
          title: 'Team lead',
          detail: 'Project planning, algorithm and system design, core module development, and the final documentation and presentation.'
        },
        approach: 'A user-defined code dynamically generates patterns of zero-width Unicode characters that carry the payload inside ordinary text. Before anything is hidden, the system encrypts the payload with AES-256-CBC, derives keys with PBKDF2 and uses SHA-256.',
        highlights: [
          'Developed a system that embeds encrypted files of any format into text documents using a user-defined code.',
          'The code dynamically generates invisible Unicode zero-width patterns, enabling secure and undetectable file transmission.',
          'Built the crypto layer on AES-256-CBC, PBKDF2 and SHA-256 with pycryptodome, plus a custom dynamic encoding.'
        ],
        stack: ['Python', 'AES-256-CBC', 'PBKDF2', 'SHA-256', 'pycryptodome', 'Zero-width Unicode', 'Custom dynamic encoding'],
        links: [
          { label: 'Code on GitHub', href: 'https://github.com/tejasai-bottu/Dynamic-Pattern-Based-Text-Steganography-with-Advance-Encryption' }
        ],
        related: { label: 'Publication: Dynamic Pattern-Based Text Steganography System (ICCCT 2026)', href: '#paper-icccct' }
      },
      {
        id: 'nocode-testing',
        title: 'Security Testing System for No-Code and Low-Code Web Applications',
        short: 'Scans no-code and low-code web apps with established security tools and explains the findings with a local LLM.',
        summary: 'An AI-powered system that scans no-code and low-code web applications for vulnerabilities with established security tools, then uses a local LLM to explain the results in human-readable reports.',
        type: 'B.Tech team project',
        categories: ['cybersecurity', 'ai-security'],
        visual: 'scan',
        role: {
          title: 'Team lead',
          detail: 'Managed overall execution, designed the architecture, coordinated tool integration, guided development and presented the final results.'
        },
        highlights: [
          'Created an automated pipeline that runs OWASP ZAP, Nikto, SQLmap, Metasploit, Nmap and OpenVAS against no-code and low-code web applications.',
          'Fed the findings to a local LLM (Gemma 3 on Ollama) so each result is explained in plain language.',
          'Generated human-readable HTML security reports from the combined findings.'
        ],
        stack: ['Python', 'OWASP ZAP', 'Nikto', 'SQLmap', 'Metasploit', 'Nmap', 'OpenVAS', 'Gemma 3 (local LLM)', 'Ollama', 'HTML report generator'],
        links: [
          { label: 'Code on GitHub', href: 'https://github.com/tejasai-bottu/Security-Testing-System-for-No-Code-and-Low-Code-Web-Applications' }
        ]
      }
    ]
  };
})();
