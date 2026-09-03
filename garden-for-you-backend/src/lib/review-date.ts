/**
 * Parses the review date coming from the admin panel.
 *
 * Returns `null` when nothing was provided and `"invalid"` when the value
 * cannot be read as a date, so callers can tell "leave as is" apart from
 * "reject the request".
 */
export function parseReviewDate(value: unknown): Date | null | "invalid" {
    if (value === null || value === undefined) {
        return null
    }

    if (typeof value !== "string" || value.trim().length === 0) {
        return null
    }

    const raw = value.trim()
    // A plain "YYYY-MM-DD" from the admin date input is parsed as UTC midnight,
    // which can shift the visible day backwards for negative timezones. Anchor
    // it to midday instead so the chosen day is what gets displayed.
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T12:00:00` : raw
    const date = new Date(normalized)

    if (Number.isNaN(date.getTime())) {
        return "invalid"
    }

    return date
}
