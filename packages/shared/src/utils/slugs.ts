import acronym from '@stdlib/string-acronym'
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
 * Generates a project acronym from the project name
 * Takes the first letter of each major word, max 3 characters
 */
export const generateProjectAcronym = (projectName: string): string => {
    const acr = acronym(projectName)
    return acr.substring(0, 3).toUpperCase()
}

/**
 * Formats task key as [ACRONYM]-[localId]
 * e.g., "CPW-01"
 */
export const formatTaskKey = (acronym: string, localId: number): string => {
    const paddedId = String(localId).padStart(2, '0')
    return `${acronym}-${paddedId}`
}
