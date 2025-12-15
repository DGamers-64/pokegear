const contenidoDOM = document.getElementById("contenido")
const shadow = contenidoDOM.attachShadow({ mode: "open" })

const inyectados = {
    scripts: [],
    styles: [],
    links: []
}

iniciarPagina()

const buttonAbrirAside = document.getElementById("abrir-aside")
buttonAbrirAside.addEventListener("click", e => {
    e.preventDefault()
    const aside = document.querySelector("aside")
    if (aside.style.display == "block") aside.style.display = "none"
    else aside.style.display = "block"
})

async function iniciarPagina() {
    await cargarContenido(window.location.hash.substring(1))
    window.addEventListener("hashchange", async () => {
        await cargarContenido(window.location.hash.substring(1))
    })
}

async function cargarContenido(pagina) {
    limpiarShadow()
    limpiarPagina()
    if (pagina == "" || pagina == "#") pagina = "inicio"
    const paramsURL = new URLSearchParams(pagina.split("?")[1])
    const params = Object.fromEntries(paramsURL.entries())
    const path = pagina.split("?")[0]
    const response = await fetch(`./views/${path}.html`)
    const data = await response.text()
    const tmp = document.createElement("div")
    tmp.innerHTML = data
    const rootDiv = tmp.querySelector("div")

    rootDiv.dataset.params = JSON.stringify(params)

    rootDiv.style.width = "100%"
    rootDiv.style.height = "100%"
    rootDiv.style.boxSizing = "border-box"

    shadow.appendChild(rootDiv.cloneNode(true))

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
            shadow.appendChild(newScript)
            inyectados.scripts.push(newScript)
            await p
        } else {
            newScript.textContent = oldScript.textContent
            shadow.appendChild(newScript)
            inyectados.scripts.push(newScript)
        }
    })

    tmp.querySelectorAll("style").forEach(tag => {
        const clone = document.createElement("style")
        clone.textContent = tag.textContent
        if (tag.media) clone.media = tag.media
        shadow.appendChild(clone)
        inyectados.styles.push(clone)
    })

    tmp.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (!link.href) return
        const resolved = new URL(link.href, location.href).href
        const existe = Array.from(shadow.querySelectorAll('link[rel="stylesheet"]'))
                                .some(l => l.href === resolved)
        if (existe) return
        const clone = document.createElement("link")
        clone.rel = "stylesheet"
        clone.href = link.href
        if (link.media) clone.media = link.media
        shadow.appendChild(clone)
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

function limpiarShadow() {
    while (shadow.firstChild) {
        shadow.firstChild.remove()
    }
}