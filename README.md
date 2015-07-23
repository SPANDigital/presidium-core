# XXX - A Solution Documentation Framework

XXX is a lightweight documentation framework for software components, systems, and solutions. The framework uses technologies already familiar to most developers and is open to extension and enhancement.  

The framework provides a directory structure containing markdown templates configured for processing with Jekyll. This combination produces software documentation that is logically structured, follows industry best practices and is easily maintained and extended by developers. You may pick which sections you wish to complete and may add more sections if required. 

The content is formatted with markdown and stored in a github repository. The use of github and markdown provides simple markup language and a comprehensive version control system, that is already familiar to  most developers. 

This open approach permits easy integration with other automatic documentation generation systems such as ....

As jekyll creates static websites, user will find it easy to configure the system for offline use and local proofing of changes 

## Prerequisites

The system requires or uses the following technologies

* [Github](https://github.com/) a web-based Git repository hosting service, which offers all of the distributed revision control and source code management functionality of Git as well as adding its own features. 
* [Github flavored markdown](https://help.github.com/articles/github-flavored-markdown/) GitHub Flavored Markdown differs from standard Markdown in a few significant ways, and adds some additional functionality.
* [Jekyll](http://jekyllrb.com/) a simple, blog-aware, static site generator that is tightly coupled with github.
* [Sass](http://sass-lang.com/) a CSS extension language.


## Getting Started 

1. Download and install [Jekyll](http://jekyllrb.com/) 
2. Clone the respository 
3. Run jekyll in the repositories root directory 
```
$ jekyll serve -s source -d snapshots/latest
```
4. View the site locally in a browser at http://127.0.0.1:4000/ 
5. Edit the site using [Github flavored markdown](https://help.github.com/articles/github-flavored-markdown/) as needed

