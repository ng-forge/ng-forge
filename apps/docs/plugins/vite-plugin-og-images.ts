/**
 * Vite plugin that generates per-route Open Graph images from markdown content frontmatter.
 *
 * Uses satori (JSX → SVG) + @resvg/resvg-js (SVG → PNG) to render 1200×630 social cards
 * styled in the Forge design language.
 *
 * Dev mode: serves images via middleware at /og/{slug}.png with caching.
 * Build mode: emits images as static assets in the output directory.
 */

import { resolve, relative } from 'node:path';
import { readFileSync, readdirSync, statSync, watch, existsSync } from 'node:fs';
import type { Plugin, ViteDevServer } from 'vite';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// ============================================
// TYPES
// ============================================

interface PageMeta {
  title: string;
  slug: string;
  description: string;
  category: string;
}

// ============================================
// CONSTANTS
// ============================================

const CONTENT_DIR = 'public/content';
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/** Category labels derived from the first path segment of the slug. */
const CATEGORY_MAP: Record<string, string> = {
  validation: 'Validation',
  'field-types': 'Field Types',
  'dynamic-behavior': 'Dynamic Behavior',
  examples: 'Examples',
  recipes: 'Recipes',
  'schema-validation': 'Schema Validation',
  prebuilt: 'Prebuilt',
};

// ============================================
// FRONTMATTER PARSING
// ============================================

function parseFrontmatter(raw: string): { title: string; slug: string; description: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { title: '', slug: '', description: '' };

  const fm = match[1];
  const titleMatch = fm.match(/^title:\s*(.+)$/m);
  const slugMatch = fm.match(/^slug:\s*(.+)$/m);
  const descMatch = fm.match(/^description:\s*'?(.+?)'?\s*$/m);

  return {
    title: titleMatch?.[1]?.trim() ?? '',
    slug: slugMatch?.[1]?.trim() ?? '',
    description: descMatch?.[1]?.trim() ?? '',
  };
}

function deriveCategory(slug: string): string {
  const firstSegment = slug.split('/')[0];
  return CATEGORY_MAP[firstSegment] ?? 'Guide';
}

// ============================================
// CONTENT COLLECTION
// ============================================

/** Convert a kebab-case filename to Title Case (e.g., "login-form" → "Login Form"). */
function slugToTitle(slug: string): string {
  const filename = slug.split('/').pop() ?? slug;
  return filename
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function collectPages(contentDir: string): PageMeta[] {
  const pages: PageMeta[] = [];

  function walk(dir: string): void {
    for (const entry of readdirSync(dir)) {
      const fullPath = resolve(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith('.md')) {
        const raw = readFileSync(fullPath, 'utf-8');
        const fm = parseFrontmatter(raw);

        // Derive slug from file path if not in frontmatter
        const slug = fm.slug || relative(contentDir, fullPath).replace(/\.md$/, '');
        const title = fm.title || slugToTitle(slug);

        pages.push({ title, slug, description: fm.description, category: deriveCategory(slug) });
      }
    }
  }

  try {
    walk(contentDir);
  } catch {
    // Content directory may not exist during certain build phases
  }

  return pages;
}

// ============================================
// IMAGE RENDERING
// ============================================

/** Generate 3 decorative "form field" wireframe lines for the right-side visual. */
function buildFormFieldLines(): Record<string, unknown>[] {
  const fields = [
    { labelWidth: '70px', inputWidth: '100%' },
    { labelWidth: '50px', inputWidth: '100%' },
    { labelWidth: '90px', inputWidth: '100%' },
  ];
  return fields.map((f) => ({
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', gap: '6px' },
      children: [
        {
          type: 'div',
          props: {
            style: {
              width: f.labelWidth,
              height: '8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 107, 43, 0.15)',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              width: f.inputWidth,
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #2a2824',
              backgroundColor: 'rgba(19, 18, 16, 0.8)',
            },
          },
        },
      ],
    },
  }));
}

function buildOgJsx(page: PageMeta, logoDataUri: string): Record<string, unknown> {
  // Allow longer descriptions to fill space
  const desc = page.description.length > 200 ? page.description.slice(0, 197) + '...' : page.description;

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0908',
        padding: '0',
        fontFamily: 'JetBrains Mono, Inter, sans-serif',
      },
      children: [
        // Top ember gradient line
        {
          type: 'div',
          props: {
            style: {
              width: '100%',
              height: '4px',
              background: 'linear-gradient(to right, #ff4d00, #ff6b2b, #ff8c42)',
            },
          },
        },
        // Two-column layout
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flex: '1',
              padding: '40px 56px',
            },
            children: [
              // Left column: content (70%)
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: '1',
                    paddingRight: '48px',
                  },
                  children: [
                    // Top: logo + category + title + description (compact stack)
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', gap: '16px' },
                        children: [
                          // Logo row
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', alignItems: 'center', gap: '12px' },
                              children: [
                                {
                                  type: 'img',
                                  props: {
                                    src: logoDataUri,
                                    width: 36,
                                    height: 40,
                                    style: { width: '36px', height: '40px' },
                                  },
                                },
                                {
                                  type: 'div',
                                  props: {
                                    style: { display: 'flex', flexDirection: 'column' },
                                    children: [
                                      {
                                        type: 'span',
                                        props: {
                                          style: {
                                            color: '#e8e4de',
                                            fontSize: '18px',
                                            fontWeight: 700,
                                            letterSpacing: '-0.02em',
                                          },
                                          children: 'ng-forge',
                                        },
                                      },
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#5c5850', fontSize: '12px' },
                                          children: 'Dynamic Forms for Angular',
                                        },
                                      },
                                    ],
                                  },
                                },
                              ],
                            },
                          },
                          // Category pill
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', marginTop: '4px' },
                              children: [
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      backgroundColor: 'rgba(255, 77, 0, 0.15)',
                                      color: '#ff6b2b',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      padding: '3px 12px',
                                      borderRadius: '4px',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.08em',
                                    },
                                    children: page.category,
                                  },
                                },
                              ],
                            },
                          },
                          // Title
                          {
                            type: 'div',
                            props: {
                              style: {
                                color: '#e8e4de',
                                fontSize: '44px',
                                fontWeight: 700,
                                lineHeight: 1.15,
                                letterSpacing: '-0.02em',
                                marginTop: '8px',
                              },
                              children: page.title,
                            },
                          },
                          // Description
                          ...(desc
                            ? [
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      color: '#9a958c',
                                      fontSize: '20px',
                                      lineHeight: 1.5,
                                    },
                                    children: desc,
                                  },
                                },
                              ]
                            : []),
                        ],
                      },
                    },
                    // Bottom: URL
                    {
                      type: 'div',
                      props: {
                        style: { color: '#5c5850', fontSize: '16px' },
                        children: 'ng-forge.com/dynamic-forms',
                      },
                    },
                  ],
                },
              },
              // Right column: decorative form wireframe (30%)
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    width: '280px',
                    gap: '20px',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid #1a1916',
                    backgroundColor: 'rgba(13, 12, 11, 0.6)',
                  },
                  children: [
                    // Form header line
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '120px',
                          height: '10px',
                          borderRadius: '5px',
                          backgroundColor: 'rgba(232, 228, 222, 0.12)',
                          marginBottom: '4px',
                        },
                      },
                    },
                    // Form field wireframes
                    ...buildFormFieldLines(),
                    // Submit button wireframe
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '100px',
                          height: '32px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, rgba(255, 77, 0, 0.3), rgba(255, 140, 66, 0.2))',
                          marginTop: '4px',
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function renderOgImage(
  page: PageMeta,
  fonts: { name: string; data: ArrayBuffer; weight: number; style: string }[],
  logoDataUri: string,
): Promise<Buffer> {
  const jsx = buildOgJsx(page, logoDataUri) as Parameters<typeof satori>[0];

  const svg = await satori(jsx, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: OG_WIDTH },
  });

  return Buffer.from(resvg.render().asPng());
}

// ============================================
// LOGO LOADING
// ============================================

function loadLogoDataUri(root: string): string {
  const logoSvgPath = resolve(root, 'public/logo.svg');
  if (!existsSync(logoSvgPath)) return '';

  const svg = readFileSync(logoSvgPath, 'utf-8');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 88 },
  });
  const png = Buffer.from(resvg.render().asPng());
  return `data:image/png;base64,${png.toString('base64')}`;
}

// ============================================
// FONT LOADING
// ============================================

function loadFonts(root: string): { name: string; data: ArrayBuffer; weight: number; style: string }[] {
  const fontsDir = resolve(root, 'public/fonts');
  const fonts: { name: string; data: ArrayBuffer; weight: number; style: string }[] = [];

  const regularPath = resolve(fontsDir, 'JetBrainsMono-Regular.ttf');
  const mediumPath = resolve(fontsDir, 'JetBrainsMono-Bold.ttf');

  if (existsSync(regularPath)) {
    fonts.push({
      name: 'JetBrains Mono',
      data: readFileSync(regularPath).buffer as ArrayBuffer,
      weight: 400,
      style: 'normal',
    });
  }

  if (existsSync(mediumPath)) {
    fonts.push({
      name: 'JetBrains Mono',
      data: readFileSync(mediumPath).buffer as ArrayBuffer,
      weight: 700,
      style: 'normal',
    });
  }

  return fonts;
}

// ============================================
// VITE PLUGIN
// ============================================

export function ogImagePlugin(): Plugin {
  let contentDir: string;
  let rootDir: string;
  const imageCache = new Map<string, Buffer>();

  return {
    name: 'vite-plugin-og-images',

    configResolved(config) {
      rootDir = config.root;
      contentDir = resolve(config.root, CONTENT_DIR);
    },

    // Dev: serve OG images via middleware
    configureServer(server: ViteDevServer) {
      // Invalidate cache on content changes
      try {
        const watcher = watch(contentDir, { recursive: true }, () => {
          imageCache.clear();
        });
        server.httpServer?.on('close', () => watcher.close());
      } catch {
        // Recursive fs.watch may not be supported on all platforms
      }

      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/og\/(.+)\.png$/);
        if (!match) return next();

        const slug = match[1];

        try {
          if (imageCache.has(slug)) {
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(imageCache.get(slug));
            return;
          }

          const fonts = loadFonts(rootDir);
          const logo = loadLogoDataUri(rootDir);
          let page: PageMeta;

          if (slug === 'default') {
            page = {
              title: 'Dynamic Forms for Angular',
              slug: 'default',
              description: 'Configuration-driven, type-safe, signal-native forms. Build complex forms with minimal code.',
              category: 'ng-forge',
            };
          } else {
            const pages = collectPages(contentDir);
            const found = pages.find((p) => p.slug === slug);
            if (!found) {
              res.statusCode = 404;
              res.end('OG image not found');
              return;
            }
            page = found;
          }

          const png = await renderOgImage(page, fonts, logo);
          imageCache.set(slug, png);

          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(png);
        } catch (err) {
          console.error(`[og-images] Failed to generate image for "${slug}":`, err);
          res.statusCode = 500;
          res.end('Error generating OG image');
        }
      });
    },

    // Build: generate all OG images and emit as assets
    async generateBundle() {
      const fonts = loadFonts(rootDir);
      const logo = loadLogoDataUri(rootDir);
      const pages = collectPages(contentDir);

      // Add default image
      pages.push({
        title: 'Dynamic Forms for Angular',
        slug: 'default',
        description: 'Configuration-driven, type-safe, signal-native forms. Build complex forms with minimal code.',
        category: 'ng-forge',
      });

      console.log(`[og-images] Generating ${pages.length} OG images...`);
      const start = Date.now();

      for (const page of pages) {
        try {
          const png = await renderOgImage(page, fonts, logo);
          this.emitFile({
            type: 'asset',
            fileName: `og/${page.slug}.png`,
            source: png,
          });
        } catch (err) {
          console.warn(`[og-images] Failed to generate image for "${page.slug}":`, err);
        }
      }

      console.log(`[og-images] Generated ${pages.length} images in ${Date.now() - start}ms`);
    },
  };
}
