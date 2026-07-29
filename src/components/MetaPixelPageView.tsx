'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '@/lib/analytics/meta'

// El snippet base de MetaPixel ya dispara el primer PageView al cargar la
// página. El App Router no remonta el layout entre navegaciones client-side
// (solo cambia el segmento de la ruta), así que sin esto un usuario que
// navega de /precios a /signup sin recargar nunca genera un segundo PageView
// — Meta ve una sola vista de página por sesión de browser, sea cual sea la
// cantidad de rutas que haya visitado.
export function MetaPixelPageView() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const isFirstRender = useRef(true)

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        trackPageView()
    }, [pathname, searchParams])

    return null
}