const API = "https://api.modrinth.com/v2"
const USER = "EndExpanser"

document.getElementById("year").textContent =
  new Date().getFullYear()

const fmt = n =>
  new Intl.NumberFormat("en", {
    notation: n >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(n || 0)

async function getProjects() {
  const status = document.getElementById("apiStatus")
  const grid = document.getElementById("projectGrid")

  try {
    const res = await fetch(
      `${API}/user/${USER}/projects`
    )

    if (!res.ok) {
      throw new Error(`Modrinth API: ${res.status}`)
    }

    let projects = await res.json()

    projects = projects
      .filter(p =>
        ["approved", "archived", "unlisted"].includes(
          p.status
        )
      )
      .sort(
        (a, b) =>
          (b.downloads || 0) -
          (a.downloads || 0)
      )

    const downloads = projects.reduce(
      (sum, p) =>
        sum + (p.downloads || 0),
      0
    )

    const followers = projects.reduce(
      (sum, p) =>
        sum + (p.followers || 0),
      0
    )

    animateNumber(
      "projectCount",
      projects.length,
      false
    )

    animateNumber(
      "downloadCount",
      downloads,
      true
    )

    animateNumber(
      "followerCount",
      followers,
      true
    )

    if (!projects.length) {
      throw new Error(
        "No public projects returned"
      )
    }

    grid.innerHTML = projects
      .map(p => {
        const image =
          p.gallery?.[0]?.url ||
          p.icon_url ||
          ""

        const type =
          (p.project_type || "project")
            .replace("_", " ")

        const loaders =
          Array.isArray(p.loaders)
            ? p.loaders.slice(0, 2)
            : []

        const hrefType =
          p.project_type === "resourcepack"
            ? "resourcepack"
            : p.project_type === "shader"
            ? "shader"
            : p.project_type === "modpack"
            ? "modpack"
            : "mod"

        /*
          ВАЖНО:
          страницы находятся в корне
          репозитория EndExpanser
        */

        const localPages = {
          "end expanse":
            "/EndExpanser/end-expanse.html",

          "aeonrealism":
            "/EndExpanser/aeonrealism.html",

          "expanse shaders":
            "/EndExpanser/expanse-shaders.html",

          "bluedition":
            "/EndExpanser/bluedition.html"
        }

        const href =
          localPages[
            (p.title || "").toLowerCase()
          ] ||
          `https://modrinth.com/${hrefType}/${p.slug || p.id}`

        const target = "_self"

        return `
          <a
            class="project-card tilt reveal"
            href="${href}"
            target="${target}"
          >
            <div
              class="project-bg"
              style="${
                image
                  ? `background-image:url('${image}')`
                  : `
                    background:
                      radial-gradient(
                        circle at 65% 30%,
                        rgba(151,91,255,.32),
                        transparent 32%
                      ),
                      linear-gradient(
                        135deg,
                        #151020,
                        #09080d
                      )
                  `
              }"
            ></div>

            <div class="project-content">

              <div class="project-meta">

                <span class="pill">
                  ${escapeHtml(type)}
                </span>

                ${loaders
                  .map(
                    l =>
                      `<span class="pill">
                        ${escapeHtml(l)}
                      </span>`
                  )
                  .join("")}

              </div>

              <h3 class="project-title">
                ${escapeHtml(p.title)}
              </h3>

              <p class="project-desc">
                ${escapeHtml(
                  p.description ||
                  "A project by EndExpanser"
                )}
              </p>

              <div class="project-bottom">

                <div class="stats-mini">

                  <span>
                    ↓ ${fmt(p.downloads)} downloads
                  </span>

                  <span>
                    ♡ ${fmt(p.followers)} followers
                  </span>

                </div>

                <span class="arrow">
                  ↗
                </span>

              </div>

            </div>
          </a>
        `
      })
      .join("")

    status.textContent =
      "live data from modrinth"

    initReveal()
    initTilt()

  } catch (err) {
    console.error(err)

    status.textContent =
      "modrinth data unavailable"

    document.getElementById(
      "projectCount"
    ).textContent = "4"

    document.getElementById(
      "downloadCount"
    ).textContent = "—"

    document.getElementById(
      "followerCount"
    ).textContent = "—"

    grid.innerHTML =
      fallbackCards()

    initReveal()
    initTilt()
  }
}

function fallbackCards() {
  const fallback = [
    [
      "End Expanse",
      "mod",
      "Expand the End in a quiet, vanilla-inspired style",
      "/EndExpanser/end-expanse.html"
    ],

    [
      "AeonRealism",
      "shader",
      "A cinematic realism-focused shader project",
      "/EndExpanser/aeonrealism.html"
    ],

    [
      "Expanse Shaders",
      "shader",
      "Atmospheric visuals built for Minecraft",
      "/EndExpanser/expanse-shaders.html"
    ],

    [
      "Bluedition",
      "resource pack",
      "A blue-styled visual resource pack",
      "/EndExpanser/bluedition.html"
    ]
  ]

  return fallback
    .map(
      ([title, type, desc, href]) => `
        <a
          class="project-card tilt reveal"
          href="${href}"
        >

          <div
            class="project-bg"
            style="
              background:
                radial-gradient(
                  circle at 65% 30%,
                  rgba(151,91,255,.32),
                  transparent 32%
                ),
                linear-gradient(
                  135deg,
                  #151020,
                  #09080d
                )
            "
          ></div>

          <div class="project-content">

            <div class="project-meta">
              <span class="pill">
                ${type}
              </span>
            </div>

            <h3 class="project-title">
              ${title}
            </h3>

            <p class="project-desc">
              ${desc}
            </p>

            <div class="project-bottom">

              <div class="stats-mini">
                <span>
                  open project
                </span>
              </div>

              <span class="arrow">
                ↗
              </span>

            </div>

          </div>

        </a>
      `
    )
    .join("")
}

function escapeHtml(str = "") {
  return String(str).replace(
    /[&<>"']/g,
    s =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[s]
  )
}

function animateNumber(
  id,
  target,
  compact
) {
  const el =
    document.getElementById(id)

  const start =
    performance.now()

  const duration = 900

  const tick = now => {
    const t =
      Math.min(
        1,
        (now - start) /
          duration
      )

    const eased =
      1 -
      Math.pow(
        1 - t,
        3
      )

    const value =
      Math.round(
        target * eased
      )

    el.textContent =
      compact
        ? fmt(value)
        : value

    if (t < 1) {
      requestAnimationFrame(
        tick
      )
    }
  }

  requestAnimationFrame(tick)
}

function initReveal() {
  const io =
    new IntersectionObserver(
      entries => {
        entries.forEach(e => {
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
        })
      },
      {
        threshold: 0.12
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

function initTilt() {
  if (
    matchMedia(
      "(pointer: coarse)"
    ).matches
  ) {
    return
  }

  document
    .querySelectorAll(
      ".tilt"
    )
    .forEach(card => {

      card.onmousemove =
        e => {
          const r =
            card.getBoundingClientRect()

          const x =
            (e.clientX -
              r.left) /
              r.width -
            0.5

          const y =
            (e.clientY -
              r.top) /
              r.height -
            0.5

          card.style.transform =
            `perspective(900px)
             rotateX(${y * -3.5}deg)
             rotateY(${x * 4.5}deg)`
        }

      card.onmouseleave =
        () => {
          card.style.transform =
            ""
        }
    })
}

const topbar =
  document.querySelector(
    ".topbar"
  )

addEventListener(
  "scroll",
  () =>
    topbar.classList.toggle(
      "scrolled",
      scrollY > 30
    ),
  {
    passive: true
  }
)

const glow =
  document.querySelector(
    ".cursor-glow"
  )

addEventListener(
  "pointermove",
  e => {
    glow.style.left =
      e.clientX + "px"

    glow.style.top =
      e.clientY + "px"
  },
  {
    passive: true
  }
)

document
  .querySelectorAll(
    ".magnetic"
  )
  .forEach(el => {

    el.addEventListener(
      "pointermove",
      e => {
        if (
          matchMedia(
            "(pointer: coarse)"
          ).matches
        ) {
          return
        }

        const r =
          el.getBoundingClientRect()

        el.style.transform =
          `translate(
            ${
              (
                e.clientX -
                r.left -
                r.width / 2
              ) * 0.08
            }px,
            ${
              (
                e.clientY -
                r.top -
                r.height / 2
              ) * 0.11
            }px
          )`
      }
    )

    el.addEventListener(
      "pointerleave",
      () => {
        el.style.transform =
          ""
      }
    )
  })

const canvas =
  document.getElementById(
    "stars"
  )

const ctx =
  canvas.getContext("2d")

let stars = []

function resize() {
  const dpr =
    Math.min(
      devicePixelRatio,
      2
    )

  canvas.width =
    innerWidth * dpr

  canvas.height =
    innerHeight * dpr

  canvas.style.width =
    innerWidth + "px"

  canvas.style.height =
    innerHeight + "px"

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  )

  const count =
    Math.min(
      170,
      Math.floor(
        innerWidth *
          innerHeight /
          8500
      )
    )

  stars =
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
          0.15,

        a:
          Math.random() *
            0.55 +
          0.12,

        s:
          Math.random() *
            0.12 +
          0.02
      })
    )
}

function draw() {
  ctx.clearRect(
    0,
    0,
    innerWidth,
    innerHeight
  )

  for (const s of stars) {
    s.y += s.s

    if (
      s.y >
      innerHeight + 3
    ) {
      s.y = -3
    }

    ctx.beginPath()

    ctx.arc(
      s.x,
      s.y,
      s.r,
      0,
      Math.PI * 2
    )

    ctx.fillStyle =
      `rgba(
        225,
        215,
        255,
        ${s.a}
      )`

    ctx.fill()
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

getProjects()
