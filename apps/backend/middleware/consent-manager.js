/**
 * 📋 Consent Management Service
 * PDPA (Personal Data Protection Act) Compliant
 * 
 * Features:
 * - Granular consent categories
 * - Version tracking
 * - Easy withdrawal
 * - Audit trail integration
 */

const { PrismaClient } = require('@prisma/client');
const { auditLogger, AuditCategory } = require('./audit-logger');

// Consent Categories per PDPA
const ConsentCategory = {
    // Required for service (cannot withdraw)
    TERMS_OF_SERVICE: 'TERMS_OF_SERVICE',
    PRIVACY_POLICY: 'PRIVACY_POLICY',

    // Optional (can withdraw anytime)
    MARKETING_EMAIL: 'MARKETING_EMAIL',
    MARKETING_SMS: 'MARKETING_SMS',
    DATA_ANALYTICS: 'DATA_ANALYTICS',
    THIRD_PARTY_SHARING: 'THIRD_PARTY_SHARING',
    LOCATION_TRACKING: 'LOCATION_TRACKING',
};

// Current versions of consent documents
const ConsentVersions = {
    TERMS_OF_SERVICE: '1.0.0',
    PRIVACY_POLICY: '1.0.0',
    MARKETING_EMAIL: '1.0.0',
    MARKETING_SMS: '1.0.0',
    DATA_ANALYTICS: '1.0.0',
    THIRD_PARTY_SHARING: '1.0.0',
    LOCATION_TRACKING: '1.0.0',
};

// Required consents (cannot use service without)
const RequiredConsents = [
    ConsentCategory.TERMS_OF_SERVICE,
    ConsentCategory.PRIVACY_POLICY,
];

class ConsentManager {
    constructor() {
        this.prisma = new PrismaClient();
    }

    /**
     * Record user consent
     */
    async recordConsent(userId, category, granted, ipAddress, userAgent, metadata = {}) {
        const version = ConsentVersions[category] || '1.0.0';

        // Check if consent already exists
        const existing = await this.prisma.userConsent.findFirst({
            where: { userId, category }
        });

        let consent;
        if (existing) {
            // Update existing consent
            consent = await this.prisma.userConsent.update({
                where: { id: existing.id },
                data: {
                    granted,
                    version,
                    grantedAt: granted ? new Date() : null,
                    withdrawnAt: !granted ? new Date() : null,
                    ipAddress,
                    userAgent,
                    metadata: JSON.stringify(metadata),
                    updatedAt: new Date(),
                }
            });
        } else {
            // Create new consent record
            consent = await this.prisma.userConsent.create({
                data: {
                    userId,
                    category,
                    granted,
                    version,
                    grantedAt: granted ? new Date() : null,
                    withdrawnAt: !granted ? new Date() : null,
                    ipAddress,
                    userAgent: userAgent?.substring(0, 500),
                    metadata: JSON.stringify(metadata),
                }
            });
        }

        // Log consent event
        await auditLogger.log({
            category: AuditCategory.SECURITY,
            action: granted ? 'CONSENT_GRANTED' : 'CONSENT_WITHDRAWN',
            actorId: userId,
            actorRole: 'FARMER',
            resourceType: 'CONSENT',
            resourceId: consent.id,
            ipAddress,
            userAgent,
            metadata: { consentCategory: category, version }
        });

        return consent;
    }

    /**
     * Record multiple consents at once (registration)
     */
    async recordBulkConsent(userId, consents, ipAddress, userAgent) {
        const results = [];

        for (const { category, granted } of consents) {
            const result = await this.recordConsent(
                userId, category, granted, ipAddress, userAgent
            );
            results.push(result);
        }

        return results;
    }

    /**
     * Check if user has all required consents
     */
    async hasRequiredConsents(userId) {
        const consents = await this.prisma.userConsent.findMany({
            where: {
                userId,
                category: { in: RequiredConsents },
                granted: true
            }
        });

        const grantedCategories = new Set(consents.map(c => c.category));
        return RequiredConsents.every(cat => grantedCategories.has(cat));
    }

    /**
     * Get all user consents
     */
    async getUserConsents(userId) {
        const consents = await this.prisma.userConsent.findMany({
            where: { userId },
            orderBy: { category: 'asc' }
        });

        // Build consent status object
        const status = {};
        for (const category of Object.values(ConsentCategory)) {
            const consent = consents.find(c => c.category === category);
            status[category] = {
                granted: consent?.granted || false,
                version: consent?.version || null,
                grantedAt: consent?.grantedAt || null,
                withdrawnAt: consent?.withdrawnAt || null,
                required: RequiredConsents.includes(category),
            };
        }

        return status;
    }

    /**
     * Withdraw consent (PDPA right)
     */
    async withdrawConsent(userId, category, ipAddress, userAgent) {
        // Cannot withdraw required consents
        if (RequiredConsents.includes(category)) {
            throw new Error('Cannot withdraw required consent. Please delete your account instead.');
        }

        return this.recordConsent(userId, category, false, ipAddress, userAgent, {
            withdrawalReason: 'USER_REQUEST'
        });
    }

    /**
     * Get consent document content
     */
    getConsentDocument(category, language = 'th') {
        const documents = {
            TERMS_OF_SERVICE: {
                th: {
                    title: 'ข้อกำหนดและเงื่อนไขการใช้บริการ',
                    summary: 'เงื่อนไขการใช้งานระบบรับรองมาตรฐาน GACP',
                    url: '/legal/terms-of-service',
                },
                en: {
                    title: 'Terms of Service',
                    summary: 'Terms for using GACP Certification System',
                    url: '/legal/terms-of-service',
                }
            },
            PRIVACY_POLICY: {
                th: {
                    title: 'นโยบายความเป็นส่วนตัว',
                    summary: 'การเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล',
                    url: '/legal/privacy-policy',
                },
                en: {
                    title: 'Privacy Policy',
                    summary: 'Collection, use, and disclosure of personal data under PDPA',
                    url: '/legal/privacy-policy',
                }
            },
            MARKETING_EMAIL: {
                th: {
                    title: 'รับข่าวสารทางอีเมล',
                    summary: 'รับข้อมูลข่าวสาร โปรโมชั่น และการแจ้งเตือนทางอีเมล',
                },
                en: {
                    title: 'Email Marketing',
                    summary: 'Receive news, promotions, and notifications via email',
                }
            },
            MARKETING_SMS: {
                th: {
                    title: 'รับข่าวสารทาง SMS',
                    summary: 'รับการแจ้งเตือนและข่าวสารทาง SMS',
                },
                en: {
                    title: 'SMS Marketing',
                    summary: 'Receive notifications and news via SMS',
                }
            },
            DATA_ANALYTICS: {
                th: {
                    title: 'การวิเคราะห์ข้อมูล',
                    summary: 'อนุญาตให้ใช้ข้อมูลเพื่อปรับปรุงบริการ',
                },
                en: {
                    title: 'Data Analytics',
                    summary: 'Allow data usage for service improvement',
                }
            },
        };

        return documents[category]?.[language] || documents[category]?.th || null;
    }

    /**
     * Close Prisma connection
     */
    async disconnect() {
        await this.prisma.$disconnect();
    }
}

// Singleton instance
const consentManager = new ConsentManager();

module.exports = {
    consentManager,
    ConsentCategory,
    ConsentVersions,
    RequiredConsents,
};
