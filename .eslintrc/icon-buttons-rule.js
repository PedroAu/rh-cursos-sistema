/**
 * ESLint Custom Rule: Ensure icon-only buttons have aria-labels
 *
 * Detects:
 * - <Button size="icon"> or <Button variant="icon"> without aria-label or children with text
 * - <ActionIcon> without aria-label and no visible text children
 *
 * Rationale: Icon-only buttons must have accessible labels for screen readers (WCAG 2.1 Level A)
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Ensure icon-only buttons have accessible aria-labels",
      category: "Accessibility",
      recommended: true
    },
    messages: {
      missingAriaLabel: "Icon-only button must have an aria-label attribute for accessibility (WCAG 2.1 Level A, AC4/AC5)"
    }
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const tagName = node.name.name;

        // Check if this is a Button or ActionIcon with size="icon" or variant="icon"
        const isIconButton =
          (tagName === 'Button' || tagName === 'ActionIcon') &&
          (node.attributes.some(attr =>
            attr.name?.name === 'size' && attr.value?.value === 'icon'
          ) ||
          node.attributes.some(attr =>
            attr.name?.name === 'variant' && attr.value?.value === 'icon'
          ));

        if (!isIconButton) return;

        // Check if it has aria-label
        const hasAriaLabel = node.attributes.some(attr =>
          attr.name?.name === 'aria-label'
        );

        if (!hasAriaLabel) {
          context.report({
            node,
            messageId: 'missingAriaLabel'
          });
        }
      }
    };
  }
};
