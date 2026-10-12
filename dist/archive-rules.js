(function attachArchiveRules(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SilkArchiveRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createArchiveRules() {
  const documentTypes = Object.freeze({
    CTR: '合同', PO: '采购订单', PI: '形式发票', CI: '商业发票', PL: '装箱单', BL: '海运提单',
    COO: '原产地证', CD: '报关单', QC: '检验报告', GRN: '入库单', POD: '签收证明', PAY: '付款凭证'
  });
  const stages = Object.freeze({ PROC: '采购', WHS: '仓储', LOG: '运输', CUS: '报关', DLV: '交付', FIN: '结算' });
  const retentionLabels = Object.freeze({ Y: '永久', D30: '定期30年', D10: '定期10年' });

  function segment(value, fallback, length = 20) {
    const clean = String(value || '').normalize('NFKC').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, length);
    return clean || fallback;
  }
  function digits(value, fallback, length) {
    return String(value || '').replace(/\D/g, '').slice(-length).padStart(length, '0') || fallback;
  }
  function normalizeDate(value) {
    const raw = String(value || '').replace(/\D/g, '');
    return /^20\d{6}$/.test(raw) ? raw : new Date().toISOString().slice(0, 10).replace(/-/g, '');
  }
  function buildArchiveRecord(input = {}) {
    const enterprise = segment(input.enterprise, 'SCG', 8);
    const fonds = segment(input.fonds, 'A001', 8);
    const project = segment(input.project, 'BR2026', 16);
    const category = segment(input.category, 'ZY', 4);
    const subcategory = segment(input.subcategory, 'GJGYL', 12);
    const year = /^20\d{2}$/.test(String(input.year)) ? String(input.year) : String(new Date().getFullYear());
    const retention = retentionLabels[input.retention] ? input.retention : 'D10';
    const stage = stages[input.stage] ? input.stage : 'PROC';
    const documentType = documentTypes[input.documentType] ? input.documentType : 'PO';
    const sequence = digits(input.sequence, '0001', 4);
    const version = `V${digits(input.version, '01', 2)}`;
    const language = segment(input.language, 'ZH', 4);
    const date = normalizeDate(input.date);
    const extension = segment(input.extension, 'PDF', 6).toLowerCase();
    const archiveNumber = `${fonds}-${category}·${subcategory}·${year}·${retention}-${stage}-${sequence}`;
    const fileName = `${enterprise}-${project}-${stage}-${documentType}-${date}-${sequence}-${version}-${language}.${extension}`;
    const title = `${stages[stage]}-${documentTypes[documentType]}`;
    return Object.freeze({
      archiveNumber, fileName, title, enterprise, fonds, project, category, subcategory, year, retention,
      retentionLabel: retentionLabels[retention], stage, stageLabel: stages[stage], documentType,
      documentTypeLabel: documentTypes[documentType], sequence, version, language, date, extension,
      paperLabel: `档号：${archiveNumber}\n业务项目：${project}\n文件名称：${title}\n保管期限：${retentionLabels[retention]}\n电子文件：${fileName}`
    });
  }
  function csv(records) {
    const header = ['档号', '电子文件名', '文件名称', '项目号', '业务环节', '单证类型', '形成日期', '保管期限', '版本', '语种'];
    const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    return [header, ...records.map(item => [item.archiveNumber, item.fileName, item.title, item.project, item.stageLabel, item.documentTypeLabel, item.date, item.retentionLabel, item.version, item.language])].map(row => row.map(quote).join(',')).join('\r\n');
  }
  return Object.freeze({ documentTypes, stages, retentionLabels, buildArchiveRecord, csv });
});
