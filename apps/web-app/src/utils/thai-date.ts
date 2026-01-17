/**
 * 📅 Thai Date Utilities
 * สำหรับระบบราชการไทย GACP
 */

/**
 * Format date to Thai short format (8 ธ.ค. 67)
 */
export function formatThaiDate(dateString: string | Date | null | undefined): string {
    if (!dateString) return "-";

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
    });
}

/**
 * Format date to Thai long format (8 ธันวาคม 2567)
 */
export function formatThaiDateLong(dateString: string | Date | null | undefined): string {
    if (!dateString) return "-";

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * Format date to numeric format (08/12/2567)
 */
export function formatThaiDateNumeric(dateString: string | Date | null | undefined): string {
    if (!dateString) return "-";

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return "-";

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const thaiYear = date.getFullYear() + 543;

    return `${day}/${month}/${thaiYear}`;
}

/**
 * Format datetime to Thai format with time
 */
export function formatThaiDateTime(dateString: string | Date | null | undefined): string {
    if (!dateString) return "-";

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return "-";

    const dateStr = date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
    });

    const timeStr = date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${dateStr} ${timeStr} น.`;
}

/**
 * Get relative time in Thai (วันนี้, เมื่อวาน, 3 วันก่อน)
 */
export function formatThaiRelative(dateString: string | Date | null | undefined): string {
    if (!dateString) return "-";

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return "-";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "วันนี้";
    if (diffDays === 1) return "เมื่อวาน";
    if (diffDays < 7) return `${diffDays} วันก่อน`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ก่อน`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} เดือนก่อน`;
    return `${Math.floor(diffDays / 365)} ปีก่อน`;
}

const thaiDateUtils = {
    formatThaiDate,
    formatThaiDateLong,
    formatThaiDateNumeric,
    formatThaiDateTime,
    formatThaiRelative,
};

export default thaiDateUtils;
