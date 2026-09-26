import React, { useState, ReactNode, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Code2, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { IconBrandGithub } from "@tabler/icons-react";
import { Project } from "./ProjectCard";
import BeforeAfterSlider from "./BeforeAfterSlider";
import LazyImage from "./LazyImage";
import { CyberCodeTerminalWindow, CyberCodeWindowChrome } from "./cybercode/CyberCodeUIKit";
import { ProjectModalContext } from "./ProjectModalContext";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

export default function ProjectModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [direction, setDirection] = useState(0);
  // Set while a swipe is in flight so the slide's tap-to-zoom does not fire
  // when the pointer is released at the end of a drag.
  const didDrag = useRef(false);

  useBodyScrollLock(isOpen);

  const hasBeforeAfter = !!(project?.beforeAfter?.before?.image && project?.beforeAfter?.after?.image);
  const totalSlides = (hasBeforeAfter ? 1 : 0) + (project?.images?.length || 0);

  const open = (p: Project, list?: Project[]) => {
    setProject(p);
    setProjectList(list ?? []);
    setActiveIndex(0);
    setDirection(0);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setIsFullscreen(false);
  };

  const paginate = useCallback((newDirection: number) => {
    const hasBeforeAfter = !!(project?.beforeAfter?.before?.image && project?.beforeAfter?.after?.image);
    const totalSlides = (hasBeforeAfter ? 1 : 0) + (project?.images?.length || 0);
    if (totalSlides === 0) return;
    setDirection(newDirection);
    setActiveIndex((prev) => {
      const next = prev + newDirection;
      if (next < 0) return totalSlides - 1;
      if (next >= totalSlides) return 0;
      return next;
    });
  }, [project]);

  const projectIndex = project ? projectList.findIndex((p) => p.slug === project.slug) : -1;
  const hasProjectNav = projectIndex !== -1 && projectList.length > 1;

  const navigateProject = useCallback((newDirection: number) => {
    if (!project) return;
    const currentIndex = projectList.findIndex((p) => p.slug === project.slug);
    if (currentIndex === -1 || projectList.length <= 1) return;
    const nextIndex = (currentIndex + newDirection + projectList.length) % projectList.length;
    setProject(projectList[nextIndex]);
    setActiveIndex(0);
    setDirection(0);
    setIsFullscreen(false);
  }, [project, projectList]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        if (isFullscreen) setIsFullscreen(false);
        else close();
      }
      if (!isFullscreen && e.shiftKey && e.key === "ArrowRight") { navigateProject(1); return; }
      if (!isFullscreen && e.shiftKey && e.key === "ArrowLeft") { navigateProject(-1); return; }
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFullscreen, paginate, navigateProject]);

  // Distance x velocity, so a short flick and a long slow drag both register.
  const SWIPE_THRESHOLD = 10000;
  const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

  // The before/after slide owns its own horizontal drag (the comparison
  // handle), so paging by swipe is disabled there to avoid fighting it.
  const canSwipe = totalSlides > 1 && !(hasBeforeAfter && activeIndex === 0);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <ProjectModalContext.Provider value={{ isOpen, project, open, close }}>
      {children}
      <AnimatePresence>
        {isOpen && project && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="absolute inset-0 bg-background/95"
            />
            
            {hasProjectNav && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateProject(-1); }}
                  aria-label="Previous project"
                  className="hidden lg:flex absolute left-2 xl:left-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-background/60 hover:bg-background/90 border border-white/10 rounded-full transition-all items-center justify-center"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateProject(1); }}
                  aria-label="Next project"
                  className="hidden lg:flex absolute right-2 xl:right-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-background/60 hover:bg-background/90 border border-white/10 rounded-full transition-all items-center justify-center"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <motion.div
              key={project.slug}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl max-h-[90dvh] bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
            >
              {/* Terminal View Chrome */}
              <CyberCodeWindowChrome
                title={`${project.slug}.${project.extension || "sh"}`}
                icon={<Code2 className="w-4 h-4 text-accent" />}
                showDots={true}
                onDotClick={close}
              />

              {hasProjectNav && (
                <div className="flex lg:hidden items-center justify-between border-b border-border bg-white/5 px-4 py-2">
                  <button
                    onClick={() => navigateProject(-1)}
                    className="flex items-center gap-1 text-xs font-mono text-muted hover:text-accent transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </button>
                  <span className="text-[10px] font-mono text-muted/60">
                    {projectIndex + 1} / {projectList.length}
                  </span>
                  <button
                    onClick={() => navigateProject(1)}
                    className="flex items-center gap-1 text-xs font-mono text-muted hover:text-accent transition-colors"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                {/* Image Section */}
                <div className="shrink-0 md:shrink md:w-3/5 min-h-0 bg-muted/20 relative overflow-hidden flex flex-col border-b md:border-b-0 md:border-r border-border">
                  <div className="aspect-video max-h-[40dvh] md:aspect-auto md:max-h-none md:flex-1 md:min-h-0 relative overflow-hidden group">
                    <AnimatePresence initial={false} custom={direction}>
                      <motion.div
                        key={activeIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { type: "spring", stiffness: 300, damping: 30 },
                          opacity: { duration: 0.2 }
                        }}
                        drag={canSwipe ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.18}
                        onDragStart={() => { didDrag.current = true; }}
                        onDragEnd={(_, { offset, velocity }) => {
                          const swipe = swipePower(offset.x, velocity.x);
                          if (swipe < -SWIPE_THRESHOLD) paginate(1);
                          else if (swipe > SWIPE_THRESHOLD) paginate(-1);
                          // Outlast the click that follows the pointer release.
                          window.setTimeout(() => { didDrag.current = false; }, 0);
                        }}
                        className={`absolute inset-0 ${canSwipe ? "touch-pan-y" : ""}`}
                      >
                        {hasBeforeAfter && activeIndex === 0 ? (
                          <div className="w-full h-full relative p-6 flex items-center justify-center bg-muted/10">
                            <BeforeAfterSlider 
                              beforeImage={project.beforeAfter!.before.image!}
                              afterImage={project.beforeAfter!.after.image!}
                              className="w-full h-full"
                            />
                          </div>
                        ) : project.images?.[activeIndex - (hasBeforeAfter ? 1 : 0)] ? (
                          <div
                            className="w-full h-full relative cursor-zoom-in"
                            onClick={() => { if (!didDrag.current) setIsFullscreen(true); }}
                          >
                            {/* We only use layoutId for the image that is NOT currently being animated out */}
                            <LazyImage
                              layoutId={!isFullscreen ? `project-image-${project.slug}-${activeIndex}` : undefined}
                              src={project.images[activeIndex - (hasBeforeAfter ? 1 : 0)].src}
                              alt={project.title}
                              className="w-full h-full"
                              imgClassName="w-full h-full object-contain"
                              priority={true}
                            />
                            {project.images[activeIndex - (hasBeforeAfter ? 1 : 0)].label && (
                              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold uppercase tracking-wider border border-white/20">
                                {project.images[activeIndex - (hasBeforeAfter ? 1 : 0)].label}
                              </span>
                            )}
                            {/* Expand Button */}
                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsFullscreen(true);
                                }}
                                className="p-3 bg-black border border-white/50 rounded-xl text-white shadow-none hover:scale-110 transition-transform flex items-center gap-2"
                              >
                                <Maximize2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <Code2 className="w-32 h-32" />
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows (Desktop) */}
                    {totalSlides > 1 && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/60 hover:bg-background/80 border border-white/10 rounded-full transition-all opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); paginate(1); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/60 hover:bg-background/80 border border-white/10 rounded-full transition-all opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail bar */}
                  {totalSlides > 1 && (
                    <div className="flex gap-2 p-4 border-t border-border overflow-x-auto bg-background/50 shrink-0">
                      {hasBeforeAfter && (
                        <button
                          key="before-after-thumb"
                          onClick={() => {
                            setDirection(0 > activeIndex ? 1 : -1);
                            setActiveIndex(0);
                          }}
                          className={`relative w-20 aspect-video rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                            activeIndex === 0 ? "border-accent scale-95" : "border-border/50 hover:border-border scale-100"
                          }`}
                        >
                          <LazyImage src={project.beforeAfter!.after.image!} alt="Diff Preview" className="w-full h-full" imgClassName="w-full h-full object-cover" />
                          <span className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-accent/90 text-white text-[7px] font-bold uppercase tracking-wider text-center truncate">
                            Diff
                          </span>
                        </button>
                      )}
                      {project.images?.map((img, idx) => {
                        const slideIdx = idx + (hasBeforeAfter ? 1 : 0);
                        return (
                          <button
                            key={img.src}
                            onClick={() => {
                              setDirection(slideIdx > activeIndex ? 1 : -1);
                              setActiveIndex(slideIdx);
                            }}
                            className={`relative w-20 aspect-video rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                              slideIdx === activeIndex ? "border-accent scale-95" : "border-border/50 hover:border-border scale-100"
                            }`}
                          >
                            <LazyImage src={img.src} alt="" className="w-full h-full" imgClassName="w-full h-full object-cover" />
                            {img.label && (
                              <span className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-black/70 text-white text-[7px] font-bold uppercase tracking-wider text-center truncate">
                                {img.label}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="md:w-2/5 min-h-0 p-[6px] overflow-y-auto flex flex-col">
                  <div className="space-y-4 flex-1">
                      <CyberCodeTerminalWindow title="details.data" showDots={false}>
                        <div className="font-mono text-sm space-y-2">
                          <div>
                            <span className="text-muted">Title:</span> <span className="text-foreground font-bold">{project.title}</span>
                          </div>
                          {project["public-url"] && (
                            <div className="truncate">
                              <span className="text-muted">URL:</span>{" "}
                              <a
                                href={project["public-url"]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline"
                              >
                                {project["public-url"]}
                              </a>
                            </div>
                          )}
                          <div>
                            <span className="text-muted">Date:</span> <span className="text-accent">{project.date || project.year}</span>
                          </div>
                          <div className="pt-2 border-t border-border/30">
                            <span className="text-muted block mb-1">Desc:</span>
                            <p className="text-muted leading-relaxed">{project.description}</p>
                          </div>
                        </div>
                      </CyberCodeTerminalWindow>
                      {(project["public-url"] || project["original-url"] || project.links) && (
                        <CyberCodeTerminalWindow title="source.links" showDots={false}>
                          <div className="flex flex-wrap gap-2">
                            {project["public-url"] && project.slug !== "corbinmeier-net" && (
                              <a
                                href={project["public-url"]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-mini"
                                style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                              >
                                {project["original-url"] ? "Live Site" : "View"}
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            {project["original-url"] && (
                              <a
                                href={project["original-url"]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-mini"
                                style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                              >
                                Original
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            {project["original-url"] &&
                              project["public-url"]?.includes("github.com") && (
                                <a
                                  href={project["public-url"]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-mini"
                                  style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                                >
                                  Source
                                  <IconBrandGithub className="w-2.5 h-2.5" />
                                </a>
                              )}
                            {project.links && project.links.map((link, idx) => (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-mini"
                                style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                              >
                                {link.label}
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ))}
                          </div>
                        </CyberCodeTerminalWindow>
                      )}
                      {project.skills && (
                        <CyberCodeTerminalWindow title="stack.env" showDots={false}>
                          <div className="overflow-hidden w-full relative">
                             <style>{`
                               @keyframes cc-marquee {
                                 0% { transform: translateX(0); }
                                 100% { transform: translateX(-33.333%); }
                               }
                               .cc-marquee-inner {
                                 display: flex;
                                 gap: 8px;
                                 width: max-content;
                                 animation: cc-marquee 20s linear infinite;
                               }
                               .cc-marquee-inner:hover {
                                 animation-play-state: paused;
                               }
                             `}</style>
                             <div className="overflow-hidden w-full py-0.5">
                               <div className="cc-marquee-inner flex items-center">
                                  {[...project.skills, ...project.skills, ...project.skills].map((skill, idx) => (
                                    <React.Fragment key={`${skill}-${idx}`}>
                                      {idx > 0 && <span className="text-muted/40 px-1 font-mono text-xs">|</span>}
                                      <span className="py-1 text-xs font-mono text-muted-foreground whitespace-nowrap flex-shrink-0">
                                        {skill}
                                      </span>
                                    </React.Fragment>
                                  ))}
                               </div>
                             </div>
                          </div>
                        </CyberCodeTerminalWindow>
                      )}

                      {project.body && (
                        <CyberCodeTerminalWindow title="context.md" showDots={false}>
                          <div 
                             className="text-sm text-muted leading-relaxed prose prose-invert prose-sm max-w-none"
                             dangerouslySetInnerHTML={{ __html: project.body }}
                          />
                        </CyberCodeTerminalWindow>
                      )}

                      {project.beforeAfter && (
                        <CyberCodeTerminalWindow title="transformation.diff" showDots={false}>
                           <div className="grid grid-cols-1 gap-4">
                              <div className="p-4 rounded-none bg-red-500/5 border border-red-500/80">
                                 <span className="text-[9px] font-bold uppercase tracking-widest text-red-500/80 mb-2 block">Before</span>
                                 <h5 className="text-sm font-medium mb-1">{project.beforeAfter.before.title}</h5>
                                 <p className="text-xs text-muted leading-relaxed">{project.beforeAfter.before.description}</p>
                              </div>
                              <div className="p-4 rounded-none bg-accent/5 border border-accent">
                                 <span className="text-[9px] font-bold uppercase tracking-widest text-accent mb-2 block">After</span>
                                 <h5 className="text-sm font-medium mb-1">{project.beforeAfter.after.title}</h5>
                                 <p className="text-xs text-muted leading-relaxed">{project.beforeAfter.after.description}</p>
                              </div>
                           </div>
                        </CyberCodeTerminalWindow>
                      )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isFullscreen && project && project.images && (!hasBeforeAfter || activeIndex !== 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12 overflow-hidden"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div 
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <LazyImage
                layoutId={`project-image-${project.slug}-${activeIndex}`}
                src={project.images[activeIndex - (hasBeforeAfter ? 1 : 0)].src}
                alt={project.title}
                className="w-full h-full"
                imgClassName="w-full h-full object-contain rounded-sm cursor-zoom-out"
                onClick={() => setIsFullscreen(false)}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                priority={true}
              />

              {project.images[activeIndex - (hasBeforeAfter ? 1 : 0)]?.label && (
                <span className="absolute top-6 left-6 px-2 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold uppercase tracking-wider border border-white/20">
                  {project.images[activeIndex - (hasBeforeAfter ? 1 : 0)].label}
                </span>
              )}
              
              {/* Close Button Fullscreen */}
              <button 
                onClick={() => setIsFullscreen(false)}
                className="absolute top-0 right-0 p-4 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Navigation Arrows Fullscreen */}
              {totalSlides > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-6 text-white/20 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-12 h-12" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); paginate(1); }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-6 text-white/20 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-12 h-12" />
                  </button>
                </>
              )}

              {/* Index Indicator */}
              <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center gap-2 text-white/40 font-mono text-xs tracking-widest uppercase">
                {activeIndex + 1} / {totalSlides}
                {project.images[activeIndex - (hasBeforeAfter ? 1 : 0)]?.label && (
                  <span className="text-white/70">- {project.images[activeIndex - (hasBeforeAfter ? 1 : 0)].label}</span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProjectModalContext.Provider>
  );
}
