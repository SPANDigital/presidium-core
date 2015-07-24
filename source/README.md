
# Key Concepts 

XXX is a lightweight documentation framework for software components, systems, and solutions. The framework provides a default directory structure with pre-formatted files that can be used to create comprehensive documentation for a solution.  

## Standard Structure 
Each XXX site is based on a standard directory structure. Each subsection of the site, listed below, has a index file that may be modified using markdown. Some sections allow for standard articles to be added. just create a new file in the sections article directory using the standard format and it will be automatically included next time the site is built.

### Overview
Index File: `/index.md` 
A Business level overview of the solution with an explanation of the main benefits vs alternative solutions.

### Key Concepts
Index File: `/key-concepts/index.md`
A conceptual description of how the solution works. A description of the key concepts, components, and structures of the solution that detail each component's role and responsibilities. For example; Events, Models and Collections, or, Endpoints, Data-structures and Errors. Each of these concepts may have a sub section in the Reference section

Conceptual Diagram - A diagram of the key components, showing their relationships 
Interaction Diagram - A diagram showing how the components of the solution interact to implement a typical usage scenario

### Prerequisites
Index File: `/prerequisites/index.md`
A description of the knowledge, skills and components needed to successfully use the solution.
 
* Technical Competencies - Basic technical competencies. skill area and level of expertise
* Component Dependencies - Components that this solution uses or is based on 
* Relevant Standards - Standards that are used by this solution

### Getting started 
Index File: `/getting-started/index.md`
How to get started using the solution

### Typical Usage Scenarios
Index File: `/typical-scenarios/index.md`
Article Directory: `_typical-scenarios` 
An explanation of how the components of the solution work together to enable commonly implemented scenarios, with code examples. These scenarios should provide a good place to start for new users of the system and should guide them to use best practices and avoid common problems. 

### Best Practices
File: `/best-practices/index.md`
Article Directory: `_best-practices` 
Things you should do when using this solution.  

### Reference 
File: `/references/`

Detailed descriptions with code snippets illustrating usage of each part of the solution. Usually arranged by conceptual area. For example; Events, Models and Collections, or, Endpoints, Data-structures and Errors. This is the main technical content of the site.

### Cookbook
File: `cookbook/index.md`

Article Directory: `_recipes` 

A list of Recipes that each solve a problem or achieve a specific objective, in the format: Problem/Objective, Solution, Discussion, See Also

### Tools
File: `/tools/index.md`
Supporting tools and services that can be used with this solution 

### Testing & Debugging
File: `/testing/index.md`
How to test the solution and debug problems

### Updates
File: `/updates/index.md`
Article Directory: `_updates` 
A list of new versions, patches, and other updates 

### Contribution
File: `/contribution/index.md`
How to ask questions, provide feedback, and get involved