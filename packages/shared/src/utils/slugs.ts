import ShortUniqueId from 'short-unique-id'
import slugify from 'slugify'

const uid = new ShortUniqueId({ length: 6 })

const SHORT_MAP: Record<string, string> = {
    'incorporated': 'inc',
    'limited': 'ltd',
    'company': 'co',
    'development': 'dev',
}

const STOP_WORDS = ['the', 'a', 'an', 'and', 'of', 'for', 'with']

/**
 * Cleans name by removing stop words and applying abbreviations
 */
const compressName = (name: string): string => {
    const words = name.toLowerCase().split(' ')
        .filter(word => !STOP_WORDS.includes(word))
        .map(word => SHORT_MAP[word] || word)
    
    // If all words were stop words, return the original lowercased name
    if (words.length === 0)
        return name.toLowerCase()
    
    return words.join(' ')
}

/**
 * Generates a URL-safe slug with a 24-char limit
 */
export const generateSlug = (name: string): string => {
    let slug = slugify(compressName(name), { lower: true, strict: true })
    
    if (slug.length > 24) {
        const suffix = uid.rnd()
        // Truncate to make room for hyphen and suffix
        slug = slug.substring(0, 24 - suffix.length - 1) + '-' + suffix
    }
    
    return slug
}

/**
 * Stable project key prefix from the project name.
 * Single word → first 4 chars; multi-word → first letter of each word (max 5).
 * e.g. "Testing" → "TEST", "Status Score" → "SS"
 */
export const createProjectKey = (name: string): string => {
    const words = name
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
    
    if (words.length === 0)
        throw new Error('Project name must contain alphanumeric characters')
    
    if (words.length === 1)
        return words[0].slice(0, 4).toUpperCase()
    
    return words
        .map(word => word[0])
        .join('')
        .slice(0, 5)
        .toUpperCase()
}

/**
 * Stable task key: [PROJECT_KEY]-[taskNumber]
 * e.g. createTaskKey('Engineering', 4) → "ENGI-4"
 */
export const createTaskKey = (projectName: string, taskNumber: number): string =>
    `${createProjectKey(projectName)}-${taskNumber}`
