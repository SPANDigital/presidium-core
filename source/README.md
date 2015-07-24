
# Key Concepts 

XXX is a lightweight documentation framework for software components, systems. The framework provides a default directory structure with pre-formatted files that can be used to create comprehensive documentation for a solution.  

## Standard Structure 
Each XXX site is based on a standard directory structure. Each subsection of the site, listed below, has a index file that may be modified using markdown. Some sections allow for standard "articles" to be added. To add an article create a new file in the section's article directory by copying the template file. The new file will be automatically included next time the site is built.

### Overview Section 
Index File: `/index.md` 

This is the first page a user coming to the site will see. It should contain a brief business-level overview of the solution with an explanation of the main benefits vs alternative solutions.

### Key Concepts Section
Index File: `/key-concepts/index.md`

A single page containing a conceptual description of how the solution works. A description of the key concepts, components, and structures of the solution that detail each component's role and responsibilities. For example; Events, Models and Collections, or, Endpoints, Data-structures and Errors. Each of these concepts may have a sub section in the Reference section where all the details are listed.

* Concepts - A list of concepts with a brief explanation of each concepts purpose, roles and responsibilities 
* Conceptual Diagram - A diagram of the key components, showing their relationships 
* Interaction Diagram - A diagram showing how the components of the solution interact to implement a typical usage scenario

### Prerequisites Section
Index File: `/prerequisites/index.md`

A single page description of the knowledge, skills and components needed to successfully use the solution.
 
* Technical Competencies - Basic technical competencies. skill area and level of expertise
* Component Dependencies - Components that this solution uses or is based on 
* Relevant Standards - Standards that are used by this solution

### Getting Started Section
Index File: `/getting-started/index.md`

A single page describing how to get started using the solution

* Downloading the Code - Where to get the code, how to download and unpack it 
* Instalation - How to install the code, and where to install it.
* Setup and Configuration - How to setup and configure the solution for use
* Confirming it Works - How to confirm the solution is working 

### Typical Usage Scenarios Section
Index File: `/typical-scenarios/index.md`

Article Directory: `/_typical-scenarios` 

Each article explains how the components of the solution work together to enable commonly implemented scenarios, with code examples. These scenarios should provide a good place to start for new users of the system and should guide them to use best practices and avoid common problems. 

* Title - The title should summarize the usage scenario in a single brief sentence  
* Scenario Context - An explanation of the problem the scenario solves and when this approach is indicated 
* Implementation Example - Example code 
* Discussion - A discussion of the scenario and how the solution satisfies the need  
* Conceptual Diagram - If required a diagram illustrating the scenario 

### Best Practices Section
File: `/best-practices/index.md`

Article Directory: `/_best-practices` 

Each article defines one practice you should follow when using this solution. 

* Title - The title should summarize the best practice in a single brief sentence 
* A description of the recommended practice with code examples if required 
* See Also - Links to other articles, areas of the site or other sites  


### Reference Section 
File: `/references/`

Detailed descriptions with code snippets illustrating usage of each part of the solution. Usually arranged by conceptual area. For example; Events, Models and Collections, or, Endpoints, Data-structures and Errors. This is the main technical content of the site.

### Cookbook Section 
File: `/cookbook/index.md`

Article Directory: `/_recipes` 

Each article is a "Recipe" that solves a specific problem or achieves a specific objective 

* Title - The title should summarize the Problem or Objective in a single brief sentence, 
* Solution - An explanation of the solution with code examples 
* Discussion - A discussion of why and how the solution solves the problem or achieves the objective   
* See Also - Links to other articles, areas of the site or other sites  

### Tools Section 
File: `/tools/index.md`

A single page containing a list of supporting tools and services that can be used with this solution 

### Testing & Debugging Section 
File: `/testing/index.md`

A single page that explains how to test the solution and debug problems

* Testing - An explanation of how to test the offerings developed using the solution 
* Debugging - An explanation of how to debug solutions developed using the offering

### Updates Section 
File: `/updates/index.md`

Article Directory: `/_updates` 

Each article is a "Update" that describes a new release, patch or other announcements of interest to the user community

### Contribution Section 
File: `/contribution/index.md`

* Providing Feedback and Reporting Issues - How to report bugs, issues and provide feedback 
* Contributing to Development - Access to source code, if available. 
* Contact Us - How to contact the development team. 
