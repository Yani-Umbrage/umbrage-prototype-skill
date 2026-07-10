// TEMPLATE - scaffolded by the umbrage-prototype skill, not yet published to a real Figma file.
//
// Copy this into `libs/ui-components/src/lib/badge/badge.figma.tsx` in an engagement's cloned
// prototype repo (never into the shared nestjs-react-starter starter kit) the first time that
// engagement sets up Code Connect. See `references/figma-sync.md` for the discovery and publish
// steps that fill in the node ID below and push this to Figma.
//
// STATUS: props match the real component (color, icon, iconPosition, text - see
// libs/ui-components/src/lib/badge/badge.tsx). The `size` mapping's Figma-side keys ('sm', 'md')
// are confirmed against the actual V2.2 Figma starter kit's variant labels (2026-07-10, verified
// directly via the Figma MCP - every Badge variant instance in the file is literally named
// "Size=sm" / "Size=md"). REPLACE_NODE_ID has never been resolved against a real Figma file and
// `npx @figma/code-connect publish` has never been run for it. Run the discovery command in
// figma-sync.md against your client's duplicated V2.2 file to get the real node ID before
// publishing.
//
// UPDATE (2026-07-10): the code-side rename landed. `badge.tsx` on
// Umbrage-Studios/nestjs-react-starter's `josh/feat/adk-2.2` branch (verified directly at commit
// 4773002, PR #229 "feat: ADK 2.2 merge to main", open, not yet merged to main as of this writing)
// now defines `BadgeSize { Medium = 'md', Small = 'sm' }` - the old `Regular` member was renamed to
// `Medium` and both members' underlying values changed to match Figma. It's still an enum, not a
// flat string type - `size={BadgeSize.Medium}` / `size={BadgeSize.Small}` in code, same as before,
// just the member name and value changed. The color token class names in badge.tsx were NOT
// changed by this PR (still the older `infomation`/`default`/`error`/`secondary` keys) - the
// "reconciled color tokens" claim only applies to the values matching Figma (confirmed earlier),
// not to the class-name keys badge.tsx actually references.
//
// Use this file as the reference structure for mapping any other component - figma-sync.md points
// here from its "Adding a new component" section.

import figma from '@figma/code-connect';
import { Badge, BadgeColor, BadgeSize, BadgeIconPosition } from './badge';

figma.connect(Badge, 'REPLACE_NODE_ID', {
  props: {
    text: figma.string('Text'),
    // Figma's variant labels are 'sm'/'md', matching the code enum's values one-to-one now that
    // BadgeSize.Regular was renamed to BadgeSize.Medium (2026-07-10, see STATUS above).
    size: figma.enum('Size', {
      sm: BadgeSize.Small,
      md: BadgeSize.Medium,
    }),
    // BadgeColor has no "Error" value - if the Figma component has an "Error" variant, map it to
    // BadgeColor.Alert, don't add a new enum value to match Figma. See SKILL.md's component rules.
    color: figma.enum('Color', {
      Information: BadgeColor.Information,
      Success: BadgeColor.Success,
      Warning: BadgeColor.Warning,
      Alert: BadgeColor.Alert,
      Neutral: BadgeColor.Neutral,
    }),
    iconPosition: figma.enum('Icon Position', {
      Leading: BadgeIconPosition.Leading,
      Trailing: BadgeIconPosition.Trailing,
    }),
  },
  example: ({ text, size, color, iconPosition }) => (
    <Badge text={text} size={size} color={color} iconPosition={iconPosition} />
  ),
});
