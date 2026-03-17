Next.js suggests using the app folder to define application routes. It expects files in the app folder to correspond to
pathnames. This routing mechanism does not align with the FSD concept, as it's not possible to maintain a flat slice
structure.

The solution is to move the Next.js app folder to the project root and import FSD pages from src, where the FSD layers
are, into the Next.js app folder.

You will also need to add a pages folder to the project root, otherwise Next.js will try to use src/pages as the Pages
Router even if you use the App Router, which will break the build. It's also a good idea to put a README.md file inside
this root pages folder describing why it is necessary, even though it's empty.