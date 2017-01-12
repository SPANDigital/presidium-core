# Presidium

Presiduim is a Jekyll based software documentation framework based on industry best practices. 
Presidium allows people who write code to aquire, revise, categorize, utilize and evaluate small 
document fragements and automatically aggregate them into well structured websites using familiar 
tools. 

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
$ jekyll serve -s . -d versions/latest
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
