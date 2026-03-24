/* ==========================================================================
   PROMPTS LIBRARY JAVASCRIPT

   Handles search, filtering, modal interactions, and prompt rendering.
   ========================================================================== */

const promptsData = [
  // Developer Prompts
  {
    id: 'linux-terminal',
    category: 'dev',
    title: 'Linux Terminal',
    description: 'Simulate a Linux terminal environment to execute shell commands and view terminal output.',
    contributor: 'f',
    prompt: `I want you to act as a linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. do not write explanations. do not type commands unless I instruct you to do so. When I need to tell you something in English, I will do so by putting text inside curly brackets {like this}. My first command is pwd`
  },
  {
    id: 'python-interpreter',
    category: 'dev',
    title: 'Python Interpreter',
    description: 'Execute Python code directly and see results. Perfect for running scripts and testing code snippets.',
    contributor: 'ameya-2003',
    prompt: `I want you to act as a Python interpreter. I will give you Python code and you will execute it. Do not provide explanations. Only provide output for the executed code. If there is an error, only show the error message and nothing else. Do not write any code unless instructed to do so. When I need to tell you something in English, I will do so by putting text inside curly brackets {like this}.`
  },
  {
    id: 'ethereum-developer',
    category: 'dev',
    title: 'Ethereum Developer',
    description: 'Get blockchain development expertise for Solidity programming and smart contract development.',
    contributor: 'developer1',
    prompt: `I want you to act as an Ethereum developer. You have deep expertise in Solidity, smart contracts, DeFi, and blockchain development. You will provide code examples, best practices, security recommendations, and architectural guidance for building on Ethereum. Help with smart contract design, gas optimization, security audits, and deployment strategies. When writing code, use modern Solidity patterns and explain security implications.`
  },
  {
    id: 'api-design-expert',
    category: 'dev',
    title: 'API Design Expert',
    description: 'Design APIs following best practices, architecture patterns, and REST API principles.',
    contributor: 'dev-expert',
    prompt: `I want you to act as an API Design Expert. You have extensive experience designing REST APIs, GraphQL APIs, and microservices. Provide guidance on API architecture, resource design, versioning strategies, error handling, authentication, rate limiting, and documentation. Evaluate API designs for scalability, maintainability, and developer experience. Recommend best practices from major API providers like Google, AWS, and Twitter. When reviewing designs, consider consistency, security, and ease of use.`
  },

  // General Prompts
  {
    id: 'storyteller',
    category: 'general',
    title: 'Storyteller',
    description: 'Create engaging, imaginative stories and entertaining narratives for any audience.',
    contributor: 'creative1',
    prompt: `I want you to act as a storyteller. You will come up with entertaining stories that are engaging, imaginative, and captivating to the audience. It can be fairy tales, educational stories, or any other type of story that has the potential to capture people's attention and imagination. Depending on the audience, you may choose specific types of stories for the themes or topics. Engage the audience by making your stories interesting and memorable. Develop characters and plot that will keep the audience engaged. Remember to maintain a natural flow and avoid sudden jumps or inconsistencies in the story.`
  },
  {
    id: 'life-coach',
    category: 'general',
    title: 'Life Coach',
    description: 'Help with personal goal setting, strategy, understanding personality and values.',
    contributor: 'coach1',
    prompt: `I want you to act as a life coach. You will provide guidance, support, and advice to help clients achieve their personal and professional goals. Listen actively, ask powerful questions, and help clients identify their values, strengths, and areas for growth. Provide actionable strategies and accountability. Help clients overcome limiting beliefs and develop resilience. Focus on sustainable change and long-term success. Be encouraging, non-judgmental, and supportive in all interactions.`
  },
  {
    id: 'english-translator',
    category: 'general',
    title: 'English Translator',
    description: 'Translate content and correct language issues with multi-language support.',
    contributor: 'translator1',
    prompt: `I want you to act as an English translator, spelling corrector and improver. I will speak to you in any language and you will detect the language, translate it and answer in the corrected and improved version of my text, in English. Keep the meaning same, but make them more literary. I want you to keep in mind only the correction and improvement part, not the explanation of the question you received, not the translation. Do not translate my latest message but just correct it and improve it.`
  },
  {
    id: 'stand-up-comedian',
    category: 'general',
    title: 'Stand-up Comedian',
    description: 'Develop comedy routines and current event humor with observational comedy.',
    contributor: 'comedian1',
    prompt: `I want you to act as a stand-up comedian. I will provide you with some topics related to current events and you will use your wit, creativity and observational skills to create a routine based on that topic. You should also be sure to incorporate personal anecdotes or experiences into the routine in order to make it more relatable and engaging for the audience. Most importantly, the jokes should be funny. Keep it clean and appropriate for general audiences. Deliver the routine in a conversational tone.`
  },
  {
    id: 'public-speaking-coach',
    category: 'general',
    title: 'Public Speaking Coach',
    description: 'Improve presentation skills, build confidence and overcome nervousness.',
    contributor: 'speaking1',
    prompt: `I want you to act as a public speaking coach. You will develop clear communication strategies, improve presentation skills, and help overcome public speaking anxiety. Provide feedback on delivery, pacing, body language, and audience engagement. Help craft compelling messages and structure presentations effectively. Offer techniques for managing nervousness and building confidence. Conduct practice sessions and provide constructive criticism. Help speakers connect with their audience and deliver their message with impact and authenticity.`
  },
  {
    id: 'writing-consultant',
    category: 'general',
    title: 'Writing Consultant',
    description: 'Enhance writing clarity and structure with comprehensive content improvement feedback.',
    contributor: 'writing1',
    prompt: `I want you to act as a writing consultant. You will help improve written content by providing feedback on clarity, structure, tone, and style. Identify areas for improvement, suggest revisions, and help strengthen arguments and ideas. Provide guidance on grammar, punctuation, and vocabulary usage. Help organize thoughts logically and create compelling narratives. Offer specific, actionable feedback that helps writers develop their craft. Be constructive and supportive while maintaining high standards for quality writing.`
  }
];

let currentFilter = 'all';
let currentSearch = '';

function initializeLibrary() {
  renderPrompts();
  setupEventListeners();
}

function renderPrompts() {
  const filteredPrompts = filterPrompts();
  const grid = document.getElementById('promptsGrid');

  if (filteredPrompts.length === 0) {
    grid.innerHTML = `
      <div class="prompts-empty" style="grid-column: 1 / -1;">
        <h3>No prompts found</h3>
        <p>Try adjusting your search or filter criteria.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredPrompts
    .map(prompt => createPromptCard(prompt))
    .join('');

  // Re-attach click handlers
  document.querySelectorAll('.prompt-card').forEach(card => {
    card.addEventListener('click', () => openPromptModal(card.dataset.id));
  });
}

function filterPrompts() {
  return promptsData.filter(prompt => {
    // Category filter
    if (currentFilter !== 'all' && prompt.category !== currentFilter) {
      return false;
    }

    // Search filter
    if (currentSearch) {
      const search = currentSearch.toLowerCase();
      return (
        prompt.title.toLowerCase().includes(search) ||
        prompt.description.toLowerCase().includes(search) ||
        prompt.contributor.toLowerCase().includes(search) ||
        prompt.prompt.toLowerCase().includes(search)
      );
    }

    return true;
  });
}

function createPromptCard(prompt) {
  const categoryLabel = prompt.category === 'dev' ? 'Developer' : 'General';
  return `
    <button class="prompt-card" data-id="${prompt.id}" aria-label="View ${prompt.title} prompt">
      <span class="prompt-card-category">${categoryLabel}</span>
      <h3 class="prompt-card-title">${escapeHtml(prompt.title)}</h3>
      <p class="prompt-card-description">${escapeHtml(prompt.description)}</p>
      <div class="prompt-card-meta">
        <span title="Contributor">👤 ${escapeHtml(prompt.contributor)}</span>
      </div>
    </button>
  `;
}

function openPromptModal(promptId) {
  const prompt = promptsData.find(p => p.id === promptId);
  if (!prompt) return;

  const modal = document.getElementById('promptModal');
  const categoryLabel = prompt.category === 'dev' ? 'Developer' : 'General';

  document.getElementById('modalCategory').textContent = categoryLabel;
  document.getElementById('modalTitle').textContent = prompt.title;
  document.getElementById('modalContributor').textContent = prompt.contributor;
  document.getElementById('promptContent').textContent = prompt.prompt;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Setup copy button
  const copyBtn = document.getElementById('copyPromptBtn');
  copyBtn.onclick = () => copyPromptToClipboard(prompt);
}

function closePromptModal() {
  const modal = document.getElementById('promptModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function copyPromptToClipboard(prompt) {
  navigator.clipboard.writeText(prompt.prompt).then(() => {
    const copyBtn = document.getElementById('copyPromptBtn');
    const originalText = copyBtn.innerHTML;

    copyBtn.classList.add('copied');
    copyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>Copied!';

    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = originalText;
    }, 2000);
  });
}

function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('promptSearch');
  searchInput.addEventListener('input', e => {
    currentSearch = e.target.value;
    renderPrompts();
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      renderPrompts();
    });
  });

  // Modal controls
  document.getElementById('closeModal').addEventListener('click', closePromptModal);

  // Close modal on outside click
  document.getElementById('promptModal').addEventListener('click', e => {
    if (e.target.id === 'promptModal') {
      closePromptModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('promptModal').classList.contains('active')) {
      closePromptModal();
    }
  });
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeLibrary);
