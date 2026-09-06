const cfg = window.PROJECT_CONFIG || {}

const API = "https://api.modrinth.com/v2"
const USER = "EndExpanser"

const $ = s => document.querySelector(s)

const fmt = n =>
  new Intl.NumberFormat("en", {
    notation: n >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(n || 0)

const escapeHtml = (s = "") =>
  String(s).replace(
    /[&<>"']/g,
    c =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[c]
  )

function basicMarkdown(md = "") {
  let s = escapeHtml(md).replace(/\r/g, "")

  s = s
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>'
    )

  const lines = s.split("\n")

  let out = []
  let inUl = false
  let inOl = false

  for (const line of lines) {
    if (/^[-*] /.test(line)) {
      if (!inUl) {
        out.push("<ul>")
        inUl = true
      }

      out.push(
        "<li>" +
          line.replace(/^[-*] /, "") +
          "</li>"
      )

      continue
    }

    if (/^\d+\. /.test(line)) {
      if (!inOl) {
        out.push("<ol>")
        inOl = true
      }

      out.push(
        "<li>" +
          line.replace(/^\d+\. /, "") +
          "</li>"
      )

      continue
    }

    if (inUl) {
      out.push("</ul>")
      inUl = false
    }

    if (inOl) {
      out.push("</ol>")
      inOl = false
    }

    if (!line.trim()) {
      continue
    }

    if (/^<h[123]>/.test(line)) {
      out.push(line)
    } else if (/^&gt; /.test(line)) {
      out.push(
        "<blockquote>" +
          line.replace(/^&gt; /, "") +
          "</blockquote>"
      )
    } else {
      out.push(
        "<p>" +
          line +
          "</p>"
      )
    }
  }

  if (inUl) {
    out.push("</ul>")
  }

  if (inOl) {
    out.push("</ol>")
  }

  return out.join("")
}

async function loadProject() {
  try {
    const r = await fetch(
      `${API}/user/${USER}/projects`
    )

    if (!r.ok) {
      throw new Error(
        "Modrinth API " + r.status
      )
    }

    const list = await r.json()

    const wanted =
      (cfg.slug || "").toLowerCase()

    const title =
      (cfg.title || "").toLowerCase()

    const p = list.find(
      x =>
        (x.slug || "").toLowerCase() ===
          wanted ||
        (x.title || "").toLowerCase() ===
          title
    )

    if (!p) {
      throw new Error(
        "Project not found"
      )
    }

    document.title =
      `${p.title} — EndExpanser`

    $("#projectTitle").textContent =
      p.title

    $("#projectSummary").textContent =
      p.description || ""

    $("#projectIcon").src =
      p.icon_url || ""

    $("#projectIcon").alt =
      p.title

    $("#downloads").textContent =
      fmt(p.downloads)

    $("#followers").textContent =
      fmt(p.followers)

    $("#projectType").textContent =
      (p.project_type || "project")
        .replace("_", " ")

    $("#updated").textContent =
      p.updated
        ? new Date(
            p.updated
          ).toLocaleDateString(
            "en",
            {
              year: "numeric",
              month: "short",
              day: "numeric"
            }
          )
        : "—"

    const typePath =
      p.project_type === "shader"
        ? "shader"
        : p.project_type ===
          "resourcepack"
        ? "resourcepack"
        : p.project_type ===
          "modpack"
        ? "modpack"
        : "mod"

    const mr =
      `https://modrinth.com/${typePath}/${p.slug || p.id}`

    document
      .querySelectorAll(
        "[data-modrinth]"
      )
      .forEach(a => {
        a.href = mr
      })

    const tags = [
      ...(p.categories || []),
      ...(p.additional_categories || []),
      ...(p.loaders || [])
    ]

    $("#tags").innerHTML =
      [...new Set(tags)]
        .map(
          t =>
            `<span class="tag">${escapeHtml(t)}</span>`
        )
        .join("")

    const gallery =
      Array.isArray(p.gallery)
        ? p.gallery
        : []

    $("#gallery").innerHTML =
      gallery.length
        ? gallery
            .map(
              (g, i) => `
                <figure
                  class="gallery-item reveal"
                  data-img="${escapeHtml(g.url)}"
                >
                  <img
                    src="${escapeHtml(g.url)}"
                    alt="${escapeHtml(
                      g.title ||
                        p.title +
                          " gallery image " +
                          (i + 1)
                    )}"
                    loading="lazy"
                  >

                  ${
                    g.title ||
                    g.description
                      ? `
                        <figcaption>
                          ${escapeHtml(
                            g.title ||
                              g.description
                          )}
                        </figcaption>
                      `
                      : ""
                  }
                </figure>
              `
            )
            .join("")
        : `
          <div class="empty-gallery">
            No gallery images on Modrinth yet
          </div>
        `

    $("#description").innerHTML =
      basicMarkdown(
        p.body ||
        p.description ||
        ""
      )

    bindGallery()
    initReveal()

    $("#loading").classList.add(
      "hide"
    )
  } catch (err) {
    console.error(err)

    $("#loadingText").textContent =
      "couldn't load Modrinth data"

    setTimeout(
      () =>
        $("#loading").classList.add(
          "hide"
        ),
      1200
    )

    $("#projectTitle").textContent =
      cfg.title || "Project"

    $("#projectSummary").textContent =
      "Live project data is temporarily unavailable"
  }
}

function bindGallery() {
  document
    .querySelectorAll(
      ".gallery-item"
    )
    .forEach(el => {
      el.addEventListener(
        "click",
        () => {
          $("#lightboxImg").src =
            el.dataset.img

          $("#lightbox")
            .classList.add("open")
        }
      )
    })
}

$("#lightboxClose")
  .addEventListener(
    "click",
    () =>
      $("#lightbox")
        .classList.remove("open")
  )

$("#lightbox")
  .addEventListener(
    "click",
    e => {
      if (
        e.target.id ===
        "lightbox"
      ) {
        $("#lightbox")
          .classList.remove(
            "open"
          )
      }
    }
  )

addEventListener(
  "keydown",
  e => {
    if (e.key === "Escape") {
      $("#lightbox")
        .classList.remove(
          "open"
        )
    }
  }
)

function initReveal() {
  const io =
    new IntersectionObserver(
      entries =>
        entries.forEach(
          e => {
            if (
              e.isIntersecting
            ) {
              e.target
                .classList.add(
                  "visible"
                )

              io.unobserve(
                e.target
              )
            }
          }
        ),
      {
        threshold: 0.1
      }
    )

  document
    .querySelectorAll(
      ".reveal:not(.visible)"
    )
    .forEach(
      el =>
        io.observe(el)
    )
}

initReveal()

const bar =
  $(".sitebar")

addEventListener(
  "scroll",
  () =>
    bar.classList.toggle(
      "scrolled",
      scrollY > 25
    ),
  {
    passive: true
  }
)

function startFX() {
  const c = $("#fx")
  const x = c.getContext("2d")

  let pts = []

  function resize() {
    const d =
      Math.min(
        devicePixelRatio,
        2
      )

    c.width =
      innerWidth * d

    c.height =
      innerHeight * d

    c.style.width =
      innerWidth + "px"

    c.style.height =
      innerHeight + "px"

    x.setTransform(
      d,
      0,
      0,
      d,
      0,
      0
    )

    const count =
      Math.min(
        140,
        Math.floor(
          innerWidth *
            innerHeight /
            10000
        )
      )

    pts =
      Array.from(
        {
          length: count
        },
        () => ({
          x:
            Math.random() *
            innerWidth,

          y:
            Math.random() *
            innerHeight,

          r:
            Math.random() *
              1.2 +
            0.2,

          v:
            Math.random() *
              0.18 +
            0.03,

          a:
            Math.random() *
              0.5 +
            0.12,

          p:
            Math.random() *
            6.28
        })
      )
  }

  function draw() {
    x.clearRect(
      0,
      0,
      innerWidth,
      innerHeight
    )

    const theme =
      cfg.theme || "end"

    for (const p of pts) {
      if (theme === "end") {
        p.y += p.v * 0.35

        p.x +=
          Math.sin(
            p.p += 0.004
          ) * 0.08

        x.fillStyle =
          `rgba(
            200,
            145,
            255,
            ${p.a}
          )`
      } else if (
        theme === "aeon"
      ) {
        p.y +=
          p.v * 0.18

        p.x +=
          p.v * 0.45

        x.fillStyle =
          `rgba(
            244,
            207,
            151,
            ${p.a * 0.7}
          )`
      } else if (
        theme === "expanse"
      ) {
        p.y -=
          p.v * 0.24

        p.x +=
          Math.sin(
            p.p += 0.008
          ) * 0.12

        x.fillStyle =
          `rgba(
            115,
            239,
            213,
            ${p.a * 0.75}
          )`
      } else {
        p.y +=
          p.v * 0.3

        x.fillStyle =
          `rgba(
            90,
            167,
            255,
            ${p.a * 0.7}
          )`
      }

      if (
        p.y >
        innerHeight + 4
      ) {
        p.y = -4
      }

      if (p.y < -4) {
        p.y =
          innerHeight + 4
      }

      if (
        p.x >
        innerWidth + 4
      ) {
        p.x = -4
      }

      x.beginPath()

      x.arc(
        p.x,
        p.y,
        p.r,
        0,
        Math.PI * 2
      )

      x.fill()
    }

    requestAnimationFrame(
      draw
    )
  }

  addEventListener(
    "resize",
    resize
  )

  resize()
  draw()
}

startFX()
loadProject()
