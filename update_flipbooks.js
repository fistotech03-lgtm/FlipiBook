const fs = require('fs');
const filePath = 'D:/FlipiBook/Frontend/src/pages/MyFlipbooks.jsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("dashboardMode === 'shelf'")) {
    console.log('Found shelf mode at line ' + (i + 1));
    lines[i + 1] = '                    <div className="flex-1 w-full h-full overflow-hidden min-h-0 bg-[#f7f8fa] rounded-[1vw] shadow-xs flex flex-col">';
    break;
  }
}

fs.writeFileSync(filePath, lines.join('\r\n'), 'utf8');
console.log('MyFlipbooks updated successfully');

