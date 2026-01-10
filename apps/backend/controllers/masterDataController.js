/**
 * Master Data Controller
 * Serves system configuration and static options to frontend
 */

const getMasterData = async (req, res) => {
    try {
        const data = {
            // Soil Types
            soilTypes: [
                { id: 'LOAM', label: 'ดินร่วน', labelEN: 'Loam' },
                { id: 'CLAY', label: 'ดินเหนียว', labelEN: 'Clay' },
                { id: 'SANDY', label: 'ดินทราย', labelEN: 'Sandy' },
                { id: 'PEAT', label: 'ดินอินทรีย์', labelEN: 'Peat' },
                { id: 'OTHER', label: 'อื่นๆ', labelEN: 'Other' },
            ],
            // Water Sources
            waterSources: [
                { id: 'RAIN', label: 'น้ำฝน', labelEN: 'Rain Water' },
                { id: 'RIVER', label: 'แม่น้ำ/ลำคลอง', labelEN: 'River/Canal' },
                { id: 'WELL', label: 'น้ำบาดาล', labelEN: 'Ground Water' },
                { id: 'TAP', label: 'น้ำประปา', labelEN: 'Tap Water' },
                { id: 'IRRIGATION', label: 'ระบบชลประทาน', labelEN: 'Irrigation System' },
            ],
            // Cultivation Systems
            cultivationSystems: [
                { id: 'OUTDOOR', label: 'กลางแจ้ง', labelEN: 'Outdoor' },
                { id: 'INDOOR', label: 'ในโรงเรือน (Indoor)', labelEN: 'Indoor' },
                { id: 'GREENHOUSE', label: 'โรงเรือน (Greenhouse)', labelEN: 'Greenhouse' },
            ],
            // Plot Types (Zoning)
            plotTypes: [
                { id: 'INDOOR', label: 'โรงเรือนปิด (Indoor)', icon: '🏠' },
                { id: 'GREENHOUSE', label: 'โรงเรือน (Greenhouse)', icon: '🏡' },
                { id: 'OUTDOOR', label: 'กลางแจ้ง (Outdoor)', icon: '🌤️' },
            ],
            // Plant Parts
            plantParts: [
                { id: 'SEED', label: 'เมล็ด', labelEN: 'Seed' },
                { id: 'STEM', label: 'ลำต้น', labelEN: 'Stem' },
                { id: 'FLOWER', label: 'ช่อดอก', labelEN: 'Flower' },
                { id: 'LEAF', label: 'ใบ', labelEN: 'Leaf' },
                { id: 'ROOT', label: 'ราก/หัว', labelEN: 'Root/Tuber' },
                { id: 'OTHER', label: 'อื่นๆ', labelEN: 'Other' },
            ],
            // Ownership Types
            ownershipTypes: [
                { id: 'OWN', label: 'เจ้าของ', labelEN: 'Owner' },
                { id: 'RENT', label: 'เช่า', labelEN: 'Renter' },
                { id: 'CONSENT', label: 'ได้รับยินยอม', labelEN: 'Consent' },
            ]
        };

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Master Data Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch master data' });
    }
};

module.exports = {
    getMasterData
};
