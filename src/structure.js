const fs = require('fs-extra');
const path = require('path');
const parse = require('./parse');
const structure = module.exports;

structure.TYPE = {
	SECTION: 'section',
	CATEGORY: 'category',
	ARTICLE: 'article'
};

/**
 * Traverses a content directory to generate presidium site structure
 * @param conf site config
 */
structure.generate = function(conf) {
    const structure = {
        sections: []
    };
    conf.sections
        .map((section) => {
            return parse.section(conf, section);
        })
        .map((section) => {
            if (section.url.startsWith('http')) {
                if (conf.scope) {
                    if (section.scope.includes(conf.scope)) {
                        structure.sections.push(section);
                    }
                } else {
                    structure.sections.push(section);
                }
            } else {
                if (!fs.existsSync(section.path)) {
                    throw new Error(`Expected section '${section.title}' not found in: '${section.path}'`);
                }
                if (!section.hideContent) {
                    structure.sections.push(section);
                    traverseArticlesSync(conf, section);
                }
            }
        });
    return structure;
};

function traverseArticlesSync(conf, section) {
    fs.readdirSync(section.path)
        .sort(function(a, b) {
            return b.includes(parse.INDEX_SOURCE);
        })
        .map((filename) => {
            const file = path.join(section.path, filename);
            if (isCategory(file)) {
                const category = parse.category(section, file);
                if (!category.hideContent) {
                    section.children.push(category);
                    traverseArticlesSync(conf, category)
                }
            } else {
                const article = parse.article(conf, section, file);
                if (article.include) {
                    section.children.push(article);
                    section.articles.push(article);
                    addRolesToParents(article);
                    if (conf.includeNestedArticles) {
                        addArticleToParents(section, article);
                    }
                }
            }
        });
}

function isCategory(file) {
	return fs.statSync(file).isDirectory();
}

function addRolesToParents(node) {
	if (node.parent) {
		node.parent.roles = Array.from(new Set([...node.parent.roles, ...node.roles]));
		addRolesToParents(node.parent);
	}
}

function addArticleToParents(node, article) {
	if (node && node.parent) {
		node.parent.articles.push(article);
		addArticleToParents(node.parent, article);
	}
}
