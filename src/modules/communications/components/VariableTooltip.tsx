'use client';

import React from 'react';
import { Copy, Sparkles, Code2 } from 'lucide-react';
import toast from 'react-hot-toast';

export interface VariableMeta {
  name: string;
  type: string;
  syntax: string;
  description: string;
  sample: string;
  isLoop?: boolean;
  loopSnippet?: string;
  badgeStyle: string;
}

export interface SchemaVariableRef {
  field: string;
  type: string;
  description: string;
  isRelation?: boolean;
}

/**
 * Returns rich metadata for any variable (including nomination arrays,
 * tables, lists, and schema fields) to display in the hover tooltip.
 */
export const getVariableMetadata = (
  rawName: string,
  schemaVariables?: SchemaVariableRef[],
): VariableMeta => {
  // Strip params. if included
  const name = rawName.replace(/^params\./, '').trim();
  const key = name.toLowerCase();

  // 1. Array of Nominees (Loop)
  if (key === 'nominees') {
    return {
      name,
      type: 'Array<Nominee>',
      syntax: '{{#each params.nominees}}',
      description:
        'Array of all nominee candidates submitted in this request. Loop through this array to render custom table rows or lists.',
      sample: `[\n  { "index": 1, "name": "Jane Smith", "company": "Infosys", "category": "CIO of the Year", "email": "jane@infosys.com", "phone": "9876543210" },\n  { "index": 2, "name": "Robert Chen", "company": "Tata Consultancy", "category": "Cloud Innovation", "email": "robert@tcs.com", "phone": "9876543211" }\n]`,
      isLoop: true,
      loopSnippet: `{{#each params.nominees}}\n  <tr>\n    <td>{{index}}</td>\n    <td><strong>{{name}}</strong><br/><small>{{email}}</small></td>\n    <td>{{company}}</td>\n    <td>{{category}}</td>\n  </tr>\n{{/each}}`,
      badgeStyle: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
    };
  }

  // 2. Pre-rendered HTML Table
  if (key === 'nomineestable' || key.includes('nomineestable')) {
    return {
      name,
      type: 'HTML Table',
      syntax: '{{params.nomineesTable}}',
      description:
        'Drop-in, mobile-responsive HTML table containing all nominees with 6 columns (#, Nominee Name, Company, Category, Email, Phone).',
      sample: `<table border="0" cellpadding="10" style="width:100%; border-collapse:collapse; font-family:sans-serif;">\n  <thead>\n    <tr style="background:#0f172a; color:#fff;">\n      <th>#</th><th>Nominee Name</th><th>Company</th><th>Category</th><th>Email</th><th>Phone</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr><td>1</td><td>Jane Smith</td><td>Infosys</td><td>CIO of the Year</td><td>jane@infosys.com</td><td>9876543210</td></tr>\n    <tr><td>2</td><td>Robert Chen</td><td>TCS</td><td>Cloud Innovation</td><td>robert@tcs.com</td><td>9876543211</td></tr>\n  </tbody>\n</table>`,
      badgeStyle: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    };
  }

  // 3. Pre-rendered HTML List
  if (key === 'nomineeslist' || key.includes('nomineeslist')) {
    return {
      name,
      type: 'HTML List',
      syntax: '{{params.nomineesList}}',
      description:
        'Drop-in styled bulleted HTML list of all nominees with their category, company, and contact details.',
      sample: `<ul style="font-family:sans-serif; line-height:1.6;">\n  <li><strong>#1: Jane Smith</strong> (Infosys) &mdash; Category: CIO of the Year &bull; jane@infosys.com</li>\n  <li><strong>#2: Robert Chen</strong> (Tata Consultancy) &mdash; Category: Cloud Innovation &bull; robert@tcs.com</li>\n</ul>`,
      badgeStyle: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    };
  }

  // 4. Comma-Separated Aggregate Strings
  if (key === 'nomineenames') {
    return {
      name,
      type: 'String (CSV)',
      syntax: '{{params.nomineeNames}}',
      description: 'Comma-separated string of all nominee full names.',
      sample: '"Jane Smith, Robert Chen"',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    };
  }
  if (key === 'nomineecompanies') {
    return {
      name,
      type: 'String (CSV)',
      syntax: '{{params.nomineeCompanies}}',
      description: 'Comma-separated string of all nominee company or organization names.',
      sample: '"Infosys, Tata Consultancy Services"',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    };
  }
  if (key === 'nomineecategories') {
    return {
      name,
      type: 'String (CSV)',
      syntax: '{{params.nomineeCategories}}',
      description: 'Comma-separated string of all nominated award categories.',
      sample: '"CIO of the Year, Cloud Innovation Award"',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    };
  }
  if (key === 'nomineeemails') {
    return {
      name,
      type: 'String (CSV)',
      syntax: '{{params.nomineeEmails}}',
      description: 'Comma-separated string of all nominee email addresses.',
      sample: '"jane@infosys.com, robert@tcs.com"',
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    };
  }
  if (key === 'nomineephones') {
    return {
      name,
      type: 'String (CSV)',
      syntax: '{{params.nomineePhones}}',
      description: 'Comma-separated string of all nominee contact telephone numbers.',
      sample: '"9876543210, 9876543211"',
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    };
  }
  if (key === 'nomineedetails') {
    return {
      name,
      type: 'String (Multiline)',
      syntax: '{{params.nomineeDetails}}',
      description: 'Formatted multi-line plain text summary of all nominees.',
      sample:
        '"1. Jane Smith (Infosys) - CIO of the Year\n2. Robert Chen (TCS) - Cloud Innovation"',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    };
  }
  if (key === 'totalnominees') {
    return {
      name,
      type: 'Number',
      syntax: '{{params.totalNominees}}',
      description: 'Total number of nominees submitted in this request.',
      sample: '2',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    };
  }

  // 5. Nominator & Event Variables
  if (key === 'nominatorname') {
    return {
      name,
      type: 'String',
      syntax: '{{params.nominatorName}}',
      description: 'Full name of the nominator who submitted the nomination entry.',
      sample: '"John Doe"',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    };
  }
  if (key === 'nominatoremail') {
    return {
      name,
      type: 'Email (String)',
      syntax: '{{params.nominatorEmail}}',
      description: 'Email address of the nominator.',
      sample: '"john.doe@example.com"',
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    };
  }
  if (key === 'nominatorphone') {
    return {
      name,
      type: 'Phone (String)',
      syntax: '{{params.nominatorPhone}}',
      description: 'Phone number of the nominator.',
      sample: '"+91 9876543200"',
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    };
  }
  if (key === 'nominatorcompany' || key === 'nominatororganization') {
    return {
      name,
      type: 'String',
      syntax: '{{params.nominatorCompany}}',
      description: 'Company or organization of the nominator.',
      sample: '"Acme Corporation"',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    };
  }
  if (key === 'eventname') {
    return {
      name,
      type: 'String',
      syntax: '{{params.eventName}}',
      description: 'Name of the event or award program.',
      sample: '"Core Media Annual Leadership Awards 2026"',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    };
  }
  if (key === 'eventdate') {
    return {
      name,
      type: 'Date',
      syntax: '{{params.eventDate}}',
      description: 'Scheduled date of the event or award ceremony.',
      sample: '"November 20, 2026"',
      badgeStyle: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
    };
  }
  if (key === 'eventlocation') {
    return {
      name,
      type: 'String',
      syntax: '{{params.eventLocation}}',
      description: 'Venue location or online meeting link for the event.',
      sample: '"Grand Ballroom, Hotel Trident, Mumbai"',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    };
  }

  // 6. Individual Nominee Variables (personalized when emailing an individual nominee)
  if (key === 'nomineename') {
    return {
      name,
      type: 'String',
      syntax: '{{params.nomineeName}}',
      description: 'Full name of the specific nominee receiving this email.',
      sample: '"Jane Smith"',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    };
  }
  if (key === 'nomineecategory' || key === 'category' || key === 'categoryname') {
    return {
      name,
      type: 'String',
      syntax: `{{params.${name}}}`,
      description:
        'Award category in which the nominee is nominated (e.g. CIO of the Year, Cloud Innovation). Also available as {{category}} inside loops.',
      sample: '"CIO of the Year"',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    };
  }
  if (key === 'subcategory' || key === 'nomineesubcategory' || key === 'subcategoryname') {
    return {
      name,
      type: 'String',
      syntax: `{{params.${name}}}`,
      description:
        'Award sub-category in which the nominee is nominated. Also available as {{subCategory}} inside loops.',
      sample: '"Cloud & Infrastructure"',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    };
  }
  if (key === 'nomineecompany') {
    return {
      name,
      type: 'String',
      syntax: '{{params.nomineeCompany}}',
      description: 'Company or organization of the specific nominee.',
      sample: '"Infosys"',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    };
  }
  if (key === 'nomineeemail') {
    return {
      name,
      type: 'Email (String)',
      syntax: '{{params.nomineeEmail}}',
      description: 'Email address of the specific nominee.',
      sample: '"jane@infosys.com"',
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    };
  }
  if (key === 'nomineephone') {
    return {
      name,
      type: 'Phone (String)',
      syntax: '{{params.nomineePhone}}',
      description: 'Contact telephone number of the specific nominee.',
      sample: '"+91 9876543210"',
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    };
  }

  // 7. General Auth / Verification variables
  if (key.includes('otp') || key.includes('code')) {
    return {
      name,
      type: 'Number / Code',
      syntax: `{{params.${name}}}`,
      description: 'One-time passcode for verification or login authentication.',
      sample: '"489201"',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    };
  }
  if (key.includes('url') || key.includes('link') || key.includes('href')) {
    return {
      name,
      type: 'URL (String)',
      syntax: `{{params.${name}}}`,
      description: 'Action link or verification URL.',
      sample: '"https://coremedia.com/verify?token=abc123xyz"',
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    };
  }

  // 8. Match against discovered database schema variables if provided
  if (schemaVariables && schemaVariables.length > 0) {
    const schemaMatch = schemaVariables.find(
      (sv) => sv.field === name || sv.field.toLowerCase() === key || sv.field.endsWith(`.${name}`),
    );
    if (schemaMatch) {
      const isArrayType = schemaMatch.description?.toLowerCase().includes('array');
      let typeLabel = schemaMatch.type || 'String';
      if (isArrayType && !typeLabel.toLowerCase().includes('array')) {
        typeLabel = `Array<${typeLabel}>`;
      }

      let badgeStyle = 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
      if (isArrayType) badgeStyle = 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
      else if (typeLabel.toLowerCase() === 'number')
        badgeStyle = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
      else if (typeLabel.toLowerCase() === 'date')
        badgeStyle = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
      else if (typeLabel.toLowerCase() === 'boolean')
        badgeStyle = 'bg-pink-500/20 text-pink-300 border border-pink-500/40';

      return {
        name,
        type: typeLabel,
        syntax: isArrayType ? `{{#each params.${name}}}` : `{{params.${name}}}`,
        description: schemaMatch.description || `Field from database schema`,
        sample: isArrayType
          ? `[ { "${name}": "Sample value 1" }, { "${name}": "Sample value 2" } ]`
          : `"[${schemaMatch.type || 'Value'} of ${name}]"`,
        isLoop: isArrayType,
        loopSnippet: isArrayType ? `{{#each params.${name}}}\n  {{this}}\n{{/each}}` : undefined,
        badgeStyle,
      };
    }
  }

  // 9. Heuristic Fallbacks based on naming patterns
  if (key.endsWith('table')) {
    return {
      name,
      type: 'HTML Table',
      syntax: `{{params.${name}}}`,
      description: 'Pre-rendered HTML table component.',
      sample: '<table border="1" style="width:100%">...</table>',
      badgeStyle: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    };
  }
  if (key.endsWith('list')) {
    return {
      name,
      type: 'HTML List',
      syntax: `{{params.${name}}}`,
      description: 'Pre-rendered HTML list component.',
      sample: '<ul><li>Item 1</li><li>Item 2</li></ul>',
      badgeStyle: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    };
  }
  if (key.includes('email')) {
    return {
      name,
      type: 'Email (String)',
      syntax: `{{params.${name}}}`,
      description: 'Email address string.',
      sample: '"user@example.com"',
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    };
  }
  if (key.includes('phone') || key.includes('mobile')) {
    return {
      name,
      type: 'Phone (String)',
      syntax: `{{params.${name}}}`,
      description: 'Contact telephone number string.',
      sample: '"+1 (555) 019-2834"',
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    };
  }
  if (key.includes('date') || key.includes('time') || key.includes('at')) {
    return {
      name,
      type: 'Date / Timestamp',
      syntax: `{{params.${name}}}`,
      description: 'Formatted date or ISO timestamp.',
      sample: '"2026-09-07T14:30:00Z"',
      badgeStyle: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
    };
  }
  if (
    key.includes('count') ||
    key.includes('total') ||
    key.includes('amount') ||
    key.includes('index')
  ) {
    return {
      name,
      type: 'Number',
      syntax: `{{params.${name}}}`,
      description: 'Numeric value.',
      sample: '42',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    };
  }
  if (key.startsWith('is') || key.startsWith('has')) {
    return {
      name,
      type: 'Boolean',
      syntax: `{{params.${name}}}`,
      description: 'Boolean flag (true/false).',
      sample: 'true',
      badgeStyle: 'bg-pink-500/20 text-pink-300 border border-pink-500/40',
    };
  }

  // Default String
  return {
    name,
    type: 'String',
    syntax: `{{params.${name}}}`,
    description: `Dynamic string variable replaced by data.params.${name}.`,
    sample: `"[Sample ${name}]"`,
    badgeStyle: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
  };
};

/**
 * Floating tooltip rendered strictly ABOVE the target variable chip.
 */
export const VariableTooltipCard: React.FC<{
  meta: VariableMeta;
}> = ({ meta }) => {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:flex flex-col items-center z-[100] pointer-events-none w-72 sm:w-80 animate-fade-in">
      <div className="bg-gray-900/95 dark:bg-navy-950/95 text-white p-3.5 rounded-2xl shadow-2xl border border-gray-700/80 dark:border-navy-700/80 backdrop-blur-md w-full text-left space-y-2.5">
        {/* Top row: variable name & input type badge */}
        <div className="flex items-center justify-between gap-2 border-b border-gray-800 dark:border-navy-800 pb-2">
          <span className="font-mono text-xs font-bold text-brand-300 truncate tracking-tight">
            {meta.syntax}
          </span>
          <span
            className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md shrink-0 ${meta.badgeStyle}`}
          >
            {meta.type}
          </span>
        </div>

        {/* Description */}
        {meta.description && (
          <p className="text-[11px] text-gray-300 leading-relaxed font-sans">{meta.description}</p>
        )}

        {/* Expected response value preview */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            <span>Expected Response Value:</span>
            <span className="text-gray-500 font-normal lowercase">sample</span>
          </div>
          <div className="bg-black/60 dark:bg-black/80 rounded-xl p-2.5 font-mono text-[11px] text-emerald-400 border border-white/10 break-all max-h-24 overflow-y-auto leading-tight select-all">
            {meta.sample}
          </div>
        </div>

        {/* Loop snippet hint if variable is an array */}
        {meta.isLoop && meta.loopSnippet && (
          <div className="space-y-1 pt-1 border-t border-gray-800/80">
            <div className="flex items-center gap-1 text-[10px] text-purple-300 font-semibold uppercase tracking-wider">
              <Code2 size={11} />
              <span>Recommended Loop Syntax:</span>
            </div>
            <pre className="bg-purple-950/40 rounded-lg p-2 font-mono text-[10px] text-purple-200 border border-purple-800/40 overflow-x-auto leading-tight">
              {meta.loopSnippet}
            </pre>
          </div>
        )}

        {/* Bottom usage hint */}
        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-800/80">
          <span className="flex items-center gap-1">
            <Sparkles size={11} className="text-brand-400" />
            Click to insert into template
          </span>
          <span className="text-brand-400 font-mono text-[9px]">params.{meta.name}</span>
        </div>
      </div>

      {/* Tooltip downward pointing arrow */}
      <div className="w-2.5 h-2.5 bg-gray-900/95 dark:bg-navy-950/95 border-r border-b border-gray-700/80 dark:border-navy-700/80 rotate-45 -mt-1.5" />
    </div>
  );
};

export interface VariableChipWithTooltipProps {
  name: string;
  schemaVariables?: SchemaVariableRef[];
  isActive?: boolean;
  onClick?: () => void;
  onCopy?: () => void;
  onRemove?: () => void;
  colorClasses?: string;
  customBadgeText?: string;
  icon?: React.ReactNode;
}

/**
 * Reusable chip component that wraps any variable with a floating tooltip
 * displayed above it on hover.
 */
export const VariableChipWithTooltip: React.FC<VariableChipWithTooltipProps> = ({
  name,
  schemaVariables,
  isActive = false,
  onClick,
  onCopy,
  onRemove,
  colorClasses,
  customBadgeText,
  icon,
}) => {
  const meta = getVariableMetadata(name, schemaVariables);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = meta.syntax;
    navigator.clipboard
      .writeText(token)
      .then(() => {
        toast.success(`Copied ${token} to clipboard`, { duration: 1800 });
      })
      .catch(() => {
        if (onCopy) onCopy();
      });
  };

  return (
    <div className="relative group inline-flex items-center">
      <button
        type="button"
        onClick={onClick}
        className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer shadow-sm ${
          colorClasses ||
          (isActive
            ? 'bg-brand-500 text-white border border-brand-600 shadow-md font-bold'
            : 'bg-white dark:bg-navy-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-navy-700 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10')
        }`}
      >
        {icon || (
          <Copy
            size={11}
            className={
              isActive ? 'text-white' : 'text-gray-400 group-hover:text-brand-500 transition-colors'
            }
          />
        )}
        <span>{name}</span>

        {/* Small inline input type pill */}
        <span
          className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-sans font-semibold shrink-0 ${
            meta.type.startsWith('Array')
              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
              : meta.type.includes('Table') || meta.type.includes('List')
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
          }`}
        >
          {meta.type.replace('<Nominee>', '[]')}
        </span>

        {customBadgeText && (
          <span className="text-[9px] bg-brand-600 px-1.5 py-0.2 rounded font-sans font-bold text-white">
            {customBadgeText}
          </span>
        )}

        {/* Copy action icon */}
        <button
          type="button"
          onClick={handleCopy}
          title={`Copy ${meta.syntax}`}
          className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded text-current opacity-70 hover:opacity-100 transition-all ml-0.5"
        >
          <Copy size={11} />
        </button>

        {/* Remove action icon if provided */}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            title={`Remove ${name}`}
            className="p-0.5 hover:bg-red-500/20 rounded text-current opacity-70 hover:opacity-100 hover:text-red-500 transition-all ml-0.5"
          >
            &times;
          </button>
        )}
      </button>

      {/* Floating tooltip strictly ABOVE the variable */}
      <VariableTooltipCard meta={meta} />
    </div>
  );
};
