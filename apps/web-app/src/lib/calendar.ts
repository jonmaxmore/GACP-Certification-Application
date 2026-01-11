export const createGoogleCalendarUrl = (
    title: string,
    description: string,
    location: string,
    startDate: Date,
    endDate?: Date
): string => {
    // Format dates to YYYYMMDDTHHMMSSZ (UTC)
    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : formatDate(new Date(startDate.getTime() + 60 * 60 * 1000)); // Default 1 hour

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        details: description,
        location: location,
        dates: `${start}/${end}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
