const fs = require('fs');
let remote = fs.readFileSync('remote_superadmin.tsx', 'utf-8');
let local = fs.readFileSync('src/pages/SuperAdminPage.tsx', 'utf-8');

function extractFunc(source, name) {
  const start = source.indexOf('function ' + name + '(');
  if (start === -1) {
    const exportStart = source.indexOf('export function ' + name + '(');
    if (exportStart === -1) return null;
    return extractFuncBody(source, exportStart);
  }
  return extractFuncBody(source, start);
}

function extractFuncBody(source, start) {
  let braces = 0;
  let end = -1;
  for (let i = start; i < source.length; i++) {
    if (source[i] === '{') braces++;
    if (source[i] === '}') {
      braces--;
      if (braces === 0) {
        end = i + 1;
        break;
      }
    }
  }
  return source.substring(start, end);
}

const oRemote = extractFunc(remote, 'OrderApprovalSection');
const nRemote = extractFunc(remote, 'NotificationsSection');

if (oRemote && nRemote) {
  const oLocal = extractFunc(local, 'OrderApprovalSection');
  const nLocal = extractFunc(local, 'NotificationsSection');
  
  if (oLocal && nLocal) {
    local = local.replace(oLocal, oRemote);
    local = local.replace(nLocal, nRemote);
    
    if (!local.includes('OrderDocumentModal')) {
      local = local.replace('import { AlertCircle', 'import { OrderDocumentModal } from "./EmployeePage";\nimport { AlertCircle');
    }
    
    fs.writeFileSync('src/pages/SuperAdminPage.tsx', local);
    console.log('Successfully replaced functions and added import.');
  } else {
    console.log('Could not find local functions.');
  }
} else {
  console.log('Could not find remote functions.');
}
