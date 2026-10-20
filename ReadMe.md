# Arjun Sharma — Portfolio

A personal developer portfolio built with Blazor WebAssembly and .NET 8.
It presents Arjun's profile, work experience, selected projects, technical
skills, services, resume, and contact links.

The Projects page also includes the Quiz Solver concept, W2Moment learning
exploration, and this portfolio from the content brief. Unverified completion
status and public links are identified rather than presented as finished work.

## Visual style

The design follows [Arjun's reference portfolio](https://thearjunsharma-ai.github.io/portfolio/):
a fixed light navigation bar, blue active tabs and buttons, a cloud-background
hero with a developer illustration, and white content cards. Hero artwork is
served locally from `wwwroot/images`; no remote image requests are required.
The mobile navigation, resume actions, and scroll-based page switching remain
available with the updated design.

Use the sun/moon button in the header to switch between light and dark
themes. The first visit follows the system color preference; an explicit
selection is saved in browser storage and restored before rendering.

## Run locally

```sh
dotnet run
```

Open the local URL printed by the .NET development server.

### If the layout loads without the current header styles

Blazor generates `MyPortfolio.styles.css` from the component CSS files.
Old generated files in `bin` or `obj` can make an incremental build serve
outdated styles. Stop the development server, then run:

```sh
dotnet clean
dotnet run
```

Refresh the browser after the build completes. Do not restore old generated
build outputs after testing; the running site uses those files.

## Portfolio sections

- Home
- About
- Experience
- Projects
- Skills
- Services
- Resume
- Contact

Scrolling to the bottom opens the next section in this order; scrolling to
the top opens the previous section. The previous page opens at its bottom
so upward reading can continue. Home and Contact do not wrap around.
Mouse wheel, touch scrolling, and keyboard scrolling are supported.
Pages that fit on screen change on a directional scroll gesture. Page loads
do not switch sections, and scroll momentum is paused briefly between pages
to avoid skipping sections. Navigation links remain available.

The resume download is served from `wwwroot/Arjun_Sharma.pdf`. When updating the
resume, replace that site asset with the latest approved PDF.
