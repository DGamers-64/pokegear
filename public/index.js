const contenidoDOM = document.getElementById("contenido")

const inyectados = {
    scripts: [],
    styles: [],
    links: []
}

iniciarPagina()

async function iniciarPagina() {
    if (window.location.hash != "" && window.location.hash != "#") await cargarContenido(window.location.hash.substring(1))
    window.addEventListener("hashchange", async () => await cargarContenido(window.location.hash.substring(1)))
}

async function cargarContenido(pagina) {
    limpiarPagina()
    const response = await fetch(`./views/${pagina}.html`)
    const data = await response.text()
    const tmp = document.createElement("div")
    tmp.innerHTML = data
    contenidoDOM.innerHTML = tmp.innerHTML

    tmp.querySelectorAll("script").forEach(async oldScript => {
        const newScript = document.createElement("script")

        if (oldScript.type) newScript.type = oldScript.type
        if (oldScript.async) newScript.async = true
        if (oldScript.defer) newScript.defer = true
        if (oldScript.src) {
            newScript.src = oldScript.src
            const p = new Promise(resolve => {
                newScript.onload = () => resolve()
                newScript.onerror = () => { console.error("Error cargando script: ", newScript.src); resolve() }
            })
            document.body.appendChild(newScript)
            inyectados.scripts.push(newScript)
            await p
        } else {
            newScript.textContent = oldScript.textContent
            document.body.appendChild(newScript)
            inyectados.scripts.push(newScript)
        }
    })

    tmp.querySelectorAll("style").forEach(tag => {
        const clone = document.createElement("style")
        clone.textContent = tag.textContent
        if (tag.media) clone.media = tag.media
        document.head.appendChild(clone)
        inyectados.styles.push(clone)
    })

    tmp.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (!link.href) return
        const resolved = new URL(link.href, location.href).href
        const existe = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]'))
                                .some(l => l.href === resolved)
        if (existe) return
        const clone = document.createElement("link")
        clone.rel = "stylesheet"
        clone.href = link.href
        if (link.media) clone.media = link.media
        document.head.appendChild(clone)
        inyectados.links.push(clone)
    })
}

function limpiarPagina() {
    inyectados.scripts.forEach(e => e.remove())
    inyectados.styles.forEach(e => e.remove())
    inyectados.links.forEach(e => e.remove())

    inyectados.scripts.length = 0
    inyectados.styles.length = 0
    inyectados.links.length = 0

    contenidoDOM.innerHTML = ""
}