/**
 * Skill Dictionary & Extraction Utility
 * Aligned with the backend ATS skill extraction dictionary.
 */

export const SKILL_DICTIONARY = [
  "Java", "Spring Boot", "Spring", "React", "Angular", "Node.js", "Express",
  "Python", "Django", "Flask", "Ruby on Rails", "Ruby", "C++", "C#", ".NET", "Go",
  "Rust", "PHP", "Laravel", "Vue.js", "JavaScript", "TypeScript", "HTML", "CSS",
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "NoSQL", "Redis", "Elasticsearch", "Kafka",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins", "CI/CD",
  "Git", "GitHub", "Linux", "Bash", "Agile", "Scrum", "Microservices", "REST API",
  "GraphQL", "Hibernate", "JPA", "JUnit", "Mockito", "System Design"
];

/**
 * Extracts recognized technical skills from text using regex boundary matching
 * @param {string} text - Job description or resume text
 * @returns {string[]} Array of matching formatted skill names
 */
export function extractSkills(text) {
  if (!text || typeof text !== "string") return [];

  const lower = text.toLowerCase();
  const matched = [];

  for (const skill of SKILL_DICTIONARY) {
    const s = skill.toLowerCase();
    // Escape special regex characters like +, ., #
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");

    if (regex.test(lower)) {
      matched.push(skill);
    }
  }

  return matched;
}
