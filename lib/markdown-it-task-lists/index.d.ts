import MarkdownIt from 'markdown-it';
interface TaskListsOptions {
    enabled: boolean;
    label: boolean;
    labelAfter: boolean;
    lineNumber: boolean;
}
export default function markdownItTaskLists(md: MarkdownIt, options?: TaskListsOptions): void;
export {};
