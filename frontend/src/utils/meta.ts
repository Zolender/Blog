/**
 * Sets or updates a <meta> tag in <head>.
 * Looks for an existing tag by property or name, updates it, or creates it.
 */
const setMetaTag = (attr: 'property' | 'name', key: string, value: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
    if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
    }
    el.setAttribute('content', value)
}

const removeMetaTag = (attr: 'property' | 'name', key: string) => {
    document.querySelector(`meta[${attr}="${key}"]`)?.remove()
}

export const setPostMeta = (post: {
    title: string
    description: string
    image: string | null
    url: string
}) => {
    // for common social media platforms just Open Graph
    setMetaTag('property', 'og:type', 'article')
    setMetaTag('property', 'og:title', post.title)
    setMetaTag('property', 'og:description', post.description)
    setMetaTag('property', 'og:url',post.url)
    if (post.image) setMetaTag('property', 'og:image', post.image)

    // for Twitter
    setMetaTag('name', 'twitter:card','summary_large_image')
    setMetaTag('name', 'twitter:title', post.title)
    setMetaTag('name', 'twitter:description', post.description)
    if (post.image) setMetaTag('name', 'twitter:image', post.image)
}

export const clearPostMeta = () => {
    ;['og:type', 'og:title', 'og:description', 'og:url', 'og:image'].forEach(
        k => removeMetaTag('property', k)
    )
    ;['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'].forEach(
        k => removeMetaTag('name', k)
    )
}