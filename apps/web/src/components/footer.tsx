import { Github, Twitter } from "lucide-react";

import { SITE_LINKS } from "@/lib/consts";

const links = [
  { name: "GitHub", href: SITE_LINKS.github, icon: Github },
  { name: "Author", href: SITE_LINKS.author, icon: Twitter },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-8">
        <div className="font-mono text-[10px] text-muted-foreground">
          {"// "} opensec.sh — {new Date().getFullYear()}
        </div>

        <div className="flex items-center gap-5">
          {links.map((link) => (
            <a
              key={link.name}
              className="group flex items-center gap-2 font-mono text-xs text-muted-foreground transition-all duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              href={link.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              <link.icon size={14} />
              <span>{link.name}</span>
              <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {"->"}
              </span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
