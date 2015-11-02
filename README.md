# Corpus -- A Solution Documentation Framework

Corpus is a lightweight documentation framework for software components, systems, and solutions. The framework uses technologies already familiar to most developers and is open to extension and enhancement.  

Corpus provides a directory structure that contains Markdown templates that are configured for processing with Jekyll. This combination produces software documentation that is logically structured, follows industry best practices, and is easily maintained and extended by developers. You may pick which sections you wish to complete and if require, add more sections. 

The content is formatted with Markdown and stored in a GitHub repository. The use of GitHub and Markdown provides simple markup language and a comprehensive version control system that is already familiar to  most developers. 

This open approach permits easy integration with other automatic documentation generation systems such as Swagger.

As Jekyll creates static websites, the user will find it easy to configure the system for offline use and local proofing of changes 

## Prerequisites

The system requires or uses the following technologies:

* [GitHub](https://github.com/) a web-based Git repository hosting service, which offers all of the distributed revision control and source code management functionality of Git as well as adding its own features. 
* [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/) GitHub Flavored Markdown differs from standard Markdown in a few significant ways, and adds some additional functionality.
* [Jekyll](http://jekyllrb.com/) a simple, blog-aware, static site generator that is tightly coupled with GitHub
* [Sass](http://sass-lang.com/) a CSS extension language

## Getting Started 

1. Download and install [Jekyll](http://jekyllrb.com/).
2. In GitHub online, clone the repository.
3. To view the site locally, run Jekyll in the local repository's root directory.
```
$ jekyll serve -s source -d versions/latest
```
4. View the site in a local browser at http://127.0.0.1:4000/.
5. Edit the site using [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/) as needed.

## Usage 

### Syntax Highlighting 

Corpus uses [prism.js](http://prismjs.com/) to handle all code highlighting. 

To use prism, use the normal [fenced code blocks](https://help.github.com/articles/github-flavored-markdown/#fenced-code-blocks) as in Github Flavored Markdown. 

To specify a language, add the language after the first set of backticks. (See below.)
 
  \`\`\`javascript
  
      function foo(){
      
      }
     
  \`\`\`
  
For a full list of supported languages, see [http://prismjs.com/#languages-list](http://prismjs.com/#languages-list).