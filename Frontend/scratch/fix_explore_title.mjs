import fs from 'fs';
const filePath = 'Frontend/src/pages/Home/ExploreShowcase.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const searchStr = '<span>Disc</span>';
if (!content.includes(searchStr)) {
  console.error('Target string not found');
  process.exit(1);
}

const beforeH2 = content.slice(0, content.indexOf('<h2 className="text-2xl sm:text-4xl lg:text-[2.6vw]'));
const afterH2 = content.slice(content.indexOf('</h2>') + '</h2>'.length);

const isCRLF = content.includes('\r\n');
const eol = isCRLF ? '\r\n' : '\n';

const replacementH2 = [
  '<h2 className="text-2xl sm:text-4xl lg:text-[2.6vw] font-bold text-[#0D0F11] tracking-tight inline-flex items-baseline justify-center flex-wrap gap-x-2">',
  '          {/* Keep Discover as a single unbreakable word on all screen sizes */}',
  '          <span className="inline-flex items-baseline whitespace-nowrap">',
  '            <span>Disc</span>',
  '            <span className="inline-flex self-center items-center justify-center text-[#EC5137] mx-[0.02em] translate-y-[0.05em]">',
  '              <Icon icon="weui:discover-outlined" className="w-[0.8em] h-[0.8em]" />',
  '            </span>',
  '            <span>ver.</span>',
  '          </span>',
  '          <span className="whitespace-nowrap">Read.</span>',
  '          <span className="whitespace-nowrap">Get Inspired</span>',
  '        </h2>'
].join(eol);

const newContent = beforeH2 + replacementH2 + afterH2;
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully updated Explore title!');

