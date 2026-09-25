/**
 * The skillset, as data.
 *
 * Read by the About page, which draws it as the Skillset cloud, and by the
 * Quick Search bar (Footer.astro), which sends a query that names a skill to
 * About's Skillset instead of to /projects. One list, so the two cannot
 * disagree about what counts as a skill.
 */
export interface SkillGroup {
  category: string;
  skills: { name: string; level: string }[];
}

export const skillsets: SkillGroup[] = [
  {
    category: "Languages",
    skills: [
      { name: "Hindi", level: "(Native)" },
      { name: "Marathi", level: "(Native)" },
      { name: "English", level: "(Fluent)" }
    ]
  },
  /* Grouped by discipline rather than one flat list: the profile spans
     architecture, graphics, web and AI, and a recruiter scanning for one
     competency should find it in a single block. Within each group the
     order is Expert -> Intermediate -> Basic, so the strongest tool leads. */
  {
    category: "BIM, Drafting & GIS",
    skills: [
      { name: "AutoCAD", level: "(Expert)" },
      { name: "Revit", level: "(Intermediate)" },
      { name: "Autodesk Forma", level: "(Intermediate)" },
      { name: "ArcGIS", level: "(Intermediate)" }
    ]
  },
  {
    category: "Modelling, Parametric & Fabrication",
    skills: [
      { name: "SketchUp", level: "(Expert)" },
      { name: "CNC Fabrication", level: "(Expert)" },
      { name: "3D Printing", level: "(Expert)" },
      { name: "Rhinoceros 3D", level: "(Intermediate)" },
      { name: "Fusion 360", level: "(Intermediate)" },
      { name: "Grasshopper", level: "(Basic)" },
      { name: "Blender", level: "(Basic)" },
      { name: "SolidWorks", level: "(Basic)" }
    ]
  },
  {
    category: "Visualisation & Real-Time",
    skills: [
      { name: "Lumion", level: "(Expert)" },
      { name: "Enscape", level: "(Expert)" },
      { name: "D5 Render", level: "(Expert)" },
      { name: "V-Ray", level: "(Intermediate)" },
      { name: "Unreal Engine", level: "(Basic)" }
    ]
  },
  {
    category: "Graphic & Web Design",
    skills: [
      { name: "Canva", level: "(Expert)" },
      { name: "Figma", level: "(Expert)" },
      { name: "Webflow", level: "(Expert)" },
      { name: "Adobe Illustrator", level: "(Intermediate)" },
      { name: "Adobe Photoshop", level: "(Intermediate)" },
      { name: "Adobe InDesign", level: "(Intermediate)" },
      { name: "Framer", level: "(Basic)" }
    ]
  },
  {
    category: "AI, Code & Workflow",
    skills: [
      { name: "Notion", level: "(Expert)" },
      { name: "Miro", level: "(Expert)" },
      { name: "Microsoft Office", level: "(Expert)" },
      { name: "Claude", level: "(Intermediate)" },
      { name: "ComfyUI", level: "(Intermediate)" },
      { name: "HTML & CSS", level: "(Basic)" },
      { name: "JavaScript", level: "(Basic)" },
      { name: "Python", level: "(Basic)" }
    ]
  }
];


/**
 * True when a query names a skill or a skill group — the same substring
 * match About's own Skillset search uses, over the name and the group only.
 * The level ("(Expert)") is left out: "expert" is not a skill.
 */
export function matchesSkill(query: string, groups: SkillGroup[] = skillsets): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return groups.some(g =>
    g.category.toLowerCase().includes(q) ||
    g.skills.some(sk => sk.name.toLowerCase().includes(q))
  );
}
