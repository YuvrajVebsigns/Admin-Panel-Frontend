/* eslint-disable @typescript-eslint/no-explicit-any */

export class HeroBlockTool {
  api: any;
  readOnly: boolean;
  data: any;

  constructor({ data, api, readOnly }: any) {
    this.api = api;
    this.readOnly = readOnly;
    this.data = {
      title: data.title || '',
      subtitle: data.subtitle || '',
      buttonText: data.buttonText || '',
      buttonLink: data.buttonLink || '',
      bgColor: data.bgColor || 'gradient-brand',
    };
  }

  static get toolbox() {
    return {
      title: 'Hero Section',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
    };
  }

  render() {
    const container = document.createElement('div');
    container.className =
      'p-6 border border-brand-100 dark:border-navy-700 bg-brand-50/10 dark:bg-navy-950/20 rounded-3xl space-y-4';

    container.innerHTML = `
      <div class="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider mb-2">
        ✨ Hero Section Block
      </div>
      <div class="space-y-3">
        <div>
          <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Headline / Main Title</label>
          <input type="text" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-brand-500" placeholder="e.g. Elevate Your Creative Agency Presence" value="${
            this.data.title
          }" id="hero-title"/>
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Subtitle / Body Text</label>
          <textarea class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-brand-500" placeholder="e.g. We build premium interfaces that drive conversions..." rows="2" id="hero-subtitle">${
            this.data.subtitle
          }</textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">CTA Button Text</label>
            <input type="text" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-brand-500" placeholder="e.g. Start Trial" value="${
              this.data.buttonText
            }" id="hero-btn-text"/>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">CTA Button Route / Link</label>
            <input type="text" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-brand-500" placeholder="e.g. /pricing" value="${
              this.data.buttonLink
            }" id="hero-btn-link"/>
          </div>
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Background style</label>
          <select class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-[#0b1a32] text-white focus:outline-hidden focus:border-brand-500" id="hero-bg">
            <option value="gradient-brand" ${this.data.bgColor === 'gradient-brand' ? 'selected' : ''}>Brand Dark Gradient</option>
            <option value="solid-dark" ${this.data.bgColor === 'solid-dark' ? 'selected' : ''}>Navy Solid</option>
            <option value="solid-light" ${this.data.bgColor === 'solid-light' ? 'selected' : ''}>White / Clean Gray</option>
          </select>
        </div>
      </div>
    `;

    // Event listeners to update data reactively
    container.querySelector('#hero-title')?.addEventListener('input', (e: any) => {
      this.data.title = e.target.value;
    });
    container.querySelector('#hero-subtitle')?.addEventListener('input', (e: any) => {
      this.data.subtitle = e.target.value;
    });
    container.querySelector('#hero-btn-text')?.addEventListener('input', (e: any) => {
      this.data.buttonText = e.target.value;
    });
    container.querySelector('#hero-btn-link')?.addEventListener('input', (e: any) => {
      this.data.buttonLink = e.target.value;
    });
    container.querySelector('#hero-bg')?.addEventListener('change', (e: any) => {
      this.data.bgColor = e.target.value;
    });

    return container;
  }

  save() {
    return this.data;
  }
}

export class FeaturesBlockTool {
  api: any;
  readOnly: boolean;
  data: any;

  constructor({ data, api, readOnly }: any) {
    this.api = api;
    this.readOnly = readOnly;
    this.data = {
      sectionTitle: data.sectionTitle || '',
      features: data.features || [
        { title: '', description: '' },
        { title: '', description: '' },
        { title: '', description: '' },
      ],
    };
  }

  static get toolbox() {
    return {
      title: 'Features Grid',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>',
    };
  }

  render() {
    const container = document.createElement('div');
    container.className =
      'p-6 border border-emerald-100 dark:border-navy-700 bg-emerald-50/10 dark:bg-navy-950/20 rounded-3xl space-y-4';

    const rebuild = () => {
      container.innerHTML = '';

      // Header row
      const headerDiv = document.createElement('div');
      headerDiv.className =
        'flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2';
      headerDiv.innerHTML = `
        <span>⚡ Features Grid Block</span>
        <span class="text-[10px] text-gray-400 dark:text-gray-500 font-normal">(${this.data.features.length} Cards)</span>
      `;
      container.appendChild(headerDiv);

      // Section Title field
      const titleWrapper = document.createElement('div');
      titleWrapper.innerHTML = `
        <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Section Title</label>
        <input type="text" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-emerald-500 mb-4" placeholder="e.g. Why Customers Choose Us" value="${this.data.sectionTitle}" id="feat-section-title"/>
      `;
      container.appendChild(titleWrapper);

      titleWrapper.querySelector('#feat-section-title')?.addEventListener('input', (e: any) => {
        this.data.sectionTitle = e.target.value;
      });

      // Grid for Feature Cards
      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3';

      this.data.features.forEach((feature: any, idx: number) => {
        const card = document.createElement('div');
        card.className =
          'p-3.5 border border-gray-150 dark:border-navy-700 rounded-2xl bg-white dark:bg-navy-900 space-y-2 relative group/feat-card';
        card.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 block">Feature Card #${idx + 1}</span>
            <button type="button" class="btn-remove-feat text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all" data-idx="${idx}" title="Remove Card">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <input type="text" class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-emerald-500 font-bold" placeholder="Feature Title" value="${feature.title || ''}"/>
          <textarea class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-emerald-500" placeholder="Feature Short Description..." rows="2">${feature.description || ''}</textarea>
        `;

        // Save card fields to data
        card.querySelector('input')?.addEventListener('input', (e: any) => {
          this.data.features[idx].title = e.target.value;
        });

        card.querySelector('textarea')?.addEventListener('input', (e: any) => {
          this.data.features[idx].description = e.target.value;
        });

        card.querySelector('.btn-remove-feat')?.addEventListener('click', () => {
          this.data.features.splice(idx, 1);
          rebuild();
        });

        grid.appendChild(card);
      });

      container.appendChild(grid);

      // Actions section
      const actions = document.createElement('div');
      actions.className = 'flex items-center justify-end pt-2';

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className =
        'px-3 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1.5 transition-all shadow-sm';
      addBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Feature Card
      `;
      addBtn.addEventListener('click', () => {
        this.data.features.push({ title: '', description: '' });
        rebuild();
      });

      actions.appendChild(addBtn);
      container.appendChild(actions);
    };

    rebuild();
    return container;
  }

  save() {
    return this.data;
  }
}

export class CtaBlockTool {
  api: any;
  readOnly: boolean;
  data: any;

  constructor({ data, api, readOnly }: any) {
    this.api = api;
    this.readOnly = readOnly;
    this.data = {
      title: data.title || '',
      description: data.description || '',
      buttonText: data.buttonText || '',
      buttonLink: data.buttonLink || '',
    };
  }

  static get toolbox() {
    return {
      title: 'Call To Action (CTA)',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
    };
  }

  render() {
    const container = document.createElement('div');
    container.className =
      'p-6 border border-purple-100 dark:border-navy-700 bg-purple-50/10 dark:bg-navy-950/20 rounded-3xl space-y-4';

    container.innerHTML = `
      <div class="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider mb-2">
        📢 Call To Action Block
      </div>
      <div class="space-y-3">
        <div>
          <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Action Headline</label>
          <input type="text" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-purple-500" placeholder="e.g. Ready to scale your business?" value="${
            this.data.title
          }" id="cta-title"/>
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Supporting Snippet Description</label>
          <textarea class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-purple-500" placeholder="e.g. Join over 5,000+ teams who scale faster..." rows="2" id="cta-desc">${
            this.data.description
          }</textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Button text</label>
            <input type="text" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-purple-500" placeholder="e.g. Contact Sales" value="${
              this.data.buttonText
            }" id="cta-btn-text"/>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Button link / route</label>
            <input type="text" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-purple-500" placeholder="e.g. /contact-us" value="${
              this.data.buttonLink
            }" id="cta-btn-link"/>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#cta-title')?.addEventListener('input', (e: any) => {
      this.data.title = e.target.value;
    });
    container.querySelector('#cta-desc')?.addEventListener('input', (e: any) => {
      this.data.description = e.target.value;
    });
    container.querySelector('#cta-btn-text')?.addEventListener('input', (e: any) => {
      this.data.buttonText = e.target.value;
    });
    container.querySelector('#cta-btn-link')?.addEventListener('input', (e: any) => {
      this.data.buttonLink = e.target.value;
    });

    return container;
  }

  save() {
    return this.data;
  }
}

export class TestimonialsBlockTool {
  api: any;
  readOnly: boolean;
  data: any;
  config: any;

  constructor({ data, api, readOnly, config }: any) {
    this.api = api;
    this.readOnly = readOnly;
    this.config = config || {};
    this.data = {
      sectionTitle: data.sectionTitle || '',
      testimonials: data.testimonials || [
        { author: '', role: '', quote: '', avatar: '' },
        { author: '', role: '', quote: '', avatar: '' },
      ],
    };
  }

  static get toolbox() {
    return {
      title: 'Testimonials',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    };
  }

  render() {
    const container = document.createElement('div');
    container.className =
      'p-6 border border-pink-100 dark:border-navy-700 bg-pink-50/10 dark:bg-navy-950/20 rounded-3xl space-y-4';

    const rebuild = () => {
      container.innerHTML = '';

      // Header row
      const headerDiv = document.createElement('div');
      headerDiv.className =
        'flex items-center justify-between text-pink-600 dark:text-pink-400 font-bold text-xs uppercase tracking-wider mb-2';
      headerDiv.innerHTML = `
        <span>💬 Testimonials Section Block</span>
        <span class="text-[10px] text-gray-400 dark:text-gray-500 font-normal">(${this.data.testimonials.length} Reviews)</span>
      `;
      container.appendChild(headerDiv);

      // Section Title field
      const titleWrapper = document.createElement('div');
      titleWrapper.innerHTML = `
        <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Section Title</label>
        <input type="text" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-pink-500 mb-4" placeholder="e.g. What our clients say" value="${this.data.sectionTitle}" id="test-section-title"/>
      `;
      container.appendChild(titleWrapper);

      titleWrapper.querySelector('#test-section-title')?.addEventListener('input', (e: any) => {
        this.data.sectionTitle = e.target.value;
      });

      // Grid for Testimonial Cards
      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-3';

      this.data.testimonials.forEach((testimonial: any, idx: number) => {
        const card = document.createElement('div');
        card.className =
          'p-3.5 border border-gray-150 dark:border-navy-700 rounded-2xl bg-white dark:bg-navy-900 space-y-2.5 relative group/test-card';

        const avatarUrl = testimonial.avatar || '';
        const avatarPreview = avatarUrl
          ? `<img src="${avatarUrl}" class="w-10 h-10 rounded-full object-cover border border-pink-100 dark:border-pink-900/50" />`
          : `<div class="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center text-pink-500 text-xs font-bold uppercase">${(testimonial.author || 'R').charAt(0)}</div>`;

        card.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-pink-500 dark:text-pink-400 block">Review #${idx + 1}</span>
            <button type="button" class="btn-remove-test text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all" title="Remove Review">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div class="flex items-center gap-3 p-2 bg-pink-50/20 dark:bg-pink-950/10 rounded-xl border border-pink-100/30">
            ${avatarPreview}
            <div class="flex flex-col gap-1 items-start">
              <button type="button" class="btn-select-avatar px-2.5 py-1 text-[10px] font-bold bg-pink-500 hover:bg-pink-600 text-white rounded-md transition-all shadow-xs border-none cursor-pointer">
                ${avatarUrl ? 'Change Photo' : 'Select Photo'}
              </button>
              ${
                avatarUrl
                  ? `
                <button type="button" class="btn-remove-avatar text-[9px] font-semibold text-gray-400 hover:text-red-500 transition-all bg-transparent border-none cursor-pointer text-left">
                  Remove Photo
                </button>
              `
                  : ''
              }
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <input type="text" class="w-full px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-pink-500" placeholder="Author Name" value="${testimonial.author || ''}"/>
            <input type="text" class="w-full px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-pink-500" placeholder="Role (e.g. CEO)" value="${testimonial.role || ''}"/>
          </div>
          <textarea class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-pink-500" placeholder="Feedback / Quote text..." rows="2">${testimonial.quote || ''}</textarea>
        `;

        const inputs = card.querySelectorAll('input');
        const authorInput = inputs[0];
        const roleInput = inputs[1];
        const textarea = card.querySelector('textarea');

        authorInput?.addEventListener('input', (e: any) => {
          this.data.testimonials[idx].author = e.target.value;
        });

        roleInput?.addEventListener('input', (e: any) => {
          this.data.testimonials[idx].role = e.target.value;
        });

        textarea?.addEventListener('input', (e: any) => {
          this.data.testimonials[idx].quote = e.target.value;
        });

        card.querySelector('.btn-select-avatar')?.addEventListener('click', () => {
          if (this.config.onSelectImage) {
            this.config.onSelectImage((url: string) => {
              this.data.testimonials[idx].avatar = url;
              rebuild();
            });
          } else {
            const url = prompt('Enter reviewer avatar image URL:');
            if (url !== null) {
              this.data.testimonials[idx].avatar = url;
              rebuild();
            }
          }
        });

        card.querySelector('.btn-remove-avatar')?.addEventListener('click', () => {
          this.data.testimonials[idx].avatar = '';
          rebuild();
        });

        card.querySelector('.btn-remove-test')?.addEventListener('click', () => {
          this.data.testimonials.splice(idx, 1);
          rebuild();
        });

        grid.appendChild(card);
      });

      container.appendChild(grid);

      // Actions section
      const actions = document.createElement('div');
      actions.className = 'flex items-center justify-end pt-2';

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className =
        'px-3 py-1.5 text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white rounded-lg flex items-center gap-1.5 transition-all shadow-sm';
      addBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Review Card
      `;
      addBtn.addEventListener('click', () => {
        this.data.testimonials.push({ author: '', role: '', quote: '', avatar: '' });
        rebuild();
      });

      actions.appendChild(addBtn);
      container.appendChild(actions);
    };

    rebuild();
    return container;
  }

  save() {
    return this.data;
  }
}

export class FaqBlockTool {
  api: any;
  readOnly: boolean;
  data: any;

  constructor({ data, api, readOnly }: any) {
    this.api = api;
    this.readOnly = readOnly;
    this.data = {
      sectionTitle: data.sectionTitle || '',
      faqs: data.faqs || [
        { question: '', answer: '' },
        { question: '', answer: '' },
        { question: '', answer: '' },
      ],
    };
  }

  static get toolbox() {
    return {
      title: 'FAQ Accordion',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    };
  }

  render() {
    const container = document.createElement('div');
    container.className =
      'p-6 border border-amber-100 dark:border-navy-700 bg-amber-50/10 dark:bg-navy-950/20 rounded-3xl space-y-4';

    const rebuild = () => {
      container.innerHTML = '';

      // Header row
      const headerDiv = document.createElement('div');
      headerDiv.className =
        'flex items-center justify-between text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-2';
      headerDiv.innerHTML = `
        <span>❓ FAQ Accordion Block</span>
        <span class="text-[10px] text-gray-400 dark:text-gray-500 font-normal">(${this.data.faqs.length} Questions)</span>
      `;
      container.appendChild(headerDiv);

      // Section Title field
      const titleWrapper = document.createElement('div');
      titleWrapper.innerHTML = `
        <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Section Title</label>
        <input type="text" class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-amber-500 mb-4" placeholder="e.g. Frequently Asked Questions" value="${this.data.sectionTitle}" id="faq-section-title"/>
      `;
      container.appendChild(titleWrapper);

      titleWrapper.querySelector('#faq-section-title')?.addEventListener('input', (e: any) => {
        this.data.sectionTitle = e.target.value;
      });

      // List of FAQ Items
      const list = document.createElement('div');
      list.className = 'space-y-3';

      this.data.faqs.forEach((faq: any, idx: number) => {
        const item = document.createElement('div');
        item.className =
          'p-3.5 border border-gray-150 dark:border-navy-700 rounded-2xl bg-white dark:bg-navy-900 space-y-2 relative group/faq-item';
        item.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-amber-500 dark:text-amber-400 block">Question #${idx + 1}</span>
            <button type="button" class="btn-remove-faq text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all" data-idx="${idx}" title="Remove Question">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <input type="text" class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-amber-500 font-bold" placeholder="Question Text" value="${faq.question || ''}"/>
          <textarea class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-amber-500" placeholder="Answer Explanation..." rows="2">${faq.answer || ''}</textarea>
        `;

        item.querySelector('input')?.addEventListener('input', (e: any) => {
          this.data.faqs[idx].question = e.target.value;
        });

        item.querySelector('textarea')?.addEventListener('input', (e: any) => {
          this.data.faqs[idx].answer = e.target.value;
        });

        item.querySelector('.btn-remove-faq')?.addEventListener('click', () => {
          this.data.faqs.splice(idx, 1);
          rebuild();
        });

        list.appendChild(item);
      });

      container.appendChild(list);

      // Actions section
      const actions = document.createElement('div');
      actions.className = 'flex items-center justify-end pt-2';

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className =
        'px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-1.5 transition-all shadow-sm';
      addBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add FAQ Item
      `;
      addBtn.addEventListener('click', () => {
        this.data.faqs.push({ question: '', answer: '' });
        rebuild();
      });

      actions.appendChild(addBtn);
      container.appendChild(actions);
    };

    rebuild();
    return container;
  }

  save() {
    return this.data;
  }
}

export class RichTextBlockTool {
  api: any;
  readOnly: boolean;
  data: any;

  constructor({ data, api, readOnly }: any) {
    this.api = api;
    this.readOnly = readOnly;
    this.data = {
      content: data.content || '',
    };
  }

  static get toolbox() {
    return {
      title: 'Rich Content Block',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    };
  }

  render() {
    const container = document.createElement('div');
    container.className =
      'p-6 border border-gray-100 dark:border-navy-700 bg-gray-50/10 dark:bg-navy-950/20 rounded-3xl space-y-4';

    container.innerHTML = `
      <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">
        📄 Rich Text Section Block
      </div>
      <div>
        <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Body Text / HTML</label>
        <textarea class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-transparent dark:text-white focus:outline-hidden focus:border-brand-500 font-mono" placeholder="Enter rich textual or custom HTML description segments here..." rows="6" id="rich-content">${
          this.data.content
        }</textarea>
      </div>
    `;

    container.querySelector('#rich-content')?.addEventListener('input', (e: any) => {
      this.data.content = e.target.value;
    });

    return container;
  }

  save() {
    return this.data;
  }
}
