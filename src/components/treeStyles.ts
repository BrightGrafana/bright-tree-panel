import { css } from '@emotion/css';

export const treeViewClass = css`
  overflow: auto;
  width: 100%;
  height: 100%;
  white-space: nowrap;
  padding: 4px;

  .content {
    padding-top: 0;
    padding-bottom: 0;
  }
`;

export const tableGridLinesClass = 'grid-lines';
export const tableNoGridLinesClass = 'no-grid-lines';
export const tableCompactModeClass = 'compact-mode';
export const tableHasIconContentClass = 'has-icon-content';
export const tableHasParentIconContentClass = 'has-parent-icon-content';

export const iconContentClass = 'iconContent';
export const iconSlotClass = 'iconSlot';
export const parentIconContentClass = 'parentIconContent';
export const parentIconSlotClass = 'parentIconSlot';

export const disabledNodeClass = css`
  opacity: 0.5;
  pointer-events: none;

  svg {
    pointer-events: all;
  }
`;

export const selectedNodeClass = css`
  background-color: rgba(25, 118, 210, 0.08);
  font-weight: 800;
`;

export const activeNodeClass = css`
  background-color: rgba(25, 118, 210, 0.3);
`;

export const mappedValueClass = css`
  display: inline-block !important;

  span {
    display: inline-block !important;
    color: inherit !important;
  }
`;

export const mappedValueInnerClass = css`
  display: inline-block !important;
  color: inherit;

  &[data-has-color='true'] {
    color: var(--value-color) !important;
  }

  &[style*='--value-color'] {
    color: var(--value-color) !important;
  }
`;

export const tableClass = css`
  --value-color: #cc00ff;
  width: calc(100vw - (100vw - 100%));

  &.${tableGridLinesClass} {
    border-collapse: collapse;
  }

  &.${tableGridLinesClass} th,
  &.${tableGridLinesClass} td {
    border: 1px solid #ddd;
    padding: 4px;
  }

  &.${tableNoGridLinesClass} th,
  &.${tableNoGridLinesClass} td {
    border-color: transparent !important;
  }

  &.${tableCompactModeClass} th,
  &.${tableCompactModeClass} td {
    padding: 1px;
  }

  a {
    color: rgb(110, 159, 255);
  }

  a:hover {
    text-decoration: underline;
    color: rgb(110, 159, 255);
  }

  th {
    font-weight: bold;
  }

  tr {
    cursor: pointer;
  }

  &:not(.${tableHasParentIconContentClass}) .${parentIconSlotClass} {
    display: none;
  }

  &:not(.${tableHasIconContentClass}) .${iconSlotClass} {
    display: none;
  }

  tr:hover {
    background-color: rgba(25, 118, 210, 0.08);
  }

  tr:focus,
  tr:focus-visible {
    outline: none;
  }

  td .${mappedValueClass} .${mappedValueInnerClass} {
    display: inline-block !important;
  }

  td .${mappedValueClass} .${mappedValueInnerClass}[style*='--value-color'] {
    color: var(--value-color) !important;
  }

  *[tabindex='-1']:focus + span,
  *[tabindex='-1']:focus-visible + span {
    outline: none !important;
    box-shadow: none !important;
    transition: none !important;
  }
`;