// Markdown-it plugin to render GitHub-style task lists; see
//
// https://github.com/blog/1375-task-lists-in-gfm-issues-pulls-comments
// https://github.com/blog/1825-task-lists-in-all-markdown-documents
import Token from 'markdown-it/lib/token';
export default function markdownItTaskLists(md, options) {
    if (options === void 0) { options = { enabled: false, label: false, labelAfter: false, lineNumber: false }; }
    md.core.ruler.after('inline', 'github-task-lists', function (state) {
        var tokens = state.tokens;
        for (var i = 2; i < tokens.length; i++) {
            if (isTodoItem(tokens, i)) {
                // todoify(tokens[i], options);
                attrSet(tokens[i - 2], 'class', 'task-list-item' + (options.enabled ? ' enabled' : ''));
                attrSet(tokens[parentToken(tokens, i - 2)], 'class', 'contains-task-list');
            }
        }
        return false;
    });
}
function attrSet(token, name, value) {
    var index = token.attrIndex(name);
    var attr = [name, value];
    if (index < 0) {
        token.attrPush(attr);
    }
    else {
        if (token.attrs == null) {
            token.attrs = [];
        }
        token.attrs[index] = attr;
    }
}
function parentToken(tokens, index) {
    var targetLevel = tokens[index].level - 1;
    for (var i = index - 1; i >= 0; i--) {
        if (tokens[i].level === targetLevel) {
            return i;
        }
    }
    return -1;
}
function isTodoItem(tokens, index) {
    return isInline(tokens[index]) &&
        isParagraph(tokens[index - 1]) &&
        isListItem(tokens[index - 2]) &&
        startsWithTodoMarkdown(tokens[index]);
}
function todoify(token, options) {
    if (token.children == null)
        return;
    token.children.unshift(makeCheckbox(token, options));
    token.children[1].content = token.children[1].content.slice(3);
    token.content = token.content.slice(3);
    if (options.label) {
        if (options.labelAfter) {
            token.children.pop();
            // Use large random number as id property of the checkbox.
            var id = "task-item-" + Math.ceil(Math.random() * (10000 * 1000) - 1000);
            token.children[0].content = token.children[0].content.slice(0, -1) + ' id="' + id + '">';
            token.children.push(afterLabel(token.content, id));
        }
        else {
            token.children.unshift(beginLabel());
            token.children.push(endLabel());
        }
    }
}
function makeCheckbox(token, options) {
    var checkbox = new Token('html_inline', '', 0);
    var disabledAttr = !options.enabled ? ' disabled="" ' : '';
    var dataLine = options.lineNumber ? (token.map ? "data-line=\"" + token.map[0] + "\"" : 'data-line=""') : '';
    if (token.content.indexOf('[ ] ') === 0) {
        checkbox.content = "<input class=\"task-list-item-checkbox\" " + disabledAttr + " type=\"checkbox\" " + dataLine + "\">";
    }
    else if (token.content.indexOf('[x] ') === 0 || token.content.indexOf('[X] ') === 0) {
        checkbox.content = "<input class=\"task-list-item-checkbox\" checked=\"\" " + disabledAttr + " type=\"checkbox\" " + dataLine + ">";
    }
    return checkbox;
}
// these next two functions are kind of hacky; probably should really be a
// true block-level token with .tag=='label'
function beginLabel() {
    var token = new Token('html_inline', '', 0);
    token.content = '<label>';
    return token;
}
function endLabel() {
    var token = new Token('html_inline', '', 0);
    token.content = '</label>';
    return token;
}
function afterLabel(content, id) {
    var token = new Token('html_inline', '', 0);
    token.content = "<label class=\"task-list-item-label\" for=\"" + id + "\">" + content + "</label>";
    token.attrs = [['for', 'id']];
    return token;
}
function isInline(token) {
    return token.type === 'inline';
}
function isParagraph(token) {
    return token.type === 'paragraph_open';
}
function isListItem(token) {
    return token.type === 'list_item_open';
}
function startsWithTodoMarkdown(token) {
    // leading whitespace in a list item is already trimmed off by markdown-it
    return token.content.indexOf('[ ] ') === 0 || token.content.indexOf('[x] ') === 0 || token.content.indexOf('[X] ') === 0;
}
