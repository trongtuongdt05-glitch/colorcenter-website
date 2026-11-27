import { crc32 } from 'node:zlib';

function zip(files: Record<string, string>) {
  const contents: Buffer[] = [];
  const directory: Buffer[] = [];
  let offset = 0;
  for (const [path, xml] of Object.entries(files)) {
    const name = Buffer.from(path);
    const bytes = Buffer.from(xml);
    const checksum = crc32(bytes);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(bytes.length, 18);
    local.writeUInt32LE(bytes.length, 22);
    local.writeUInt16LE(name.length, 26);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50);
    entry.writeUInt16LE(20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt32LE(checksum, 16);
    entry.writeUInt32LE(bytes.length, 20);
    entry.writeUInt32LE(bytes.length, 24);
    entry.writeUInt16LE(name.length, 28);
    entry.writeUInt32LE(offset, 42);
    contents.push(local, name, bytes);
    directory.push(entry, name);
    offset += local.length + name.length + bytes.length;
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(directory.length / 2, 8);
  end.writeUInt16LE(directory.length / 2, 10);
  end.writeUInt32LE(directory.reduce((total, part) => total + part.length, 0), 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...contents, ...directory, end]);
}

const spreadsheet = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const relationships = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const packageRelationships = 'http://schemas.openxmlformats.org/package/2006/relationships';

function xmlText(value: string) {
  return value.replace(/[^\u0009\u000a\u000d\u0020-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/gu, '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

export function workbook(rows: string[][]) {
  // Inline strings preserve leading zeroes in phone numbers and keep notes as text.
  const sheet = rows.map((row, index) => `<row r="${index + 1}">${row.map((value, col) =>
    `<c r="${String.fromCharCode(65 + col)}${index + 1}" t="inlineStr"><is><t xml:space="preserve">${xmlText(value)}</t></is></c>`).join('')}</row>`).join('');
  return zip({
    '[Content_Types].xml': '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    '_rels/.rels': `<Relationships xmlns="${packageRelationships}"><Relationship Id="rId1" Type="${relationships}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    'xl/workbook.xml': `<workbook xmlns="${spreadsheet}" xmlns:r="${relationships}"><sheets><sheet name="Lead - Khách hàng" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    'xl/_rels/workbook.xml.rels': `<Relationships xmlns="${packageRelationships}"><Relationship Id="rId1" Type="${relationships}/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
    'xl/worksheets/sheet1.xml': `<worksheet xmlns="${spreadsheet}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="32" customWidth="1"/><col min="2" max="2" width="17" customWidth="1"/><col min="3" max="3" width="27" customWidth="1"/><col min="4" max="4" width="48" customWidth="1"/><col min="5" max="5" width="19" customWidth="1"/></cols><sheetData>${sheet}</sheetData><autoFilter ref="A1:E${rows.length}"/></worksheet>`,
  });
}
