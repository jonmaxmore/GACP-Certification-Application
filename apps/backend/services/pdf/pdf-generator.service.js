const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class PDFGeneratorService {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  async generatePDF(htmlContent, options = {}) {
    const browser = await this.initialize();
    const page = await browser.newPage();

    try {
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfOptions = {
        format: 'A4',
        margin: {
          top: '25mm',
          right: '25mm',
          bottom: '25mm',
          left: '25mm',
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: options.headerTemplate || '<div></div>',
        footerTemplate:
          options.footerTemplate ||
          `
          <div style="font-size: 10px; text-align: center; width: 100%; padding: 5px;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>
        `,
        ...options,
      };

      const pdfBuffer = await page.pdf(pdfOptions);
      return pdfBuffer;
    } finally {
      await page.close();
    }
  }

  async generateFromTemplate(templatePath, data, options = {}) {
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const htmlContent = this.replaceTemplateVariables(templateContent, data);
    return this.generatePDF(htmlContent, options);
  }

  replaceTemplateVariables(template, data) {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, keyPath) => {
      const value = keyPath.split('.').reduce((obj, key) => obj?.[key], data);
      return value !== undefined ? value : match;
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new PDFGeneratorService();
