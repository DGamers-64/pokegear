export default class Components {
    static async cargarComponente(container) {
        const nombre = container.dataset.component
        if (!nombre) return
    
        // Crear Shadow DOM
        const shadow = container.attachShadow({ mode: "open" })
    
        // Cargar HTML
        const res = await fetch(`./components/${nombre}.html`)
        const htmlText = await res.text()
    
        const tmp = document.createElement("div")
        tmp.innerHTML = htmlText
    
        // Inyectar div principal
        const rootDiv = tmp.querySelector("div")
        if (rootDiv) shadow.appendChild(rootDiv)
    
        tmp.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const clone = document.createElement("link")
            clone.rel = "stylesheet"
    
            // Resolver ruta correctamente
            clone.href = new URL(link.getAttribute("href"), location.href).href
    
            shadow.appendChild(clone)
        })
    
        // Inyectar estilos
        tmp.querySelectorAll("style").forEach(style => {
            const clone = document.createElement("style")
            clone.textContent = style.textContent
            shadow.appendChild(clone)
        })
    
        // Ejecutar scripts
        tmp.querySelectorAll("script").forEach(oldScript => {
            if (oldScript.src) {
                const s = document.createElement("script")
                s.src = oldScript.src
                shadow.appendChild(s)
            } else {
                // Creamos una función con argumentos: container=div, shadow=shadow, ...props
                const fn = new Function("container", "shadow", "props", oldScript.textContent)
                fn(container, shadow, container.dataset)
            }
        })
    }
    
    static async cargarComponentes(root) {
        const components = root.querySelectorAll("[data-component]")
        for (const el of components) {
            await Components.cargarComponente(el)
        }
    }
}
