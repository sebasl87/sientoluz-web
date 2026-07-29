export function trackCompleteRegistration() {
    if (typeof window === 'undefined') return
    window.fbq?.('track', 'CompleteRegistration')
}

export function trackPageView() {
    if (typeof window === 'undefined') return
    window.fbq?.('track', 'PageView')
}